"""AI-квиз бот — генерирует вопросы по теме через Claude, ведёт счёт."""
from __future__ import annotations

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import Config
from anthropic import Anthropic

QUIZ_SYSTEM = """Ты — генератор квиз-вопросов. Создавай вопросы по заданной теме.

Формат СТРОГО JSON:
{
  "question": "Текст вопроса",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": "A",
  "explanation": "Краткое объяснение правильного ответа (1-2 предложения)"
}

Делай вопросы интересными, разной сложности."""


class QuizStates(StatesGroup):
    choosing_topic = State()
    in_quiz = State()


async def generate_question(client: Anthropic, topic: str, used: list[str]) -> dict | None:
    used_hint = f"\nУже спрошены: {', '.join(used[-5:])}" if used else ""
    try:
        resp = client.messages.create(
            model=Config.ANTHROPIC_MODEL,
            max_tokens=400,
            system=QUIZ_SYSTEM,
            messages=[{"role": "user", "content": f"Тема: {topic}{used_hint}"}],
        )
        raw = resp.content[0].text
        data = json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
        return data
    except Exception:
        return None


def options_keyboard(options: list[str]) -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(text=opt, callback_data=f"ans_{opt[0]}")] for opt in options]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    client = Anthropic(api_key=Config.require_api_key())

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "🧠 *AI Quiz Bot*\n\n"
            "Выберите тему для квиза (например: история, наука, технологии, Python, математика):",
            parse_mode="Markdown",
        )
        await state.set_state(QuizStates.choosing_topic)

    @dp.message(QuizStates.choosing_topic)
    async def set_topic(msg: Message, state: FSMContext) -> None:
        topic = msg.text or "общие знания"
        await state.update_data(topic=topic, score=0, total=0, used=[])
        await msg.answer(f"🎯 Тема: *{topic}*\n\nГенерирую вопрос...", parse_mode="Markdown")
        await send_question(msg, state)
        await state.set_state(QuizStates.in_quiz)

    async def send_question(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        q = await generate_question(client, data["topic"], data.get("used", []))
        if not q:
            await msg.answer("⚠️ Не удалось сгенерировать вопрос. Попробуйте ещё раз.")
            return
        await state.update_data(current_q=q)
        await msg.answer(
            f"❓ *Вопрос {data['total'] + 1}:*\n{q['question']}",
            reply_markup=options_keyboard(q["options"]),
            parse_mode="Markdown",
        )

    @dp.callback_query(F.data.startswith("ans_"), QuizStates.in_quiz)
    async def handle_answer(call: CallbackQuery, state: FSMContext) -> None:
        chosen = call.data.split("_")[1]
        data = await state.get_data()
        q = data.get("current_q", {})
        correct = q.get("correct", "")
        is_correct = chosen == correct

        new_score = data["score"] + (1 if is_correct else 0)
        new_total = data["total"] + 1
        used = data.get("used", []) + [q.get("question", "")[:30]]

        await state.update_data(score=new_score, total=new_total, used=used)

        result_text = "✅ Правильно!" if is_correct else f"❌ Неверно! Правильный ответ: *{correct}*"
        await call.message.edit_text(
            f"❓ {q['question']}\n\n{result_text}\n\n"
            f"💡 {q.get('explanation', '')}\n\n"
            f"📊 Счёт: {new_score}/{new_total}",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
                InlineKeyboardButton(text="➡️ Следующий вопрос", callback_data="next"),
                InlineKeyboardButton(text="🏁 Закончить", callback_data="finish"),
            ]]),
        )
        await call.answer()

    @dp.callback_query(F.data == "next", QuizStates.in_quiz)
    async def next_q(call: CallbackQuery, state: FSMContext) -> None:
        await call.message.answer("Генерирую следующий вопрос...")
        await send_question(call.message, state)
        await call.answer()

    @dp.callback_query(F.data == "finish")
    async def finish(call: CallbackQuery, state: FSMContext) -> None:
        data = await state.get_data()
        score, total = data.get("score", 0), data.get("total", 0)
        pct = (score / total * 100) if total else 0
        grade = "🏆 Отлично!" if pct >= 80 else "👍 Хорошо!" if pct >= 60 else "📚 Нужно подучить"
        await call.message.answer(
            f"🏁 *Квиз завершён!*\n\n"
            f"Тема: {data.get('topic', '')}\n"
            f"Результат: {score}/{total} ({pct:.0f}%)\n\n{grade}",
            parse_mode="Markdown",
        )
        await state.clear()
        await call.answer()

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
