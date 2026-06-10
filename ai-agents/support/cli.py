"""Запуск агента поддержки в терминале:  python -m support.cli"""
from __future__ import annotations

from support.agent import SupportAgent


def main() -> None:
    agent = SupportAgent()
    print("Агент поддержки 24/7. Напишите вопрос ('выход' — завершить).\n")
    print("Бот: Здравствуйте! 👋 Я виртуальный помощник. Чем могу помочь?")
    while True:
        try:
            msg = input("Вы: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if msg.lower() in {"выход", "exit", "quit"}:
            break
        if not msg:
            continue
        print(f"Бот: {agent.reply(msg)}\n")


if __name__ == "__main__":
    main()
