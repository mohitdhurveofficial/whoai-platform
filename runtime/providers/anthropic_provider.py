import os
import time
import uuid
from typing import Dict, Any, AsyncGenerator
from anthropic import AsyncAnthropic
from runtime.providers.base import BaseProvider

class AnthropicProvider(BaseProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = AsyncAnthropic(api_key=self.api_key, timeout=timeout)

    def _convert_messages(self, messages: list) -> tuple:
        system = ""
        anthropic_msgs = []
        for msg in messages:
            if msg["role"] == "system":
                system = msg["content"]
            else:
                anthropic_msgs.append({"role": msg["role"], "content": msg["content"]})
        return system, anthropic_msgs

    async def chat_completion(self, model: str, messages: list, **kwargs) -> Dict[str, Any]:
        system, formatted_messages = self._convert_messages(messages)
        if "max_tokens" not in kwargs:
            kwargs["max_tokens"] = 1024

        response = await self.client.messages.create(
            model=model,
            system=system,
            messages=formatted_messages,
            **kwargs
        )
        
        return {
            "id": response.id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response.content[0].text if response.content else ""
                    },
                    "finish_reason": response.stop_reason
                }
            ],
            "usage": {
                "prompt_tokens": response.usage.input_tokens,
                "completion_tokens": response.usage.output_tokens,
                "total_tokens": response.usage.input_tokens + response.usage.output_tokens
            }
        }

    async def stream_completion(self, model: str, messages: list, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        system, formatted_messages = self._convert_messages(messages)
        if "max_tokens" not in kwargs:
            kwargs["max_tokens"] = 1024

        stream = await self.client.messages.create(
            model=model,
            system=system,
            messages=formatted_messages,
            stream=True,
            **kwargs
        )
        
        req_id = f"chatcmpl-{uuid.uuid4()}"
        created = int(time.time())

        async for event in stream:
            if event.type == "content_block_delta":
                yield {
                    "id": req_id,
                    "object": "chat.completion.chunk",
                    "created": created,
                    "model": model,
                    "choices": [
                        {
                            "index": 0,
                            "delta": {
                                "content": event.delta.text
                            },
                            "finish_reason": None
                        }
                    ]
                }
            elif event.type == "message_stop":
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
            # Send a minimal request to test connection
            await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1,
                messages=[{"role": "user", "content": "hello"}]
            )
            return "healthy"
        except Exception:
            return "unhealthy"
