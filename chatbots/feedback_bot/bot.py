"""Telegram бот для сбора отзывов с AI-классификацией тональности."""
from __future__ import annotations

import asyncio
import json
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config
from anthropic import Anthropic

CLASSIFY_SYSTEM = """Классифицируй отзыв клиента. Ответь СТРОГО JSON:
{"sentiment": "positive|neutral|negative", "score": <1-5>, "category": "service|quality|price|delivery|other", "key_issue": "Главная суть в 5-7 словах"}"""

RESPOND_SYSTEM = """Ты — менеджер по работе с клиентами. Отвечай на отзывы профессионально и с заботой.
- На позитивный: поблагодари искренне
- На негативный: признай проблему, извинись, предложи решение
- Отвечай кратко (2-3 предложения)"""

_reviews: list[dict] = []


def rating_keyboard() -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(text=f"{'⭐' * i}", callback_data=f"rate_{i}") for i in range(1, 6)]]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def classify(client: Anthropic, text: str) -> dict:
    resp = client.messages.create(
        model=Config.ANTHROPIC_MODEL,
        max_tokens=200,
        system=CLASSIFY_SYSTEM,
        messages=[{"role": "user", "content": text}],
    )
    raw = resp.content[0].text
    try:
        return json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
    except Exception:
        return {"sentiment": "neutral", "score": 3, "category": "other", "key_issue": ""}


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=RESPOND_SYSTEM, max_tokens=400)
    raw_client = Anthropic(api_key=Config.require_api_key())

    _pending_ratings: dict[int, int] = {}

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "👋 Оставьте отзыв о нашем сервисе!\n\n"
            "Сначала оцените нас:",
            reply_markup=rating_keyboard(),
        )

    @dp.callback_query(F.data.startswith("rate_"))
    async def handle_rating(call: CallbackQuery) -> None:
        score = int(call.data.split("_")[1])
        _pending_ratings[call.from_user.id] = score
        await call.message.answer(
            f"Вы поставили {'⭐' * score}\n\nТеперь напишите ваш отзыв:"
        )
        await call.answer()

    @dp.message(Command("stats"))
    async def stats(msg: Message) -> None:
        if not _reviews:
            await msg.answer("Отзывов пока нет.")
            return
        pos = sum(1 for r in _reviews if r["sentiment"] == "positive")
        neg = sum(1 for r in _reviews if r["sentiment"] == "negative")
        avg = sum(r.get("score", 3) for r in _reviews) / len(_reviews)
        await msg.answer(
            f"📊 *Статистика отзывов*\n\n"
            f"Всего: {len(_reviews)}\n"
            f"✅ Позитивных: {pos}\n"
            f"❌ Негативных: {neg}\n"
            f"⭐ Средний рейтинг: {avg:.1f}",
            parse_mode="Markdown",
        )

    @dp.message()
    async def handle_review(msg: Message) -> None:
        text = msg.text or ""
        rating = _pending_ratings.pop(msg.from_user.id, None)

        await msg.answer("⏳ Анализирую отзыв...")
        analysis = await classify(raw_client, text)

        _reviews.append({
            **analysis,
            "text": text,
            "rating": rating,
            "user_id": msg.from_user.id,
            "timestamp": datetime.now().isoformat(),
        })

        sentiment_icon = {"positive": "😊", "neutral": "😐", "negative": "😟"}.get(
            analysis["sentiment"], "💬"
        )
        response = ai.ask(
            msg.from_user.id,
            f"Отзыв клиента (тональность: {analysis['sentiment']}): {text}",
        )
        ai.reset(msg.from_user.id)

        await msg.answer(
            f"{sentiment_icon} *Тональность:* {analysis['sentiment']}\n"
            f"🏷️ *Категория:* {analysis['category']}\n\n"
            f"💬 *Ответ:*\n{response}",
            parse_mode="Markdown",
        )

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
