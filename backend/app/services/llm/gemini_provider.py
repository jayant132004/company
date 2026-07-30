import asyncio
import requests
from app.services.llm.base_provider import BaseLLMProvider
from app.core.config import settings

class GeminiProvider(BaseLLMProvider):
    """
    Plugin provider for Google Gemini 1.5 Flash completions.
    """

    async def generate(self, prompt: str, system_instruction: str = "") -> str:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"System Instruction: {system_instruction}\n\nUser Question/Prompt: {prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 600
            }
        }
        headers = {"Content-Type": "application/json"}
        
        # Execute HTTP request in background thread pool to prevent event-loop blocking
        res = await asyncio.to_thread(
            requests.post,
            url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if res.status_code == 200:
            return res.json()["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"Gemini API returned status {res.status_code}: {res.text}")
