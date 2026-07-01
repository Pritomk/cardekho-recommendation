from app.core.config import settings
from app.llm.base import LLMService
from app.llm.mock import MockLLMService
from app.llm.providers import HTTPProviderLLMService, provider_key


def get_llm_service() -> LLMService:
    provider = settings.llm_provider.lower()
    if provider == "mock":
        return MockLLMService()
    if provider in ("nvidia", "nvidia_nim"):
        from app.llm.providers import NVIDIAProviderLLMService
        return NVIDIAProviderLLMService(provider=provider, api_key=provider_key(provider))
        
    return HTTPProviderLLMService(provider=provider, api_key=provider_key(provider))

