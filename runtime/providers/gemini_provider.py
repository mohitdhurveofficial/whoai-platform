import os
import time
import uuid
from typing import Dict, Any, AsyncGenerator
from runtime.providers.base import BaseProvider
import google.generativeai as genai

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.timeout = timeout

    def _convert_messages(self, messages: list) -> list:
        # Convert standard messages to Gemini format
        gemini_msgs = []
        for msg in messages:
            role = "user" if msg["role"] in ["user", "system"] else "model"
            gemini_msgs.append({"role": role, "parts": [msg["content"]]})
        return gemini_msgs

    async def chat_completion(self, model: str, messages: list, **kwargs) -> Dict[str, Any]:
        gemini_msgs = self._convert_messages(messages)
        generative_model = genai.GenerativeModel(model)
        
        # We use synchronous call wrapped or asyncio if SDK supports it. 
        # google-generativeai supports generate_content_async
        response = await generative_model.generate_content_async(gemini_msgs)
        
        # Estimate usage as Gemini SDK sometimes doesn't return it perfectly in all versions
        prompt_tokens = generative_model.count_tokens(gemini_msgs).total_tokens if hasattr(generative_model, 'count_tokens') else 0
        completion_tokens = generative_model.count_tokens(response.text).total_tokens if hasattr(generative_model, 'count_tokens') else 0

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
        generative_model = genai.GenerativeModel(model)
        
        response = await generative_model.generate_content_async(gemini_msgs, stream=True)
        
        req_id = f"chatcmpl-{uuid.uuid4()}"
        created = int(time.time())

        async for chunk in response:
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
        if not self.api_key:
            return "unhealthy"
        try:
            generative_model = genai.GenerativeModel("gemini-2.5-flash")
            await generative_model.generate_content_async("hello")
            return "healthy"
        except Exception:
            return "unhealthy"
