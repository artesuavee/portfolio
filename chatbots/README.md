# Telegram Chatbots — 10 AI-powered ботов

Коллекция продакшн-готовых Telegram ботов на **aiogram 3.x** + **Anthropic Claude API**.

## Боты

| # | Бот | Описание | Ключевые фичи |
|---|-----|----------|---------------|
| 1 | `restaurant_bot` | Ресторанный бот | Меню, FSM-бронирование, AI-ответы |
| 2 | `booking_bot` | Запись на услуги | Инлайн-календарь, слоты, подтверждение |
| 3 | `faq_bot` | FAQ с поиском | TF-IDF поиск, AI-ответы на вопросы вне базы |
| 4 | `ecommerce_bot` | Интернет-магазин | Каталог, корзина, FSM-оформление заказа |
| 5 | `feedback_bot` | Сбор отзывов | Рейтинг, классификация тональности через Claude |
| 6 | `quiz_bot` | AI-квиз | Генерация вопросов, подсчёт очков, объяснения |
| 7 | `language_bot` | Изучение языков | Правила, проверка, слово дня, 5 языков |
| 8 | `news_bot` | Дайджест новостей | RSS-парсинг, суммаризация Claude |
| 9 | `support_bot` | Служба поддержки | Классификация → автоответ или эскалация |
| 10 | `hr_bot` | HR-скрининг | Приём резюме, AI-оценка, база кандидатов |
| — | `sales_bot` | Sales Development | Квалификация лидов, SPIN-продажи, CRM |

## Технологии

- **aiogram 3.x** — async Telegram Bot API
- **Anthropic Claude API** — LLM для AI-логики
- **FSM** (Finite State Machine) — управление диалогами
- **Inline keyboards** — интерактивные кнопки
- **Общая архитектура** — `shared/` (BotClaudeClient + Config)

## Быстрый старт

```bash
cd chatbots/<bot_name>
cp .env.example .env
# Заполни BOT_TOKEN и ANTHROPIC_API_KEY в .env

pip install aiogram anthropic python-dotenv
python bot.py
```

## Архитектура

```
chatbots/
├── shared/
│   ├── claude_client.py   # BotClaudeClient — история per-user
│   └── config.py          # Конфигурация из .env
├── restaurant_bot/bot.py
├── booking_bot/bot.py
├── faq_bot/bot.py
└── ...
```

`BotClaudeClient` хранит историю диалога отдельно для каждого `user_id` — поддерживает контекст в многопользовательском режиме.
