"""HR бот — приём резюме, автоматический скрининг, уведомления рекрутеру."""
from __future__ import annotations

import asyncio
import json
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, Document, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import Config
from anthropic import Anthropic

SCREEN_SYSTEM = """Ты — HR-скрининг агент. Анализируй резюме кандидата.
Ответь СТРОГО JSON:
{
  "score": <0-100>,
  "recommendation": "invite|maybe|reject",
  "strengths": ["..."],
  "red_flags": ["..."],
  "experience_years": <число или null>,
  "key_skills": ["..."],
  "summary": "Краткое резюме в 2 предложениях"
}"""

CHAT_SYSTEM = """Ты — HR-ассистент компании. Общаешься с кандидатами вежливо и профессионально.
Рассказываешь о вакансиях, отвечаешь на вопросы о компании и процессе найма."""

VACANCIES = [
    {"id": 1, "title": "Frontend Developer", "stack": "React, TypeScript", "salary": "от 300 000 ₸"},
    {"id": 2, "title": "Python Backend Developer", "stack": "FastAPI, PostgreSQL", "salary": "от 400 000 ₸"},
    {"id": 3, "title": "AI Engineer", "stack": "Python, LangChain, Claude API", "salary": "от 500 000 ₸"},
]

candidates: list[dict] = []


class CandidateStates(StatesGroup):
    main_menu = State()
    applying = State()
    sending_resume = State()


def main_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💼 Открытые вакансии", callback_data="vacancies")],
        [InlineKeyboardButton(text="📄 Отправить резюме", callback_data="apply")],
        [InlineKeyboardButton(text="❓ Вопрос HR", callback_data="ask_hr")],
    ])


def vacancies_keyboard() -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(text=f"💼 {v['title']}", callback_data=f"vac_{v['id']}")] for v in VACANCIES]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    client = Anthropic(api_key=Config.require_api_key())
    from shared import BotClaudeClient
    chat_ai = BotClaudeClient(system=CHAT_SYSTEM, max_tokens=400)

    async def screen_resume(text: str) -> dict:
        resp = client.messages.create(
            model=Config.ANTHROPIC_MODEL, max_tokens=600,
            system=SCREEN_SYSTEM,
            messages=[{"role": "user", "content": f"Резюме:\n{text}"}],
        )
        raw = resp.content[0].text
        try:
            return json.loads(raw[raw.find("{"):raw.rfind("}") + 1])
        except Exception:
            return {"score": 50, "recommendation": "maybe", "strengths": [],
                    "red_flags": [], "experience_years": None, "key_skills": [], "summary": raw[:200]}

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer(
            "👋 Добро пожаловать в HR-бот *TechCompany*!\n\n"
            "Здесь вы можете узнать о вакансиях и отправить резюме.",
            reply_markup=main_keyboard(), parse_mode="Markdown",
        )
        await state.set_state(CandidateStates.main_menu)

    @dp.callback_query(F.data == "vacancies")
    async def show_vacancies(call: CallbackQuery) -> None:
        await call.message.answer("💼 *Открытые вакансии:*", reply_markup=vacancies_keyboard(),
                                  parse_mode="Markdown")
        await call.answer()

    @dp.callback_query(F.data.startswith("vac_"))
    async def show_vacancy(call: CallbackQuery) -> None:
        vid = int(call.data.split("_")[1])
        vac = next((v for v in VACANCIES if v["id"] == vid), None)
        if not vac:
            await call.answer("Вакансия не найдена")
            return
        await call.message.answer(
            f"💼 *{vac['title']}*\n\n"
            f"🛠 Стек: {vac['stack']}\n"
            f"💰 Зарплата: {vac['salary']}\n\n"
            f"Нажмите «Отправить резюме» чтобы откликнуться.",
            parse_mode="Markdown",
        )
        await call.answer()

    @dp.callback_query(F.data == "apply")
    async def start_apply(call: CallbackQuery, state: FSMContext) -> None:
        await call.message.answer(
            "📄 Отправьте ваше резюме текстом или файлом (.txt/.pdf).\n\n"
            "Или опишите ваш опыт в свободной форме:",
        )
        await state.set_state(CandidateStates.sending_resume)
        await call.answer()

    @dp.callback_query(F.data == "ask_hr")
    async def ask_hr(call: CallbackQuery, state: FSMContext) -> None:
        await call.message.answer("Задайте ваш вопрос:")
        await state.set_state(CandidateStates.applying)
        await call.answer()

    @dp.message(CandidateStates.applying)
    async def handle_hr_question(msg: Message, state: FSMContext) -> None:
        response = chat_ai.ask(msg.from_user.id, msg.text or "")
        await msg.answer(response, reply_markup=main_keyboard())
        await state.set_state(CandidateStates.main_menu)

    @dp.message(CandidateStates.sending_resume)
    async def handle_resume(msg: Message, state: FSMContext) -> None:
        resume_text = msg.text or ""
        if msg.document:
            await msg.answer("📎 Получил файл. Анализирую...")
            resume_text = f"Файл резюме: {msg.document.file_name}"
        else:
            await msg.answer("⏳ Анализирую резюме...")

        result = await screen_resume(resume_text or "Резюме не предоставлено")
        candidates.append({
            "user_id": msg.from_user.id,
            "username": msg.from_user.username,
            "timestamp": datetime.now().isoformat(),
            "result": result,
        })

        rec_icon = {"invite": "✅", "maybe": "🤔", "reject": "❌"}.get(result["recommendation"], "?")
        await msg.answer(
            f"📊 *Результат скрининга*\n\n"
            f"{rec_icon} Рекомендация: {result['recommendation'].upper()}\n"
            f"⭐ Оценка: {result['score']}/100\n\n"
            f"📝 {result.get('summary', '')}\n\n"
            f"{'✅ HR-специалист свяжется с вами в течение 2 рабочих дней!' if result['recommendation'] == 'invite' else 'Спасибо за интерес к нашей компании!'}",
            parse_mode="Markdown",
            reply_markup=main_keyboard(),
        )
        await state.set_state(CandidateStates.main_menu)

    @dp.message(Command("candidates"))
    async def show_candidates(msg: Message) -> None:
        if not candidates:
            await msg.answer("Кандидатов пока нет.")
            return
        lines = [f"• @{c.get('username','?')} — {c['result']['recommendation']} ({c['result']['score']})" for c in candidates[-10:]]
        await msg.answer("👥 *Последние кандидаты:*\n" + "\n".join(lines), parse_mode="Markdown")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
