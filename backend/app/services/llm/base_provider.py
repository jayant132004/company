from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):
    """
    Abstract contract class for all AI models (Gemini, Groq, OpenAI).
    Ensures interchangeable provider plugins for RAG pipelines.
    """

    @abstractmethod
    async def generate(self, prompt: str, system_instruction: str = "") -> str:
        """
        Executes a completion generation request.
        """
        pass
