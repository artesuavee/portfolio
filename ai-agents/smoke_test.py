"""Смоук-тест: проверяет, что все агенты импортируются и офлайн-логика работает.
Реальные ответы Claude выполняются только при наличии ANTHROPIC_API_KEY."""
import importlib
import os

MODS = [
    "support.agent",
    "sales.agent",
    "telegram.bot",
    "automation.workflow",
    "analytics.analyzer",
]

print("== Импорт всех 5 агентов ==")
for m in MODS:
    try:
        importlib.import_module(m)
        print("  OK  ", m)
    except Exception as e:  # noqa: BLE001
        print("  FAIL", m, "->", e)

print("\n== Офлайн-логика: KPI у ИИ-аналитика ==")
from analytics.analyzer import compute_kpis, load_csv

rows = load_csv("analytics/sample_data.csv")
for k, v in compute_kpis(rows).items():
    print(f"  {k}: {v}")

key = bool(os.getenv("ANTHROPIC_API_KEY"))
print("\nANTHROPIC_API_KEY задан:", key)
if key:
    print("\n== Живой тест: агент поддержки ==")
    from support import SupportAgent

    print("  Клиент: Где мой заказ №4821?")
    print("  Бот:", SupportAgent().reply("Где мой заказ №4821?"))

    print("\n== Живой тест: ИИ-аналитик (выводы) ==")
    from analytics import AnalyticsAgent

    print(AnalyticsAgent().report("analytics/sample_data.csv"))
else:
    print("Живые вызовы Claude пропущены — впишите ключ в .env (ANTHROPIC_API_KEY).")
