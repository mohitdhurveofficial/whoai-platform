import os
import time
import uuid
from typing import Dict, Any, AsyncGenerator
from openai import AsyncOpenAI
from runtime.providers.base import BaseProvider

class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=self.api_key, timeout=timeout)

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
        if not self.api_key:
            return "unhealthy"
        try:
            await self.client.models.list(timeout=5.0)
            return "healthy"
        except Exception:
            return "unhealthy"
