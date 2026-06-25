"""Telegram бот-дайджест новостей — читает RSS и суммаризует через Claude."""
from __future__ import annotations

import asyncio
import sys
import os
import xml.etree.ElementTree as ET
from urllib.request import urlopen
from urllib.error import URLError

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

from shared import BotClaudeClient, Config

RSS_FEEDS = {
    "tech": {"name": "Технологии", "url": "https://feeds.feedburner.com/TechCrunch", "emoji": "💻"},
    "ai": {"name": "AI новости", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "emoji": "🤖"},
    "business": {"name": "Бизнес", "url": "https://feeds.bloomberg.com/technology/news.rss", "emoji": "📈"},
}

SUMMARIZE_SYSTEM = """Ты — редактор новостного дайджеста. Суммаризируй новости кратко и ёмко.

Для каждой новости:
- Одно предложение — главная суть
- Почему это важно (одно предложение)

Пиши по-русски, даже если новость на английском."""

DIGEST_SYSTEM = """Ты — редактор новостного дайджеста. Создай краткий обзор новостей.
Выдели 3-5 самых важных тем, объясни их суть простым языком."""


class NewsStates(StatesGroup):
    choosing_topic = State()


def fetch_rss(url: str, limit: int = 5) -> list[dict]:
    try:
        with urlopen(url, timeout=5) as response:
            content = response.read()
        root = ET.fromstring(content)
        items = root.findall(".//item")[:limit]
        result = []
        for item in items:
            title = item.findtext("title", "").strip()
            desc = item.findtext("description", "").strip()[:300]
            result.append({"title": title, "description": desc})
        return result
    except (URLError, ET.ParseError, Exception):
        return [{"title": "Пример новости: AI совершает прорыв в медицине",
                 "description": "Исследователи создали модель, которая диагностирует рак на ранних стадиях с точностью 95%."},
                {"title": "Пример новости: Рынок технологий растёт",
                 "description": "Объём мирового рынка ИТ превысил $5 трлн в 2026 году."}]


def topics_keyboard() -> InlineKeyboardMarkup:
    buttons = [[InlineKeyboardButton(
        text=f"{feed['emoji']} {feed['name']}", callback_data=f"feed_{key}"
    )] for key, feed in RSS_FEEDS.items()]
    buttons.append([InlineKeyboardButton(text="📰 Полный дайджест", callback_data="feed_all")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def main() -> None:
    bot = Bot(token=Config.require_bot_token())
    dp = Dispatcher(storage=MemoryStorage())
    summarizer = BotClaudeClient(system=SUMMARIZE_SYSTEM, max_tokens=600)
    digest_ai = BotClaudeClient(system=DIGEST_SYSTEM, max_tokens=1000)

    @dp.message(CommandStart())
    async def start(msg: Message) -> None:
        await msg.answer(
            "📰 *News Digest Bot*\n\n"
            "Получайте краткие дайджесты новостей по любой теме.",
            reply_markup=topics_keyboard(), parse_mode="Markdown",
        )

    @dp.message(Command("news"))
    async def show_topics(msg: Message) -> None:
        await msg.answer("Выберите тему:", reply_markup=topics_keyboard())

    @dp.callback_query(F.data.startswith("feed_"))
    async def get_news(call: CallbackQuery) -> None:
        key = call.data.split("_")[1]
        await call.message.answer("⏳ Загружаю новости...")
        await call.answer()

        if key == "all":
            all_articles = []
            for feed_key, feed in RSS_FEEDS.items():
                articles = fetch_rss(feed["url"], limit=3)
                for a in articles:
                    a["category"] = feed["name"]
                all_articles.extend(articles)

            text = "\n\n".join(
                f"[{a.get('category', '')}] {a['title']}: {a['description']}"
                for a in all_articles
            )
            summary = digest_ai.ask(call.from_user.id, f"Создай дайджест:\n{text}")
            digest_ai.reset(call.from_user.id)
            await call.message.answer(f"📰 *Дайджест дня:*\n\n{summary}", parse_mode="Markdown")
        else:
            feed = RSS_FEEDS.get(key)
            if not feed:
                await call.message.answer("Лента не найдена")
                return

            articles = fetch_rss(feed["url"])
            if not articles:
                await call.message.answer("Новостей не найдено.")
                return

            text = "\n\n".join(f"{a['title']}: {a['description']}" for a in articles)
            summary = summarizer.ask(call.from_user.id, f"Суммаризируй эти новости:\n{text}")
            summarizer.reset(call.from_user.id)
            await call.message.answer(
                f"{feed['emoji']} *{feed['name']}*\n\n{summary}\n\n"
                f"_Источник: {feed['url']}_",
                parse_mode="Markdown",
            )

    @dp.message()
    async def custom_topic(msg: Message) -> None:
        topic = msg.text or ""
        await msg.answer(
            f"🔍 Ищу новости по теме '{topic}'...\n\n"
            f"_(В продакшн-версии здесь будет реальный поиск новостей)_\n\n"
            f"Пока используйте кнопки выше для готовых тем.",
            parse_mode="Markdown",
            reply_markup=topics_keyboard(),
        )

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
