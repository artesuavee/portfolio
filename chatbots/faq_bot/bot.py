"""FAQ бот с in-memory векторным поиском и AI-ответами."""
from __future__ import annotations

import asyncio
import math
import sys
import os
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

FAQ_DB = [
    {"q": "Как оформить заказ?", "a": "Выберите товар в каталоге, нажмите 'Купить', заполните форму доставки. Подтверждение придёт на email."},
    {"q": "Как долго идёт доставка?", "a": "По городу 1-2 дня, по России 3-7 дней, международная 7-14 дней."},
    {"q": "Как вернуть товар?", "a": "Напишите в поддержку в течение 14 дней после получения. Возврат денег — 3-5 рабочих дней."},
    {"q": "Есть ли гарантия?", "a": "На всю электронику — 12 месяцев, на аксессуары — 6 месяцев."},
    {"q": "Как отследить заказ?", "a": "Трек-номер придёт на email после отправки. Отслеживайте на сайте транспортной компании."},
    {"q": "Принимаете ли карты?", "a": "Да, Visa, Mastercard, Мир, Apple Pay, Google Pay и наличные при самовывозе."},
    {"q": "Есть ли самовывоз?", "a": "Да, самовывоз из офиса по адресу ул. Абая 15 пн-пт 9:00-18:00."},
    {"q": "Скидки и акции?", "a": "Подпишитесь на наш Telegram канал @store_deals — там все актуальные акции."},
]

SYSTEM = """Ты — ассистент службы поддержки. Отвечаешь на вопросы клиентов по базе знаний.

Если нашёл подходящий FAQ — ответь на основе него, но своими словами.
Если вопрос не в базе знаний — ответь максимально полезно из общих соображений и предложи написать живому оператору.
Отвечай кратко и дружелюбно."""


def tokenize(text: str) -> list[str]:
    return text.lower().split()


def tfidf_search(query: str, docs: list[dict], top_k: int = 3) -> list[tuple[float, dict]]:
    query_tokens = tokenize(query)
    scores = []
    for doc in docs:
        doc_tokens = tokenize(doc["q"] + " " + doc["a"])
        doc_counter = Counter(doc_tokens)
        score = sum(doc_counter.get(t, 0) for t in query_tokens)
        if score > 0:
            idf = math.log(len(docs) / max(1, sum(1 for d in docs if t in d["q"].lower())))
            score *= idf
        scores.append((score, doc))
    scores.sort(key=lambda x: x[0], reverse=True)
    return [s for s in scores[:top_k] if s[0] > 0]


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    ai = BotClaudeClient(system=SYSTEM, max_tokens=400)

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "❓ *FAQ Bot*\n\n"
            "Задайте вопрос — я найду ответ в базе знаний или отвечу сам!\n\n"
            "Команды:\n/list — показать все вопросы\n/reset — новый диалог",
        )

    @dp.message(Command("list"))
    async def list_faq(msg: Message) -> None:
        questions = "\n".join(f"{i+1}. {doc['q']}" for i, doc in enumerate(FAQ_DB))
        await msg.answer(f"📚 *Часто задаваемые вопросы:*\n\n{questions}", parse_mode="Markdown")

    @dp.message(Command("reset"))
    async def reset(msg: Message) -> None:
        ai.reset(msg.from_user.id)
        await msg.answer("✅ Диалог сброшен. Задайте новый вопрос!")

    @dp.message()
    async def handle_question(msg: Message) -> None:
        query = msg.text or ""
        results = tfidf_search(query, FAQ_DB)

        if results:
            best_score, best_doc = results[0]
            context = f"Найден в FAQ: Q: {best_doc['q']} A: {best_doc['a']}"
            prompt = f"{context}\n\nВопрос клиента: {query}"
        else:
            prompt = f"Вопрос клиента (не найден в FAQ): {query}"

        response = ai.ask(msg.from_user.id, prompt)

        if results:
            await msg.answer(f"🔍 *Нашёл в базе знаний:*\n\n{response}", parse_mode="Markdown")
        else:
            await msg.answer(f"💬 {response}")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
