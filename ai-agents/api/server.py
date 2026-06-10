"""Единый веб-API для чат-агентов (support, sales) и автоматизации.

Запуск:  uvicorn api.server:app --reload
Доку Swagger:  http://127.0.0.1:8000/docs
"""
from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from automation import LeadWorkflow
from sales import SalesAgent
from support import SupportAgent

app = FastAPI(title="AI Agents API", version="1.0.0")

# По одному долгоживущему агенту на процесс (для демо).
_support = None
_sales = None


def support() -> SupportAgent:
    global _support
    if _support is None:
        _support = SupportAgent()
    return _support


def sales() -> SalesAgent:
    global _sales
    if _sales is None:
        _sales = SalesAgent()
    return _sales


class ChatIn(BaseModel):
    message: str


class ChatOut(BaseModel):
    reply: str


class Lead(BaseModel):
    name: str
    email: str
    message: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/support/chat", response_model=ChatOut)
def support_chat(body: ChatIn) -> ChatOut:
    return ChatOut(reply=support().reply(body.message))


@app.post("/sales/chat", response_model=ChatOut)
def sales_chat(body: ChatIn) -> ChatOut:
    return ChatOut(reply=sales().reply(body.message))


@app.post("/automation/lead")
def automation_lead(lead: Lead) -> dict:
    return LeadWorkflow().run(lead.model_dump())
