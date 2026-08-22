import os
from typing import List, Dict, Any
from app.services.qdrant_service import search_knowledge

def load_prompt_template(filename: str) -> str:
    """Loads prompt template from the backend/prompts/ folder with standard fallbacks."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    prompt_path = os.path.join(base_dir, "prompts", filename)
    
    if os.path.exists(prompt_path):
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    
    # Fallback default if file is missing
    return (
        "You are SortMentor at AlgoVerse. "
        "Textbook Context: {{textbook_context}}\n"
        "Algorithm: {{algorithm}}\n"
        "Step: {{step_index}}\n"
        "Message: {{step_message}}\n"
        "History: {{chat_history}}\n"
    )

def build_tutor_context(payload: Dict[str, Any], query: str, chat_history: str = "") -> str:
    """
    Assembles context from semantic searches, custom visualizer inputs,
    and chat history, merging them into the tutor.md prompt template.
    """
    # 1. Query hybrid knowledge retrieval
    algo = payload.get("algorithm", "sorting")
    search_query = f"{algo} {query}"
    retrieved_docs = search_knowledge(search_query, limit=2)
    
    textbook_context = ""
    if retrieved_docs:
        textbook_context = "\n\n".join([
            f"--- Document: {doc['filename']} ---\n{doc['text']}"
            for doc in retrieved_docs
        ])
    else:
        textbook_context = "No specific textbook reference found."

    # 2. Extract active visualization attributes
    algorithm_name = payload.get("algorithm", "Unknown")
    visualization_mode = payload.get("visualization_mode", "single")
    step_index = payload.get("step_index", 0)
    total_steps = payload.get("total_steps", 1)
    visualizer_event = payload.get("visualizer_event", "initial")
    step_message = payload.get("step_message", "Visualizer state loaded.")
    array_state = payload.get("array_state", [])
    
    # Advanced pointer detail mapping
    pointers = str(payload.get("pointers", []))
    comparisons = str(payload.get("comparisons", []))
    swaps = str(payload.get("swaps", []))
    queue = str(payload.get("queue", []))
    stack = str(payload.get("stack", []))
    complexity = payload.get("complexity", "O(n^2) average")
    speed = payload.get("speed", 150)

    # 3. Load dynamic prompt template
    template = load_prompt_template("tutor.md")

    # 4. Persona style configuration
    persona = payload.get("persona", "Tutor")
    if persona == "Coach":
        persona_instruction = (
            "### PERSONA STYLE: RIGOROUS COACH\n"
            "You must adopt the persona of a rigorous coach. Push the student to think deeper. "
            "Ask challenging quiz/follow-up questions at the end of your response to test their "
            "understanding of the sorting mechanics. Focus heavily on algorithm performance."
        )
    elif persona == "Examiner":
        persona_instruction = (
            "### PERSONA STYLE: FORMAL EXAMINER\n"
            "You must adopt the persona of a formal examiner. Your tone is formal, objective, "
            "and analytical. Perform precise interrogative analysis of the code and state, explaining "
            "exactly how it corresponds to correct execution bounds and invariants."
        )
    else:
        persona_instruction = (
            "### PERSONA STYLE: ENCOURAGING TUTOR\n"
            "You must adopt the persona of an encouraging tutor. Be friendly, direct, and explain "
            "concepts step-by-step using simple analogies."
        )

    # 5. Map placeholders
    formatted_prompt = template\
        .replace("{{textbook_context}}", textbook_context)\
        .replace("{{algorithm}}", str(algorithm_name))\
        .replace("{{visualization_mode}}", str(visualization_mode))\
        .replace("{{step_index}}", str(step_index))\
        .replace("{{total_steps}}", str(total_steps))\
        .replace("{{visualizer_event}}", str(visualizer_event))\
        .replace("{{step_message}}", str(step_message))\
        .replace("{{array_state}}", str(array_state))\
        .replace("{{pointers}}", pointers)\
        .replace("{{comparisons}}", comparisons)\
        .replace("{{swaps}}", swaps)\
        .replace("{{queue}}", queue)\
        .replace("{{stack}}", stack)\
        .replace("{{complexity}}", str(complexity))\
        .replace("{{speed}}", f"{speed}")\
        .replace("{{persona_instruction}}", persona_instruction)\
        .replace("{{chat_history}}", chat_history if chat_history else "No previous conversation history in this session.")

    return formatted_prompt
