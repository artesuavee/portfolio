"""Инструменты для ResearchAgent — реалистичный интерфейс с mock-реализацией."""
from __future__ import annotations

import json
from datetime import datetime

_notes: list[dict] = []


def search_web(query: str, max_results: int = 5) -> str:
    """Поиск в интернете по запросу. Возвращает JSON со списком результатов."""
    mock_results = [
        {
            "title": f"Результат {i+1} для: {query}",
            "url": f"https://example.com/article-{i+1}",
            "snippet": f"Релевантная информация по теме '{query}'. "
                       f"Источник {i+1} содержит подробный разбор темы...",
        }
        for i in range(min(max_results, 5))
    ]
    return json.dumps({"query": query, "results": mock_results}, ensure_ascii=False)


def fetch_page(url: str) -> str:
    """Получить содержимое страницы по URL. Возвращает текст страницы."""
    return (
        f"[Содержимое страницы: {url}]\n\n"
        f"Это демо-контент страницы. В реальной реализации здесь будет "
        f"полный текст страницы после парсинга HTML. "
        f"Страница содержит актуальную информацию по запрошенной теме, "
        f"включая статистику, цитаты экспертов и практические примеры."
    )


def save_note(text: str, tag: str = "general") -> str:
    """Сохранить заметку в процессе исследования."""
    note = {"id": len(_notes) + 1, "tag": tag, "text": text,
            "timestamp": datetime.now().isoformat()}
    _notes.append(note)
    return f"Заметка #{note['id']} сохранена (тег: {tag})"


def get_notes() -> list[dict]:
    return _notes.copy()


TOOLS_SCHEMA = [
    {
        "name": "search_web",
        "description": "Поиск информации в интернете по запросу",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Поисковый запрос"},
                "max_results": {"type": "integer", "description": "Макс. кол-во результатов",
                                "default": 5},
            },
            "required": ["query"],
        },
    },
    {
        "name": "fetch_page",
        "description": "Получить полное содержимое веб-страницы по URL",
        "input_schema": {
            "type": "object",
            "properties": {"url": {"type": "string", "description": "URL страницы"}},
            "required": ["url"],
        },
    },
    {
        "name": "save_note",
        "description": "Сохранить важную заметку в процессе исследования",
        "input_schema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Текст заметки"},
                "tag": {"type": "string", "description": "Тег для категоризации",
                        "default": "general"},
            },
            "required": ["text"],
        },
    },
]

HANDLERS = {
    "search_web": search_web,
    "fetch_page": fetch_page,
    "save_note": save_note,
}
