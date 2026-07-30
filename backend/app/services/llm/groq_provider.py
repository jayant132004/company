import asyncio
from app.services.llm.base_provider import BaseLLMProvider
from app.core.config import settings
from groq import Groq

class GroqProvider(BaseLLMProvider):
    """
    Plugin provider for Groq API using Llama-3 models.
    """

    async def generate(self, prompt: str, system_instruction: str = "") -> str:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is not configured.")
            
        def _execute_groq_completion():
            client = Groq(api_key=settings.GROQ_API_KEY)
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=600
            )
            return chat_completion.choices[0].message.content
            
        return await asyncio.to_thread(_execute_groq_completion)
