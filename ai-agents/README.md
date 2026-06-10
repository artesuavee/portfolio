# AI Agents — 5 готовых ИИ-агентов на Claude

Полноценные рабочие агенты на Python на базе Claude API. Каждый собран из демо-макета
портфолио и доведён до запускаемого кода.

| Агент | Что делает | Запуск |
|-------|------------|--------|
| **support** | Поддержка 24/7: база знаний, статус заказа, эскалация оператору | `python -m support.cli` |
| **sales** | Продажи: квалификация лида, тарифы, ссылка на оплату | `python -m sales.cli` |
| **telegram** | ИИ-ассистент в Telegram (aiogram, меню-кнопки) | `python -m telegram.bot` |
| **automation** | Цепочка «заявка → ИИ → CRM → Telegram → email» | `python -m automation.cli` |
| **analytics** | KPI по данным + выводы и рекомендации от ИИ | `python -m analytics.cli` |

Плюс единый веб-API: `uvicorn api.server:app --reload` → http://127.0.0.1:8000/docs

## Установка

```bash
cd ai-agents
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # и впишите свои ключи
```

Минимально нужен `ANTHROPIC_API_KEY`. Для telegram-агента — `TELEGRAM_BOT_TOKEN`.
Агент **automation** работает и без внешних ключей: при отсутствии настроек
CRM/Telegram/SMTP коннекторы переходят в режим «сухого прогона» (печатают действия).

## Архитектура

```
core/            общее ядро
  config.py      настройки из .env
  claude_client.py  обёртка Claude: диалог + вызов инструментов (function calling)
support/  sales/  telegram/  automation/  analytics/   — сами агенты
api/server.py    FastAPI, объединяющий агентов в веб-сервис
```

Все агенты используют единый `ClaudeClient`, поэтому модель меняется одной
переменной `ANTHROPIC_MODEL` в `.env` — без правки кода.

## Примечание по моделям
По умолчанию `ANTHROPIC_MODEL=claude-sonnet-4-5`. Актуальный id модели можно
посмотреть в консоли Anthropic и поменять в `.env`.
