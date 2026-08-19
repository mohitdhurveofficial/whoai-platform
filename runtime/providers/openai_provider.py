import os
import time
import uuid
from typing import Dict, Any, AsyncGenerator, Optional
from openai import AsyncOpenAI
from runtime.providers.base import BaseProvider

class OpenAIProvider(BaseProvider):
    """Adapter for OpenAI and for every vendor that speaks its wire format.

    Groq, DeepSeek, xAI, Mistral, Together, OpenRouter and the rest all accept
    the same request body and return the same response shape; only the base URL
    and the environment variable holding the key differ, and both are supplied
    from providers.json by ProviderFactory. That is why there is no GrokProvider
    or DeepSeekProvider — they were this class with one string changed.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        *,
        base_url: Optional[str] = None,
        key_env: str = "OPENAI_API_KEY",
        key_required: bool = True,
    ):
        self.api_key = api_key or os.getenv(key_env)
        self.key_required = key_required
        # Self-hosted endpoints (Ollama, a private vLLM) authenticate by network
        # position rather than by key, but the SDK refuses to construct without
        # some value, hence the placeholder.
        self.client = AsyncOpenAI(
            api_key=self.api_key or "not-required",
            base_url=base_url,
            timeout=timeout,
        )

    def _format_unified_response(self, response, model: str) -> Dict[str, Any]:
        return {
            "id": response.id,
            "object": "chat.completion",
            "created": response.created,
            "model": model,
            "choices": [
                {
                    "index": choice.index,
                    "message": {
                        "role": choice.message.role,
                        "content": choice.message.content
                    },
                    "finish_reason": choice.finish_reason
                } for choice in response.choices
            ],
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            }
        }

    async def chat_completion(self, model: str, messages: list, **kwargs) -> Dict[str, Any]:
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=False,
            **kwargs
        )
        return self._format_unified_response(response, model)

    async def stream_completion(self, model: str, messages: list, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            **kwargs
        )
        
        async for chunk in stream:
            yield {
                "id": chunk.id,
                "object": "chat.completion.chunk",
                "created": chunk.created,
                "model": model,
                "choices": [
                    {
                        "index": choice.index,
                        "delta": {
                            "content": choice.delta.content if choice.delta.content else ""
                        },
                        "finish_reason": choice.finish_reason
                    } for choice in chunk.choices
                ]
            }

    async def health_check(self) -> str:
        if self.key_required and not self.api_key:
            return "unhealthy"
        try:
            await self.client.models.list(timeout=5.0)
            return "healthy"
        except Exception:
            return "unhealthy"
