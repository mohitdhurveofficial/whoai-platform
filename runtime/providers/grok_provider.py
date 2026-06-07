import os
from openai import AsyncOpenAI
from runtime.providers.openai_provider import OpenAIProvider

class GrokProvider(OpenAIProvider):
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key or os.getenv("GROK_API_KEY", os.getenv("XAI_API_KEY"))
        # Grok uses an OpenAI-compatible API
        self.client = AsyncOpenAI(
            api_key=self.api_key, 
            base_url="https://api.x.ai/v1",
            timeout=timeout
        )
