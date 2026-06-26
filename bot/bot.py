import os
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from aiogram.fsm.storage.memory import MemoryStorage
import anthropic
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

conversations: dict[int, list] = {}

SYSTEM_PROMPT = """Ты — AI-ассистент портфолио разработчика Idris (artesuave).
Отвечай кратко и дружелюбно на том языке, на котором пишет пользователь (RU / EN / KZ).

Услуги:
- Лендинги — от 50 000 ₸ / $120, срок 7 дней. Canvas/Three.js анимации, WA-форма, деплой.
- AI-агенты на Claude API — от 80 000 ₸ / $200, срок 5–10 дней. Tool Use, RAG, streaming.
- Telegram-боты aiogram 3 — от 40 000 ₸ / $100, срок 3–7 дней. FSM, оплата, admin-панель.
- Мобильные приложения React Native + Expo — от 150 000 ₸ / $380.

Контакт для заказа: @chief_irs в Telegram или +77475581396 в WhatsApp.
Время ответа < 1 часа. Портфолио: artesuavee.github.io/portfolio

Если спрашивают про цену — называй диапазон и предлагай обсудить детали в личке.
Не придумывай услуги которых нет в списке выше."""

@dp.message(CommandStart())
async def cmd_start(message: Message):
    conversations[message.from_user.id] = []
    name = message.from_user.first_name or "друг"
    await message.answer(
        f"👋 Привет, {name}!\n\n"
        "Я AI-ассистент портфолио **Artesuave** — разработчика лендингов, AI-агентов и Telegram-ботов.\n\n"
        "Спрашивай про услуги, цены, сроки — отвечу на русском, английском или казахском.\n\n"
        "📂 Портфолио: artesuavee.github.io/portfolio\n"
        "💬 /help — список услуг · /contact — связаться напрямую",
        parse_mode="Markdown"
    )

@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📋 *Услуги:*\n\n"
        "🖥 *Лендинги* — от 50 000 ₸ · 7 дней\n"
        "   Canvas/Three.js, адаптив, WA-форма\n\n"
        "🤖 *AI-агенты* — от 80 000 ₸ · 5–10 дней\n"
        "   Claude API, Tool Use, RAG, streaming\n\n"
        "✈️ *Telegram-боты* — от 40 000 ₸ · 3–7 дней\n"
        "   aiogram 3, FSM, Kaspi/Click оплата\n\n"
        "📱 *Мобильные приложения* — от 150 000 ₸\n"
        "   React Native + Expo, iOS + Android\n\n"
        "📂 Портфолио: artesuavee.github.io/portfolio",
        parse_mode="Markdown"
    )

@dp.message(Command("contact"))
async def cmd_contact(message: Message):
    await message.answer(
        "📬 *Связаться с разработчиком:*\n\n"
        "✈️ Telegram: @chief\\_irs\n"
        "📱 WhatsApp: +7 747 558 13 96\n"
        "📧 Email: kotovamurka517@gmail.com\n\n"
        "⏱ Отвечаю в течение 1 часа",
        parse_mode="Markdown"
    )

@dp.message()
async def handle_text(message: Message):
    user_id = message.from_user.id
    if user_id not in conversations:
        conversations[user_id] = []

    conversations[user_id].append({"role": "user", "content": message.text})
    if len(conversations[user_id]) > 12:
        conversations[user_id] = conversations[user_id][-12:]

    await bot.send_chat_action(message.chat.id, "typing")

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=SYSTEM_PROMPT,
            messages=conversations[user_id],
        )
        reply = response.content[0].text
        conversations[user_id].append({"role": "assistant", "content": reply})
        await message.answer(reply)
    except Exception:
        await message.answer(
            "Упс, связь с AI прервалась 😅\n"
            "Напишите напрямую: @chief_irs"
        )

async def main():
    await dp.start_polling(bot, skip_updates=True)

if __name__ == "__main__":
    asyncio.run(main())
