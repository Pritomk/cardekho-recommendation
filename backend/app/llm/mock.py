from typing import Any

from app.llm.base import LLMService


class MockLLMService(LLMService):
    def generate(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        if context and "draft" in context:
            return str(context["draft"])
        return prompt.strip()

    def chat(self, messages: list[dict[str, str]], context: dict[str, Any] | None = None) -> str:
        question = messages[-1]["content"] if messages else ""
        if context and "answer" in context:
            return str(context["answer"])
        return f"Based on your profile and the shortlisted cars, {question}"

    def structured_output(
        self,
        prompt: str,
        schema: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return context.get("output", {}) if context else {}

