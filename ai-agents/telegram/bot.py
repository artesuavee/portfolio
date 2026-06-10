"""ИИ-ассистент в Telegram на aiogram 3.

Понимает запросы естественным языком, ведёт диалог через Claude,
имеет меню-кнопки. Запуск:  python -m telegram.bot
"""
from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import KeyboardButton, Message, ReplyKeyboardMarkup

from core import ClaudeClient
from core.config import settings

logging.basicConfig(level=logging.INFO)

SYSTEM = (
    "Ты — умный ИИ-ассистент в Telegram. Помогаешь с текстами, идеями, планами, "
    "ответами на вопросы. Пиши кратко и по делу, по-русски, можно с эмодзи."
)

# Отдельная история диалога на каждого пользователя.
_sessions: dict[int, ClaudeClient] = {}


def _session(user_id: int) -> ClaudeClient:
    if user_id not in _sessions:
        _sessions[user_id] = ClaudeClient(system=SYSTEM)
    return _sessions[user_id]


MENU = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📝 Сгенерировать пост"), KeyboardButton(text="💡 Идеи")],
        [KeyboardButton(text="📅 План на день"), KeyboardButton(text="⚙️ Сброс диалога")],
    ],
    resize_keyboard=True,
)

dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Привет! 🤖 Я ИИ-ассистент. Напишите задачу человеческим языком — помогу.",
        reply_markup=MENU,
    )


@dp.message(F.text == "⚙️ Сброс диалога")
async def reset(message: Message) -> None:
    _session(message.from_user.id).reset()
    await message.answer("Контекст очищен. Начнём заново ✨", reply_markup=MENU)


_PRESETS = {
    "📝 Сгенерировать пост": "Сделай цепляющий пост для соцсетей о нашей акции (придумай тему).",
    "💡 Идеи": "Предложи 5 свежих идей для контента моего бизнеса.",
    "📅 План на день": "Составь продуктивный план на день из 6 пунктов.",
}


@dp.message(F.text)
async def on_text(message: Message) -> None:
    prompt = _PRESETS.get(message.text, message.text)
    await message.bot.send_chat_action(message.chat.id, "typing")
    client = _session(message.from_user.id)
    try:
        answer = await asyncio.to_thread(client.ask, prompt)
    except Exception as exc:  # noqa: BLE001
        answer = f"Упс, ошибка: {exc}"
    await message.answer(answer, reply_markup=MENU)


async def main() -> None:
    if not settings.telegram_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN не задан в .env")
    bot = Bot(settings.telegram_token)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
