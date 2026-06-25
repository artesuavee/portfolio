"""Telegram бот для изучения языков — объясняет правила, проверяет упражнения."""
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

SYSTEM = """Ты — дружелюбный преподаватель языков. Помогаешь изучать иностранные языки.

Можешь:
1. Объяснять грамматические правила просто и с примерами
2. Переводить слова/фразы с разбором
3. Проверять упражнения и объяснять ошибки
4. Давать задания для практики
5. Предлагать слова дня с примерами использования

Адаптируй объяснения под уровень ученика. Используй эмодзи для наглядности.
Если ученик допустил ошибку — сначала похвали за попытку, потом объясни как правильно."""


class LangStates(StatesGroup):
    choosing_lang = State()
    learning = State()
    doing_exercise = State()


LANGUAGES = {"🇬🇧 Английский": "en", "🇩🇪 Немецкий": "de",
             "🇫🇷 Французский": "fr", "🇪🇸 Испанский": "es", "🇰🇿 Казахский": "kz"}


def lang_keyboard() -> ReplyKeyboardMarkup:
    keys = [[KeyboardButton(text=lang)] for lang in LANGUAGES]
    return ReplyKeyboardMarkup(keyboard=keys, resize_keyboard=True)


def main_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="📝 Объясни правило"), KeyboardButton(text="🔤 Слово дня")],
        [KeyboardButton(text="✏️ Проверь упражнение"), KeyboardButton(text="🎯 Дай задание")],
        [KeyboardButton(text="🌐 Сменить язык")],
    ], resize_keyboard=True)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=800)

    @dp.message(CommandStart())
    async def start(msg: Message, state: FSMContext) -> None:
        await msg.answer("👋 Привет! Какой язык будем изучать?", reply_markup=lang_keyboard())
        await state.set_state(LangStates.choosing_lang)

    @dp.message(LangStates.choosing_lang)
    async def choose_lang(msg: Message, state: FSMContext) -> None:
        lang_name = msg.text or ""
        lang_code = LANGUAGES.get(lang_name, "en")
        await state.update_data(language=lang_name, lang_code=lang_code)
        await msg.answer(
            f"Отлично! Учим *{lang_name}*.\n\nЧто хочешь делать?",
            reply_markup=main_keyboard(), parse_mode="Markdown",
        )
        await state.set_state(LangStates.learning)

    @dp.message(F.text == "🌐 Сменить язык", LangStates.learning)
    async def change_lang(msg: Message, state: FSMContext) -> None:
        await msg.answer("Выбери язык:", reply_markup=lang_keyboard())
        await state.set_state(LangStates.choosing_lang)

    @dp.message(F.text == "🔤 Слово дня", LangStates.learning)
    async def word_of_day(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        lang = data.get("language", "Английский")
        response = ai.ask(
            msg.from_user.id,
            f"Дай мне интересное слово дня на {lang} с произношением, переводом и 2 примерами.",
        )
        await msg.answer(response)

    @dp.message(F.text == "📝 Объясни правило", LangStates.learning)
    async def explain_rule(msg: Message, state: FSMContext) -> None:
        await msg.answer("Какое правило объяснить? Напиши тему (например: Present Perfect, артикли, падежи):")
        await state.set_state(LangStates.doing_exercise)
        await state.update_data(mode="explain")

    @dp.message(F.text == "✏️ Проверь упражнение", LangStates.learning)
    async def check_exercise(msg: Message, state: FSMContext) -> None:
        await msg.answer("Напиши твоё упражнение или перевод, и я проверю:")
        await state.set_state(LangStates.doing_exercise)
        await state.update_data(mode="check")

    @dp.message(F.text == "🎯 Дай задание", LangStates.learning)
    async def give_task(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        lang = data.get("language", "Английский")
        response = ai.ask(
            msg.from_user.id,
            f"Придумай упражнение по {lang} для практики. Дай чёткое задание.",
        )
        await msg.answer(response)

    @dp.message(LangStates.doing_exercise)
    async def handle_exercise_input(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        mode = data.get("mode", "check")
        lang = data.get("language", "Английский")
        text = msg.text or ""

        if mode == "explain":
            prompt = f"Объясни правило '{text}' для {lang} с примерами."
        else:
            prompt = f"Проверь это упражнение на {lang} и объясни ошибки если есть: {text}"

        response = ai.ask(msg.from_user.id, prompt)
        await msg.answer(response, reply_markup=main_keyboard())
        await state.set_state(LangStates.learning)

    @dp.message(LangStates.learning)
    async def free_chat(msg: Message, state: FSMContext) -> None:
        data = await state.get_data()
        lang = data.get("language", "")
        response = ai.ask(
            msg.from_user.id,
            f"[Контекст: изучаем {lang}] {msg.text}",
        )
        await msg.answer(response)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
