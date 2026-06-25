# Демо-портфолио — сайты, мобильные приложения, AI-агенты и Telegram-боты

Коллекция из **45+ авторских демо-проектов**: адаптивные лендинги, реальные мобильные приложения на Expo, Python AI-агенты с Claude API и Telegram-боты на aiogram 3.

## Живое демо

**https://artesuavee.github.io/portfolio/**

## Что внутри

### Лендинги (20) — адаптивные одностраничники

| Проект | Ниша | Особенности |
|---|---|---|
| BLADE | Барбершоп | Dark, gold accents |
| FreshBox | Доставка еды | Cards, order flow |
| ОРЛОВ.FIT | Фитнес-тренер | Bold typography |
| ТОРК | Автосервис | Industrial style |
| Денталь | Стоматология | Clean medical |
| ZERNO | Кофейня | Warm tones |
| ДОМ Эксперт | Недвижимость | Property listings |
| SkillUp | Онлайн-курсы | Pricing tables |
| LUMÉ | Салон красоты | Elegant serif |
| ЛЕКС | Юридические услуги | Trust-focused |
| IronGym | Фитнес-клуб | Dark, orange accent, zones |
| FlowSync | SaaS-платформа | Dashboard mockup, GitHub-dark |
| МедЦентр | Медицинский центр | Booking form, doctors grid |
| NexChain | DeFi / Крипто | Neon purple, animated blobs |
| Wanderlust | Туризм | Sticky nav, destination grid |
| Pixel Agency | Digital-агентство | Custom cursor, marquee |
| EventPro | Организация мероприятий | Confetti animation, portfolio |
| PrimeEstate | Элитная недвижимость | Warm cream, property badges |
| Idris.dev | Developer portfolio | Terminal UI, monospace |
| Ember | Ресторан высокой кухни | Dark luxury, gold accents |

### Мобильные приложения (5) — React Native / Expo

| Приложение | Описание | Технологии |
|---|---|---|
| FitPulse | Фитнес-трекер с прогрессом | Expo, AsyncStorage, charts |
| FoodGo | Доставка еды с корзиной | React Navigation, cart logic |
| MoneyKeep | Учёт финансов | AsyncStorage, категории |
| TaskFlow | Менеджер задач | FSM, приоритеты, дедлайны |
| ShopMate | Мобильный магазин | Catalog, checkout, favorites |

### AI-агенты (10) — Python + Claude API

| Агент | Назначение | Ключевые возможности |
|---|---|---|
| support | Клиентская поддержка | Claude + история диалога |
| sales | Продажи / квалификация лидов | Lead scoring, SPIN |
| automation | Автоматизация рабочих процессов | Workflow chains |
| analytics | Анализ данных и отчёты | JSON → insights |
| assistant | Telegram AI-ассистент | Bot + Claude |
| hr | HR-скрининг резюме | Score 0-100, hire/reject/maybe |
| content | Контент-генератор | post/email/article/ad, варианты |
| research | Веб-ресёрч агент | Tool use: search_web, fetch_page |
| code_review | Code review | Issues по severity, score 1-10 |
| translator | Переводчик | 7 языков, 6 контекстов |

### Telegram-боты (10) — aiogram 3 + Claude API

| Бот | Назначение | Фишки |
|---|---|---|
| restaurant_bot | Ресторан + бронирование | FSM, меню, подтверждение |
| feedback_bot | Сбор отзывов | InlineKeyboard рейтинг, сентимент |
| support_bot | Техподдержка | Классификация, тикеты, эскалация |
| quiz_bot | Квиз | AI-генерация вопросов, счёт |
| language_bot | Изучение языков | 5 языков, упражнения |
| analytics_bot | Анализ данных | CSV/JSON upload, Claude insights |
| ecommerce_bot | Интернет-магазин | Каталог, корзина, FSM checkout |
| faq_bot | FAQ + база знаний | TF-IDF поиск, AI fallback |
| news_bot | Дайджест новостей | RSS-парсинг, суммаризация |
| hr_bot | HR / вакансии | AI-скрининг резюме, кандидаты |

## Технологии

**Frontend:** HTML5 / CSS3, Vanilla JS, Three.js, анимации  
**Mobile:** React Native, Expo, AsyncStorage, React Navigation  
**AI Agents:** Python 3.12, Anthropic SDK, Tool Use, FastAPI  
**Chatbots:** Python, aiogram 3.x, FSM, Claude API  
**Стиль:** Адаптивная вёрстка, тёмные темы, современный UI

## Структура репозитория

```
portfolio/
├── index.html              # Витрина всех проектов
├── [landing-name]/         # 20 лендингов
│   └── index.html
├── mobile-apps/            # 5 мобильных приложений (Expo)
│   └── [app-name]/
├── ai-agents/              # 10 AI-агентов (Python)
│   ├── core/               # Базовый Claude клиент
│   └── [agent-name]/
└── chatbots/               # 10 Telegram-ботов
    ├── shared/             # Общий BotClaudeClient
    └── [bot-name]/
```

## Запуск

Лендинги — открыть `index.html` или:
```bash
python -m http.server 8000
```

AI-агенты:
```bash
cd ai-agents
pip install anthropic
ANTHROPIC_API_KEY=sk-... python -m hr.cli resume.txt
ANTHROPIC_API_KEY=sk-... python -m research.cli "тема" --depth deep
```

Telegram-боты:
```bash
cd chatbots
pip install aiogram anthropic
BOT_TOKEN=... ANTHROPIC_API_KEY=sk-... python restaurant_bot/bot.py
```

---
© 2026 · Демо-проекты для портфолио
