"""Многоуровневый Support бот — классифицирует обращения и эскалирует при необходимости."""
from __future__ import annotations

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config
from anthropic import Anthropic

CLASSIFY_SYSTEM = """Классифицируй обращение в поддержку. Ответь СТРОГО JSON:
{
  "category": "billing|technical|general|complaint|refund",
  "priority": "low|medium|high|urgent",
  "can_autosolve": true/false,
  "summary": "Суть обращения в 10 словах"
}
urgent — угроза репутации или срочная финансовая проблема."""

SUPPORT_SYSTEM = """Ты — профессиональный агент поддержки первой линии.

Решай стандартные вопросы самостоятельно:
- general: отвечай на вопросы о продукте/услуге
- technical: помогай с базовыми техническими проблемами (перезагрузить, очистить кэш, обновить)
- billing: объясняй как проверить счёт, когда пройдёт оплата

Для сложных случаев (billing refund, urgent complaints): скажи что передаёшь специалисту.
Отвечай чётко, по делу, в 2-4 предложениях."""


class TicketStates(StatesGroup):
    in_dialog = State()


_tickets: list[dict] = []
_ticket_counter = 0


def escalate_keyboard(ticket_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Решено", callback_data=f"resolve_{ticket_id}"),
        InlineKeyboardButton(text="🔄 Эскалировать", callback_data=f"escalate_{ticket_id}"),
    ]])


async def main() -> None:
    global _ticket_counter
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SUPPORT_SYSTEM, max_tokens=500)
    raw_client = Anthropic(api_key=Config.require_api_key())

    async def classify(text: str) -> dict:
        resp = raw_client.messages.create(
            model=Config.ANTHROPIC_MODEL,
            max_tokens=200,
            system=CLASSIFY_SYSTEM,
            messages=[{"role": "user", "content": text}],
        )
        raw = resp.content[0].text
        try:
            return json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
        except Exception:
            return {"category": "general", "priority": "low",
                    "can_autosolve": True, "summary": text[:50]}

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "👋 Служба поддержки!\n\n"
            "Опишите вашу проблему, и я постараюсь помочь.",
        )
        await state.set_state(TicketStates.in_dialog)

    @dp.callback_query(F.data.startswith("resolve_"))
    async def resolve(call: CallbackQuery) -> None:
        await call.message.edit_text(call.message.text + "\n\n✅ *Тикет закрыт*",
                                     parse_mode="Markdown")
        await call.answer("Тикет закрыт")

    @dp.callback_query(F.data.startswith("escalate_"))
    async def escalate(call: CallbackQuery) -> None:
        ticket_id = call.data.split("_")[1]
        await call.message.edit_text(
            call.message.text + f"\n\n🔄 *Тикет #{ticket_id} передан специалисту*",
            parse_mode="Markdown",
        )
        await call.answer("Передано специалисту")

    @dp.message(TicketStates.in_dialog)
    async def handle_message(msg: Message) -> None:
        global _ticket_counter
        text = msg.text or ""

        analysis = await classify(text)
        _ticket_counter += 1
        ticket_id = _ticket_counter
        _tickets.append({"id": ticket_id, "text": text, **analysis,
                         "user_id": msg.from_user.id})

        priority_icon = {"low": "🟢", "medium": "🟡", "high": "🔴", "urgent": "🆘"}.get(
            analysis["priority"], "⚪"
        )

        if not analysis.get("can_autosolve") or analysis["priority"] in ("high", "urgent"):
            await msg.answer(
                f"🎫 *Тикет #{ticket_id} создан*\n"
                f"{priority_icon} Приоритет: {analysis['priority']}\n"
                f"📋 {analysis['summary']}\n\n"
                f"Ваше обращение передано специалисту. Ожидайте ответа в течение 1 часа.",
                reply_markup=escalate_keyboard(ticket_id),
                parse_mode="Markdown",
            )
        else:
            response = ai.ask(msg.from_user.id, text)
            await msg.answer(
                f"🤖 *Автоответ*\n\n{response}\n\n"
                f"_Тикет #{ticket_id} | {analysis['category']}_",
                reply_markup=escalate_keyboard(ticket_id),
                parse_mode="Markdown",
            )

    @dp.message(Command("tickets"))
    async def show_tickets(msg: Message) -> None:
        if not _tickets:
            await msg.answer("Тикетов нет.")
            return
        lines = [f"#{t['id']} [{t['priority']}] {t['summary']}" for t in _tickets[-10:]]
        await msg.answer("📋 *Последние тикеты:*\n" + "\n".join(lines), parse_mode="Markdown")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
