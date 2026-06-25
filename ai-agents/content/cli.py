"""CLI: python -m content.cli --type post --topic "AI разработка" --audience "стартапы" """
from __future__ import annotations

import argparse

from .agent import ContentAgent, CONTENT_TYPES


def main() -> None:
    parser = argparse.ArgumentParser(description="Content marketing agent")
    parser.add_argument("--type", choices=list(CONTENT_TYPES.keys()), default="post",
                        help="Тип контента")
    parser.add_argument("--topic", required=True, help="Тема текста")
    parser.add_argument("--audience", default="широкая аудитория", help="Целевая аудитория")
    parser.add_argument("--tone", default="дружелюбный", help="Тон текста")
    parser.add_argument("--lang", default="ru", help="Язык (ru/en/kz)")
    parser.add_argument("--variants", type=int, default=1, help="Кол-во вариантов")
    args = parser.parse_args()

    agent = ContentAgent()

    if args.variants > 1:
        texts = agent.variants(args.type, args.topic, args.variants)
        for i, text in enumerate(texts, 1):
            print(f"\n{'='*50}\nВариант {i}:\n{'='*50}\n{text}")
    else:
        print(agent.generate(args.type, args.topic, args.audience, args.tone, args.lang))


if __name__ == "__main__":
    main()
