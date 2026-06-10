"""Запуск агента продаж в терминале:  python -m sales.cli"""
from __future__ import annotations

from sales.agent import SalesAgent


def main() -> None:
    agent = SalesAgent()
    print("Агент продаж. Напишите сообщение ('выход' — завершить).\n")
    print("Бот: Здравствуйте! Подберу тариф под ваши задачи. Сколько у вас сотрудников?")
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
