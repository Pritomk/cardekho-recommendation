from typing import Any

import httpx

from app.core.config import settings
from app.llm.base import LLMService


class HTTPProviderLLMService(LLMService):
    def __init__(self, provider: str, api_key: str | None):
        self.provider = provider
        self.api_key = api_key

    def _missing_key_message(self) -> str:
        return (
            f"{self.provider} is selected, but no API key is configured. "
            "Set the provider key in the backend .env file."
        )

    def generate(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        if not self.api_key:
            return context.get("draft", self._missing_key_message()) if context else self._missing_key_message()
        return self._call_provider(prompt, context)

    def chat(self, messages: list[dict[str, str]], context: dict[str, Any] | None = None) -> str:
        if not self.api_key:
            return context.get("answer", self._missing_key_message()) if context else self._missing_key_message()
        prompt = "\n".join(f"{message['role']}: {message['content']}" for message in messages)
        return self._call_provider(prompt, context)

    def structured_output(
        self,
        prompt: str,
        schema: dict[str, Any],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not self.api_key:
            return context.get("output", {}) if context else {}
        return {"text": self._call_provider(prompt, {"schema": schema, **(context or {})})}

    def _call_provider(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        # Default mock fallback
        return context.get("draft", prompt) if context else prompt


class NVIDIAProviderLLMService(HTTPProviderLLMService):
    def _call_provider(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        # If context has a draft, we might want to append the prompt, but for now 
        # let's construct the messages payload for NVIDIA API.
        
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "accept": "application/json",
            "authorization": f"Bearer {self.api_key}",
            "content-type": "application/json",
        }
        
        # Build the final prompt by including context if present
        final_prompt = prompt
        if context:
            if "knowledge_context" in context:
                final_prompt = f"{context['knowledge_context']}\n\nTask: {prompt}"
            if "draft" in context:
                final_prompt = f"{final_prompt}\n\nDraft answer to build upon: {context['draft']}"
            elif "answer" in context:
                final_prompt = f"{final_prompt}\n\nDraft answer to build upon: {context['answer']}"
            
        payload = {
            "model": settings.llm_model if settings.llm_model != "advisor-default" else "google/diffusiongemma-26b-a4b-it",
            "messages": [
                {
                    "role": "user",
                    "content": final_prompt
                }
            ],
            "max_tokens": 4096,
            "temperature": 1,
            "top_p": 0.95,
            "stream": False,
            "chat_template_kwargs": {
                "enable_thinking": True
            }
        }
        
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"NVIDIA API Error: {e}")
            return context.get("draft", context.get("answer", prompt)) if context else prompt


def provider_key(provider: str) -> str | None:
    return {
        "openai": settings.openai_api_key,
        "gemini": settings.gemini_api_key,
        "claude": settings.anthropic_api_key,
        "anthropic": settings.anthropic_api_key,
        "nvidia": settings.nvidia_api_key,
        "nvidia_nim": settings.nvidia_api_key,
    }.get(provider)

