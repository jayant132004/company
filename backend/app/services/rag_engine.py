import requests
import json
from typing import List, Dict, Any
from app.core.config import settings
from app.services.qdrant_service import search_knowledge

def call_gemini(system_prompt: str, user_prompt: str) -> str:
    """Queries Google Gemini 1.5 Flash using direct HTTP request."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"System Instruction: {system_prompt}\n\nUser Question: {user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 600
        }
    }
    headers = {"Content-Type": "application/json"}
    res = requests.post(url, json=payload, headers=headers, timeout=10)
    if res.status_code == 200:
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]
    else:
        raise Exception(f"Gemini API returned status {res.status_code}: {res.text}")

def call_groq(system_prompt: str, user_prompt: str) -> str:
    """Queries Groq API using Llama-3."""
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.3,
        max_tokens=600
    )
    return chat_completion.choices[0].message.content

def generate_offline_fallback(question: str, algorithm: str, array_state: List[int], step_index: int, visualizer_event: str, step_message: str, context_docs: List[Dict[str, Any]]) -> str:
    """Informative placeholder response if no AI keys are available."""
    context_summary = ""
    if context_docs:
        context_summary = "\n\nRetrieved Concept Notes:\n" + "\n".join([f"- {doc['text'][:150]}..." for doc in context_docs])
        
    return f"**[Offline Mode]** I received your query: *\"{question}\"*\n\nHere is what is happening at the active visualizer step:\n" \
           f"- **Algorithm**: {algorithm.capitalize()} Sort\n" \
           f"- **Active Step**: {step_index}\n" \
           f"- **Event Type**: {visualizer_event}\n" \
           f"- **Visualizer Action**: {step_message}\n" \
           f"- **Current Array**: `{array_state}`\n\n" \
           f"Please set your `GEMINI_API_KEY` in the environment `.env` to enable full context-aware tutoring and reasoning. {context_summary}"

def generate_tutor_response(
    question: str,
    algorithm: str,
    array_state: List[int],
    step_index: int,
    total_steps: int,
    visualizer_event: str,
    step_message: str
) -> str:
    """
    RAG Tutoring Engine. Retrieves semantic context from the knowledge base,
    injects active visualizer states, and prompts the LLM to explain the step.
    """
    # 1. Retrieve relevant educational content from Qdrant vector database
    search_query = f"{algorithm} sorting algorithm stability complexity swaps comparisons"
    retrieved_docs = search_knowledge(search_query, limit=2)
    
    context_text = "\n\n".join([doc["text"] for doc in retrieved_docs]) if retrieved_docs else "No specific textbook reference found."
    
    # 2. Formulate System Prompt with RAG structure
    system_prompt = (
        "You are SortMentor, the AI teaching assistant for the AlgoVerse CS learning platform. "
        "Your goal is to explain sorting algorithms in an intuitive, engaging, and clear manner. "
        "You must answer user questions based on the retrieved textbook references AND the active "
        "visualization state of the sorting algorithm. Be concise, educational, and accurate.\n\n"
        f"--- RETRIEVED TEXTBOOK REFERENCES ---\n{context_text}\n\n"
        f"--- ACTIVE VISUALIZATION STATE ---\n"
        f"- Algorithm: {algorithm.capitalize()} Sort\n"
        f"- Current step: {step_index} of {total_steps}\n"
        f"- Current Array: {array_state}\n"
        f"- Event happening right now: {visualizer_event}\n"
        f"- Visualizer message: {step_message}\n"
    )
    
    # 3. Call LLM
    if settings.GEMINI_API_KEY:
        try:
            return call_gemini(system_prompt, question)
        except Exception as e:
            print(f"[RAG Engine] Gemini failed: {e}. Trying Groq fallback.")
            
    if settings.GROQ_API_KEY:
        try:
            return call_groq(system_prompt, question)
        except Exception as e:
            print(f"[RAG Engine] Groq failed: {e}.")
            
    # 4. Fallback if no keys or API failures
    return generate_offline_fallback(question, algorithm, array_state, step_index, visualizer_event, step_message, retrieved_docs)
