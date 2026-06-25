"""Telegram бот для анализа данных — принимает CSV/JSON и даёт инсайты через Claude."""
from __future__ import annotations

import asyncio
import csv
import io
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, Document
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

SYSTEM = """Ты — аналитик данных. Анализируешь данные и даёшь бизнес-инсайты.

Когда получаешь данные:
1. Опиши структуру (кол-во строк, столбцы, типы данных)
2. Найди ключевые метрики (min/max/avg для числовых)
3. Выдели топ-3 инсайта
4. Предложи конкретные действия на основе данных

Отвечай структурировано, используй эмодзи для наглядности.
Если данных нет — попроси загрузить файл (.csv или .json) или вставить данные текстом."""


def parse_csv(content: str) -> tuple[list[str], list[dict]]:
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    return reader.fieldnames or [], rows


def summarize_data(headers: list[str], rows: list[dict], max_rows: int = 20) -> str:
    sample = rows[:max_rows]
    return (
        f"Столбцы: {', '.join(headers)}\n"
        f"Всего строк: {len(rows)}\n"
        f"Первые {min(len(rows), max_rows)} строк:\n"
        + json.dumps(sample, ensure_ascii=False, indent=2)
    )


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=1500)

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "📊 *Analytics Bot*\n\n"
            "Загрузите файл данных (.csv или .json) или вставьте данные текстом — "
            "я проанализирую и дам инсайты.\n\n"
            "Или просто напишите вопрос об анализе данных!",
            parse_mode="Markdown",
        )

    @dp.message(F.document)
    async def handle_file(msg: Message) -> None:
        doc: Document = msg.document
        if not doc.file_name:
            await msg.answer("⚠️ Не удалось определить имя файла.")
            return

        ext = doc.file_name.lower().split(".")[-1]
        if ext not in ("csv", "json"):
            await msg.answer("⚠️ Поддерживаются только .csv и .json файлы.")
            return

        await msg.answer("⏳ Загружаю и анализирую файл...")

        file = await bot.get_file(doc.file_id)
        file_bytes = await bot.download_file(file.file_path)
        content = file_bytes.read().decode("utf-8", errors="replace")

        if ext == "csv":
            try:
                headers, rows = parse_csv(content)
                data_summary = summarize_data(headers, rows)
            except Exception as e:
                await msg.answer(f"❌ Ошибка парсинга CSV: {e}")
                return
        else:
            try:
                data = json.loads(content)
                if isinstance(data, list):
                    rows_preview = data[:20]
                elif isinstance(data, dict):
                    rows_preview = [data]
                else:
                    rows_preview = [{"value": str(data)}]
                data_summary = f"JSON данные ({len(str(data))} символов):\n{json.dumps(rows_preview, ensure_ascii=False, indent=2)}"
            except Exception as e:
                await msg.answer(f"❌ Ошибка парсинга JSON: {e}")
                return

        prompt = f"Файл: {doc.file_name}\n\n{data_summary}\n\nПроанализируй эти данные и дай инсайты."
        response = ai.ask(msg.from_user.id, prompt)
        await msg.answer(f"📈 *Анализ {doc.file_name}*\n\n{response}", parse_mode="Markdown")

    @dp.message()
    async def chat(msg: Message) -> None:
        response = ai.ask(msg.from_user.id, msg.text or "")
        await msg.answer(response)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
