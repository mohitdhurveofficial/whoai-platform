import os
from openai import AsyncOpenAI
from runtime.providers.openai_provider import OpenAIProvider

class DeepSeekProvider(OpenAIProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        # DeepSeek uses an OpenAI-compatible API
        self.client = AsyncOpenAI(
            api_key=self.api_key, 
            base_url="https://api.deepseek.com",
            timeout=timeout
        )
