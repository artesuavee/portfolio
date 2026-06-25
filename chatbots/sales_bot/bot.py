"""AI Sales бот — квалификация лидов, работа с возражениями, назначение встреч."""
from __future__ import annotations

import asyncio
import json
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config
from anthropic import Anthropic

QUALIFY_SYSTEM = """Ты — опытный Sales Development Representative. Квалифицируй лида.

По сообщению клиента определи СТРОГО JSON:
{
  "intent": "buy|interested|just_looking|no_intent",
  "budget_mentioned": true/false,
  "urgency": "now|soon|no_rush",
  "decision_maker": true/false/null,
  "pain_point": "Боль клиента в 5-7 словах или null"
}"""

SALES_SYSTEM = """Ты — профессиональный менеджер по продажам.

Твоя роль:
- Выявлять потребности клиента вопросами (не давать, а спрашивать)
- Работать с возражениями через технику SPIN
- Предлагать решения, а не продукты
- Вести к назначению демо/встречи

НЕ давать скидки без согласования. НЕ обещать то, чего не можешь гарантировать.
Отвечай естественно, как живой менеджер. 2-4 предложения."""

PRODUCTS = [
    {"name": "CRM Basic", "price": "от 15 000 ₸/мес", "desc": "Базовое управление контактами"},
    {"name": "CRM Pro", "price": "от 35 000 ₸/мес", "desc": "Полная автоматизация продаж + AI"},
    {"name": "CRM Enterprise", "price": "по запросу", "desc": "Кастомное решение для крупного бизнеса"},
]

leads: list[dict] = []


class SalesStates(StatesGroup):
    conversation = State()
    scheduling = State()


def start_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="💼 Узнать о продуктах")],
        [KeyboardButton(text="📅 Записаться на демо")],
        [KeyboardButton(text="💬 Поговорить с менеджером")],
    ], resize_keyboard=True)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    raw_client = Anthropic(api_key=Config.require_api_key())
    sales_ai = BotClaudeClient(system=SALES_SYSTEM, max_tokens=400)

    async def qualify(text: str) -> dict:
        resp = raw_client.messages.create(
            model=Config.ANTHROPIC_MODEL, max_tokens=200,
            system=QUALIFY_SYSTEM,
            messages=[{"role": "user", "content": text}],
        )
        raw = resp.content[0].text
        try:
            return json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
        except Exception:
            return {"intent": "interested", "budget_mentioned": False,
                    "urgency": "no_rush", "decision_maker": None, "pain_point": None}

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "👋 Добрый день! Я — AI-менеджер CRM Solutions.\n\n"
            "Помогу подобрать CRM для вашего бизнеса.\nС чего начнём?",
            reply_markup=start_keyboard(),
        )
        await state.set_state(SalesStates.conversation)

    @dp.message(F.text == "💼 Узнать о продуктах")
    async def show_products(msg: Message) -> None:
        text = "📦 *Наши продукты:*\n\n"
        for p in PRODUCTS:
            text += f"• *{p['name']}* — {p['price']}\n  {p['desc']}\n\n"
        await msg.answer(text, parse_mode="Markdown",
                         reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
                             InlineKeyboardButton(text="🚀 Хочу демо", callback_data="want_demo")
                         ]]))

    @dp.message(F.text == "📅 Записаться на демо")
    async def schedule_demo(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "Отлично! Напишите:\n1. Название компании\n2. Ваш email\n3. Удобное время"
        )
        await state.set_state(SalesStates.scheduling)

    @dp.message(SalesStates.scheduling)
    async def handle_scheduling(msg: Message, state: FSMContext) -> None:
        leads.append({
            "user_id": msg.from_user.id,
            "schedule_info": msg.text,
            "timestamp": datetime.now().isoformat(),
            "type": "demo_request",
        })
        await msg.answer(
            "✅ *Демо забронировано!*\n\n"
            "Наш менеджер свяжется с вами для подтверждения времени.\n"
            "Обычно мы перезваниваем в течение 1 часа в рабочее время.",
            parse_mode="Markdown",
            reply_markup=start_keyboard(),
        )
        await state.set_state(SalesStates.conversation)

    @dp.callback_query(F.data == "want_demo")
    async def want_demo(call: CallbackQuery, state: FSMContext) -> None:
        await call.message.answer("Напишите вашу почту и удобное время для демо:")
        await state.set_state(SalesStates.scheduling)
        await call.answer()

    @dp.message(SalesStates.conversation)
    async def handle_conversation(msg: Message, state: FSMContext) -> None:
        text = msg.text or ""
        q = await qualify(text)

        if q["intent"] == "buy" or q["urgency"] == "now":
            leads.append({
                "user_id": msg.from_user.id,
                "message": text,
                "qualification": q,
                "timestamp": datetime.now().isoformat(),
                "priority": "hot",
            })

        sales_prompt = text
        if q.get("pain_point"):
            sales_prompt += f"\n[Контекст: боль клиента — {q['pain_point']}]"

        response = sales_ai.ask(msg.from_user.id, sales_prompt)
        await msg.answer(response)

    @dp.message(Command("leads"))
    async def show_leads(msg: Message) -> None:
        hot = [l for l in leads if l.get("priority") == "hot"]
        await msg.answer(
            f"🔥 *Горячих лидов: {len(hot)}*\n"
            f"📊 Всего обращений: {len(leads)}",
            parse_mode="Markdown",
        )

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
