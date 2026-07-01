from abc import ABC, abstractmethod
from typing import Any


class LLMService(ABC):
    @abstractmethod
    def generate(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def chat(self, messages: list[dict[str, str]], context: dict[str, Any] | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def structured_output(
        self,
        prompt: str,
        schema: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        raise NotImplementedError

