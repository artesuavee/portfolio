"""Telegram бот для ресторана — меню, бронирование столиков, ответы на вопросы."""
from __future__ import annotations

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

MENU = """
🍽️ *Наше меню:*

*Закуски:*
• Брускетты с томатами — 1200 ₸
• Карпаччо из говядины — 2800 ₸

*Горячее:*
• Стейк Рибай (300г) — 6500 ₸
• Паста Карбонара — 3200 ₸
• Лосось на гриле — 4800 ₸

*Десерты:*
• Тирамису — 1500 ₸
• Чизкейк — 1200 ₸

*Напитки:*
• Вино (бокал) — от 1800 ₸
• Свежевыжатый сок — 900 ₸
"""

SYSTEM = """Ты — вежливый и дружелюбный ассистент ресторана «La Bella».

Ты помогаешь гостям:
- Рассказываешь о меню и блюдах
- Принимаешь бронирование столиков (просишь: имя, дата, время, кол-во гостей)
- Отвечаешь на вопросы о ресторане (часы работы: 12:00-23:00 ежедневно, адрес: ул. Абая 15)
- При бронировании подтверждаешь: "Ваш столик забронирован на [детали]. Ждём вас!"

Говори тепло и гостеприимно. Используй эмодзи умеренно."""


class BookingStates(StatesGroup):
    waiting_name = State()
    waiting_datetime = State()
    waiting_guests = State()


def main_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📋 Меню"), KeyboardButton(text="📅 Забронировать")],
            [KeyboardButton(text="❓ Вопрос"), KeyboardButton(text="📞 Контакты")],
        ],
        resize_keyboard=True,
    )


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=600)

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "👋 Добро пожаловать в ресторан *La Bella*!\n\n"
            "Чем могу помочь?",
            reply_markup=main_keyboard(),
            parse_mode="Markdown",
        )

    @dp.message(F.text == "📋 Меню")
    async def show_menu(msg: Message) -> None:
        await msg.answer(MENU, parse_mode="Markdown")

    @dp.message(F.text == "📞 Контакты")
    async def contacts(msg: Message) -> None:
        await msg.answer(
            "📍 *La Bella*\n"
            "Адрес: ул. Абая 15\n"
            "📞 +7 (727) 123-45-67\n"
            "🕐 12:00 — 23:00 ежедневно",
            parse_mode="Markdown",
        )

    @dp.message(F.text == "📅 Забронировать")
    async def book_start(msg: Message, state: FSMContext) -> None:
        await msg.answer("Как вас зовут?")
        await state.set_state(BookingStates.waiting_name)

    @dp.message(BookingStates.waiting_name)
    async def book_name(msg: Message, state: FSMContext) -> None:
        await state.update_data(name=msg.text)
        await msg.answer(f"Приятно познакомиться, {msg.text}! На какую дату и время? (напр.: 27 июня, 19:00)")
        await state.set_state(BookingStates.waiting_datetime)

    @dp.message(BookingStates.waiting_datetime)
    async def book_datetime(msg: Message, state: FSMContext) -> None:
        await state.update_data(datetime=msg.text)
        await msg.answer("Сколько гостей будет?")
        await state.set_state(BookingStates.waiting_guests)

    @dp.message(BookingStates.waiting_guests)
    async def book_guests(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        await state.clear()
        await msg.answer(
            f"✅ *Бронирование подтверждено!*\n\n"
            f"👤 Имя: {data['name']}\n"
            f"📅 Дата/время: {data['datetime']}\n"
            f"👥 Гостей: {msg.text}\n\n"
            f"Ждём вас в La Bella! 🍽️",
            reply_markup=main_keyboard(),
            parse_mode="Markdown",
        )

    @dp.message()
    async def chat(msg: Message) -> None:
        response = ai.ask(msg.from_user.id, msg.text or "")
        await msg.answer(response)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
