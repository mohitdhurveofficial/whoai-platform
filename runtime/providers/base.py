from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator

class BaseProvider(ABC):
    @abstractmethod
    async def chat_completion(self, model: str, messages: list, **kwargs) -> Dict[str, Any]:
        """Execute a standard chat completion request."""
        pass

    @abstractmethod
    async def stream_completion(self, model: str, messages: list, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """Execute a streaming chat completion request."""
        pass

    @abstractmethod
    async def health_check(self) -> str:
        """Check if the provider is healthy/reachable. Returns 'healthy' or 'unhealthy'."""
        pass
