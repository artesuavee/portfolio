"""CLI: python -m translator.cli "Текст для перевода" --to en --context technical"""
from __future__ import annotations

import argparse
import sys

from .agent import TranslatorAgent, LANGUAGES, CONTEXTS


def main() -> None:
    parser = argparse.ArgumentParser(description="Multilingual translator agent")
    parser.add_argument("text", nargs="?", help="Текст для перевода (или stdin)")
    parser.add_argument("--to", default="en", choices=list(LANGUAGES.keys()),
                        help="Целевой язык")
    parser.add_argument("--from", dest="src", default="auto",
                        choices=["auto"] + list(LANGUAGES.keys()), help="Исходный язык")
    parser.add_argument("--context", default="general", choices=list(CONTEXTS.keys()),
                        help="Контекст перевода")
    parser.add_argument("--detect", action="store_true", help="Только определить язык")
    args = parser.parse_args()

    text = args.text or sys.stdin.read().strip()
    if not text:
        parser.print_help()
        sys.exit(1)

    agent = TranslatorAgent()

    if args.detect:
        lang = agent.detect_language(text)
        print(f"Определён язык: {lang} ({LANGUAGES.get(lang, lang)})")
        return

    result = agent.translate(text, target_lang=args.to, source_lang=args.src,
                             context=args.context)
    print(result)


if __name__ == "__main__":
    main()
