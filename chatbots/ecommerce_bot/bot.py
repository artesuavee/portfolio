"""Telegram бот интернет-магазина — каталог, корзина, оформление заказа."""
from __future__ import annotations

import asyncio
import sys
import os
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

CATALOG: dict[str, dict[str, Any]] = {
    "p1": {"name": "Беспроводные наушники Pro", "price": 45000, "category": "Электроника", "emoji": "🎧"},
    "p2": {"name": "Смарт-часы Sport X", "price": 89000, "category": "Электроника", "emoji": "⌚"},
    "p3": {"name": "Кожаный рюкзак Urban", "price": 32000, "category": "Аксессуары", "emoji": "🎒"},
    "p4": {"name": "Термос 500мл", "price": 8500, "category": "Аксессуары", "emoji": "🫙"},
    "p5": {"name": "Фитнес-браслет Lite", "price": 18000, "category": "Электроника", "emoji": "💪"},
    "p6": {"name": "Портативная колонка Bass", "price": 25000, "category": "Электроника", "emoji": "🔊"},
}

SYSTEM = """Ты — помощник интернет-магазина TechStore. Помогаешь покупателям выбрать товары.
Если спрашивают о товаре — рассказывай его плюсы и помогай с выбором.
Отвечай кратко и по делу."""


class OrderStates(StatesGroup):
    checkout_name = State()
    checkout_phone = State()
    checkout_address = State()


def catalog_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text=f"{p['emoji']} {p['name']} — {p['price']:,} ₸",
                              callback_data=f"product_{pid}")]
        for pid, p in CATALOG.items()
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def product_keyboard(pid: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🛒 В корзину", callback_data=f"add_{pid}"),
        InlineKeyboardButton(text="◀️ Назад", callback_data="back_catalog"),
    ]])


def cart_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Оформить заказ", callback_data="checkout"),
        InlineKeyboardButton(text="🗑 Очистить", callback_data="clear_cart"),
    ]])


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=400)
    carts: dict[int, dict[str, int]] = {}

    def get_cart(user_id: int) -> dict[str, int]:
        return carts.setdefault(user_id, {})

    def cart_total(cart: dict) -> int:
        return sum(CATALOG[pid]["price"] * qty for pid, qty in cart.items() if pid in CATALOG)

    def cart_text(cart: dict) -> str:
        if not cart:
            return "Корзина пуста"
        lines = [f"{CATALOG[pid]['emoji']} {CATALOG[pid]['name']} × {qty} = {CATALOG[pid]['price'] * qty:,} ₸"
                 for pid, qty in cart.items() if pid in CATALOG]
        lines.append(f"\n💰 *Итого: {cart_total(cart):,} ₸*")
        return "\n".join(lines)

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "🛍️ *TechStore*\n\nВыберите товар из каталога:",
            reply_markup=catalog_keyboard(), parse_mode="Markdown",
        )

    @dp.message(Command("cart"))
    async def show_cart(msg: Message) -> None:
        cart = get_cart(msg.from_user.id)
        await msg.answer(
            f"🛒 *Ваша корзина:*\n\n{cart_text(cart)}",
            reply_markup=cart_keyboard() if cart else None, parse_mode="Markdown",
        )

    @dp.callback_query(F.data.startswith("product_"))
    async def show_product(call: CallbackQuery) -> None:
        pid = call.data.split("_")[1]
        p = CATALOG.get(pid)
        if not p:
            await call.answer("Товар не найден")
            return
        await call.message.edit_text(
            f"{p['emoji']} *{p['name']}*\n\n"
            f"💰 Цена: {p['price']:,} ₸\n"
            f"🏷️ Категория: {p['category']}\n\n"
            f"Высококачественный товар с гарантией 12 месяцев.",
            reply_markup=product_keyboard(pid), parse_mode="Markdown",
        )
        await call.answer()

    @dp.callback_query(F.data == "back_catalog")
    async def back_catalog(call: CallbackQuery) -> None:
        await call.message.edit_text("Выберите товар:", reply_markup=catalog_keyboard())
        await call.answer()

    @dp.callback_query(F.data.startswith("add_"))
    async def add_to_cart(call: CallbackQuery) -> None:
        pid = call.data.split("_")[1]
        cart = get_cart(call.from_user.id)
        cart[pid] = cart.get(pid, 0) + 1
        p = CATALOG.get(pid, {})
        await call.answer(f"✅ {p.get('name', 'Товар')} добавлен в корзину!", show_alert=True)

    @dp.callback_query(F.data == "clear_cart")
    async def clear_cart(call: CallbackQuery) -> None:
        carts.pop(call.from_user.id, None)
        await call.message.edit_text("🗑 Корзина очищена.")
        await call.answer()

    @dp.callback_query(F.data == "checkout")
    async def checkout_start(call: CallbackQuery, state: FSMContext) -> None:
        cart = get_cart(call.from_user.id)
        if not cart:
            await call.answer("Корзина пуста!", show_alert=True)
            return
        await state.update_data(cart=cart.copy())
        await call.message.answer("📦 Оформление заказа\n\nВаше имя:")
        await state.set_state(OrderStates.checkout_name)
        await call.answer()

    @dp.message(OrderStates.checkout_name)
    async def checkout_name(msg: Message, state: FSMContext) -> None:
        await state.update_data(name=msg.text)
        await msg.answer("Номер телефона:")
        await state.set_state(OrderStates.checkout_phone)

    @dp.message(OrderStates.checkout_phone)
    async def checkout_phone(msg: Message, state: FSMContext) -> None:
        await state.update_data(phone=msg.text)
        await msg.answer("Адрес доставки:")
        await state.set_state(OrderStates.checkout_address)

    @dp.message(OrderStates.checkout_address)
    async def checkout_address(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        await state.clear()
        carts.pop(msg.from_user.id, None)
        cart = data.get("cart", {})
        total = sum(CATALOG[pid]["price"] * qty for pid, qty in cart.items() if pid in CATALOG)
        await msg.answer(
            f"✅ *Заказ оформлен!*\n\n"
            f"👤 {data['name']}\n📞 {data['phone']}\n📍 {data['address']}\n\n"
            f"💰 Сумма: {total:,} ₸\n\n"
            f"Ожидайте доставку в течение 1-3 рабочих дней 🚚",
            parse_mode="Markdown",
        )

    @dp.message()
    async def chat(msg: Message) -> None:
        await msg.answer(ai.ask(msg.from_user.id, msg.text or ""))

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
