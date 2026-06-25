"""Telegram бот для записи на услуги — простой календарь + AI-помощник."""
from __future__ import annotations

import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

SERVICES = {
    "s1": {"name": "Стрижка", "duration": 60, "price": 5000, "emoji": "✂️"},
    "s2": {"name": "Окрашивание", "duration": 120, "price": 15000, "emoji": "🎨"},
    "s3": {"name": "Маникюр", "duration": 90, "price": 6000, "emoji": "💅"},
    "s4": {"name": "Консультация", "duration": 30, "price": 2000, "emoji": "💬"},
}

SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

SYSTEM = """Ты — ассистент салона красоты. Помогаешь с записью на услуги.
Отвечай кратко, дружелюбно. Напомни клиенту что он всегда может написать если нужно перенести запись."""


class BookingStates(StatesGroup):
    choose_service = State()
    choose_date = State()
    choose_time = State()
    enter_name = State()
    enter_phone = State()


bookings: list[dict] = []
booked_slots: dict[str, list[str]] = {}


def services_keyboard() -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(
        text=f"{s['emoji']} {s['name']} — {s['price']:,} ₸ ({s['duration']} мин)",
        callback_data=f"svc_{sid}"
    )] for sid, s in SERVICES.items()]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def dates_keyboard() -> InlineKeyboardMarkup:
    today = datetime.now()
    buttons = []
    for i in range(1, 8):
        d = today + timedelta(days=i)
        label = d.strftime("%d %b (%a)")
        callback = d.strftime("%Y-%m-%d")
        buttons.append([InlineKeyboardButton(text=label, callback_data=f"date_{callback}")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def times_keyboard(date: str) -> InlineKeyboardMarkup:
    taken = booked_slots.get(date, [])
    buttons = []
    for slot in SLOTS:
        if slot not in taken:
            buttons.append([InlineKeyboardButton(text=slot, callback_data=f"time_{slot}")])
    if not buttons:
        buttons = [[InlineKeyboardButton(text="❌ Все слоты заняты", callback_data="no_slots")]]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=300)

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "💇 *Запись в салон красоты*\n\nВыберите услугу:",
            reply_markup=services_keyboard(), parse_mode="Markdown",
        )
        await state.set_state(BookingStates.choose_service)

    @dp.message(Command("mybookings"))
    async def my_bookings(msg: Message) -> None:
        user_bookings = [b for b in bookings if b["user_id"] == msg.from_user.id]
        if not user_bookings:
            await msg.answer("У вас нет активных записей.")
            return
        lines = [f"• {b['service']} — {b['date']} в {b['time']}" for b in user_bookings[-5:]]
        await msg.answer("📅 *Ваши записи:*\n" + "\n".join(lines), parse_mode="Markdown")

    @dp.callback_query(F.data.startswith("svc_"))
    async def choose_service(call: CallbackQuery, state: FSMContext) -> None:
        sid = call.data.split("_")[1]
        svc = SERVICES.get(sid)
        if not svc:
            await call.answer("Услуга не найдена")
            return
        await state.update_data(service_id=sid, service_name=svc["name"])
        await call.message.edit_text(
            f"{svc['emoji']} *{svc['name']}*\n"
            f"💰 {svc['price']:,} ₸ · ⏱ {svc['duration']} мин\n\n"
            f"Выберите дату:",
            reply_markup=dates_keyboard(), parse_mode="Markdown",
        )
        await state.set_state(BookingStates.choose_date)
        await call.answer()

    @dp.callback_query(F.data.startswith("date_"))
    async def choose_date(call: CallbackQuery, state: FSMContext) -> None:
        date = call.data.split("_")[1]
        await state.update_data(date=date)
        await call.message.edit_text(
            f"📅 Дата: {date}\n\nВыберите время:",
            reply_markup=times_keyboard(date),
        )
        await state.set_state(BookingStates.choose_time)
        await call.answer()

    @dp.callback_query(F.data.startswith("time_"))
    async def choose_time(call: CallbackQuery, state: FSMContext) -> None:
        time = call.data.split("_")[1]
        await state.update_data(time=time)
        await call.message.answer("Ваше имя:")
        await state.set_state(BookingStates.enter_name)
        await call.answer()

    @dp.message(BookingStates.enter_name)
    async def enter_name(msg: Message, state: FSMContext) -> None:
        await state.update_data(name=msg.text)
        await msg.answer("Номер телефона для подтверждения:")
        await state.set_state(BookingStates.enter_phone)

    @dp.message(BookingStates.enter_phone)
    async def enter_phone(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        await state.clear()

        booking = {
            "user_id": msg.from_user.id,
            "service": data["service_name"],
            "date": data["date"],
            "time": data["time"],
            "name": data["name"],
            "phone": msg.text,
        }
        bookings.append(booking)
        booked_slots.setdefault(data["date"], []).append(data["time"])

        await msg.answer(
            f"✅ *Запись подтверждена!*\n\n"
            f"💇 {data['service_name']}\n"
            f"📅 {data['date']} в {data['time']}\n"
            f"👤 {data['name']}\n📞 {msg.text}\n\n"
            f"Ждём вас! 💫",
            parse_mode="Markdown",
        )

    @dp.message()
    async def chat(msg: Message) -> None:
        await msg.answer(ai.ask(msg.from_user.id, msg.text or ""))

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
