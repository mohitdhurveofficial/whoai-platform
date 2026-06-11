import os
import time
import uuid
from typing import Dict, Any, AsyncGenerator
from runtime.providers.base import BaseProvider
from google import genai
from google.genai import types

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.timeout = timeout
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def _convert_messages(self, messages: list) -> list:
        # Convert standard messages to Gemini format
        gemini_msgs = []
        for msg in messages:
            role = "user" if msg["role"] in ["user", "system"] else "model"
            gemini_msgs.append({"role": role, "parts": [{"text": msg["content"]}]})
        return gemini_msgs

    async def chat_completion(self, model: str, messages: list, **kwargs) -> Dict[str, Any]:
        gemini_msgs = self._convert_messages(messages)
        
        response = await self.client.aio.models.generate_content(
            model=model,
            contents=gemini_msgs,
        )
        
        prompt_tokens = response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') and response.usage_metadata else 0
        completion_tokens = response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') and response.usage_metadata else 0

        return {
            "id": f"chatcmpl-{uuid.uuid4()}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response.text
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens
            }
        }

    async def stream_completion(self, model: str, messages: list, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        gemini_msgs = self._convert_messages(messages)
        
        response_stream = await self.client.aio.models.generate_content_stream(
            model=model,
            contents=gemini_msgs,
        )
        
        req_id = f"chatcmpl-{uuid.uuid4()}"
        created = int(time.time())

        async for chunk in response_stream:
            yield {
                "id": req_id,
                "object": "chat.completion.chunk",
                "created": created,
                "model": model,
                "choices": [
                    {
                        "index": 0,
                        "delta": {
                            "content": chunk.text
                        },
                        "finish_reason": None
                    }
                ]
            }

        yield {
            "id": req_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }
            ]
        }

    async def health_check(self) -> str:
        if not self.api_key or not self.client:
            return "unhealthy"

        try:
            await self.client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents="hello"
            )
            return "healthy"
        except Exception:
            return "unhealthy"
