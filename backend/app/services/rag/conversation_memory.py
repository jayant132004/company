import time
from typing import List, Dict, Any
from app.core.firebase import get_firestore_client

# Local memory cache for offline testing
_local_conversations: Dict[str, List[Dict[str, Any]]] = {}

def get_session_id(user_id: str, algorithm: str) -> str:
    """Helper to generate a unique session identifier."""
    clean_user = user_id.replace(":", "_").replace("/", "_")
    return f"{clean_user}_{algorithm}"

def save_message(user_id: str, algorithm: str, sender: str, text: str):
    """
    Appends a tutoring chat message to the active conversation history.
    Stores in the Firestore 'conversations' collection, or defaults to the local cache.
    """
    session_id = get_session_id(user_id, algorithm)
    message_node = {
        "sender": sender,
        "text": text,
        "timestamp": time.time()
    }
    
    try:
        db = get_firestore_client()
        if db:
            doc_ref = db.collection("conversations").document(session_id)
            doc = doc_ref.get()
            
            # Use firestore ArrayUnion to append atomicity
            from google.cloud import firestore
            if doc.exists:
                doc_ref.update({
                    "messages": firestore.ArrayUnion([message_node]),
                    "updated_at": time.time()
                })
            else:
                doc_ref.set({
                    "user_id": user_id,
                    "algorithm": algorithm,
                    "created_at": time.time(),
                    "updated_at": time.time(),
                    "messages": [message_node]
                })
            return
    except Exception as e:
        print(f"[Memory] Firestore connection failed: {e}. Storing message in local cache.")
        
    # Local fallback
    if session_id not in _local_conversations:
        _local_conversations[session_id] = []
    _local_conversations[session_id].append(message_node)

def get_chat_history_str(user_id: str, algorithm: str, limit: int = 6) -> str:
    """
    Retrieves the recent conversation exchange as a formatted string:
    'User: question\nSortMentor: explanation\n'
    Reads from Firestore or local fallback cache.
    """
    session_id = get_session_id(user_id, algorithm)
    messages = []
    
    try:
        db = get_firestore_client()
        if db:
            doc = db.collection("conversations").document(session_id).get()
            if doc.exists:
                messages = doc.to_dict().get("messages", [])
    except Exception as e:
        print(f"[Memory] Firestore read failed: {e}. Reading from local cache.")
        
    # Fetch from local memory if Firestore was empty or failed
    if not messages and session_id in _local_conversations:
        messages = _local_conversations[session_id]
        
    recent = messages[-limit:] if messages else []
    
    chat_str = ""
    for msg in recent:
        sender_lbl = "User" if msg["sender"] == "user" else "SortMentor"
        chat_str += f"{sender_lbl}: {msg['text']}\n"
        
    return chat_str

def get_chat_history_list(user_id: str, algorithm: str) -> List[Dict[str, Any]]:
    """Returns the list of raw conversation messages."""
    session_id = get_session_id(user_id, algorithm)
    
    try:
        db = get_firestore_client()
        if db:
            doc = db.collection("conversations").document(session_id).get()
            if doc.exists:
                return doc.to_dict().get("messages", [])
    except Exception:
        pass
        
    return _local_conversations.get(session_id, [])
