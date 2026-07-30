import os
import glob
import hashlib
from typing import List, Dict, Any
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

client = None
collection_name = "algoverse_knowledge"
in_memory_docs: List[Dict[str, Any]] = []

def get_qdrant_client():
    global client
    if client is not None:
        return client
    try:
        # Connect to local or remote Qdrant instance
        client = QdrantClient(url=settings.QDRANT_HOST, api_key=settings.QDRANT_API_KEY, timeout=1.0)
        client.get_collections()
        print(f"[Qdrant] Connected successfully to host: {settings.QDRANT_HOST}")
    except Exception as e:
        print(f"[Qdrant] Connection failed: {e}. Operating in local in-memory fallback mode.")
        client = None
    return client

def get_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimension vector embedding for the given text.
    Uses Google Gemini Embeddings API if GEMINI_API_KEY is present,
    otherwise falls back to a deterministic hash-seeded normalized vector.
    """
    if settings.GEMINI_API_KEY:
        try:
            import requests
            # API endpoint to fetch embeddings from text-embedding-004
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text}]}
            }
            res = requests.post(url, json=payload, timeout=4)
            if res.status_code == 200:
                return res.json()["embedding"]["values"]
            else:
                print(f"[Embedding API] Returned status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[Embedding API] Gemini API request error: {e}. Falling back to deterministic hashing.")
            
    # Deterministic vector fallback (ensuring stability across offline tests)
    hash_obj = hashlib.sha256(text.encode('utf-8'))
    seed = int(hash_obj.hexdigest(), 16) % (2**32)
    rng = np.random.default_rng(seed)
    vector = rng.standard_normal(768).tolist()
    
    # Normalize vector to unit length
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = [float(v / norm) for v in vector]
    return vector

def index_knowledge_base():
    """
    Scans the knowledge base directory, reads all markdown documents,
    splits them by headings, and indexes them in Qdrant and the in-memory fallback list.
    """
    global in_memory_docs
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    kb_path = os.path.join(base_dir, "knowledge_base")
    
    if not os.path.exists(kb_path):
        print(f"[Qdrant] Knowledge base directory does not exist: {kb_path}")
        return
        
    md_files = glob.glob(os.path.join(kb_path, "*.md"))
    docs = []
    
    for file_path in md_files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Simple header-based chunking
            sections = content.split("\n#")
            for section in sections:
                if not section.strip():
                    continue
                section_text = "#" + section if not section.startswith("#") else section
                docs.append({
                    "filename": filename,
                    "text": section_text.strip()
                })
        except Exception as e:
            print(f"[Qdrant] Failed to read {filename}: {e}")
            
    in_memory_docs = docs
    print(f"[Qdrant] Loaded {len(docs)} knowledge segments into memory.")
    
    q_client = get_qdrant_client()
    if q_client:
        try:
            # Create collection if missing
            collections_resp = q_client.get_collections()
            collections = [c.name for c in collections_resp.collections]
            
            if collection_name not in collections:
                q_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=models.VectorParams(
                        size=768,
                        distance=models.Distance.COSINE
                    )
                )
                print(f"[Qdrant] Created collection '{collection_name}'")
                
            points = []
            for idx, doc in enumerate(docs):
                embedding = get_embedding(doc["text"])
                points.append(
                    models.PointStruct(
                        id=idx,
                        vector=embedding,
                        payload=doc
                    )
                )
            
            if points:
                q_client.upsert(collection_name=collection_name, points=points)
                print(f"[Qdrant] Indexed {len(points)} points successfully.")
        except Exception as e:
            print(f"[Qdrant] Ingestion failed: {e}")

def search_knowledge(query: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Search indexed knowledge base by semantic similarity using Qdrant.
    Falls back to a keyword density scanner if offline or disconnected.
    """
    q_client = get_qdrant_client()
    if q_client:
        try:
            query_vector = get_embedding(query)
            search_results = q_client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit
            )
            return [hit.payload for hit in search_results]
        except Exception as e:
            print(f"[Qdrant] Query search failed: {e}. Switching to keyword match fallback.")
            
    # Keyword-matching fallback logic
    query_words = set(query.lower().split())
    matches = []
    for doc in in_memory_docs:
        score = sum(1 for word in query_words if word in doc["text"].lower())
        if score > 0:
            matches.append((score, doc))
            
    matches.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in matches[:limit]]
