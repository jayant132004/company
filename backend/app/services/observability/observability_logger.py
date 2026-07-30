import time
import os
from typing import Dict, Any

def log_ai_transaction(metrics: Dict[str, Any]):
    """
    Appends AI performance stats (tokens, response sizes, latency)
    to the ai_observability.log file in the project logs directory.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    log_dir = os.path.join(base_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "ai_observability.log")
    
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_line = (
        f"[{timestamp}] "
        f"Model: {metrics.get('model', 'Unknown')} | "
        f"Latency: {metrics.get('latency_ms', 0.0):.1f}ms | "
        f"Cache Hit: {metrics.get('cache_hit', False)} | "
        f"Tokens: {metrics.get('tokens', 'N/A')} | "
        f"Prompt Size: {metrics.get('prompt_size', 0)} chars | "
        f"Response Size: {metrics.get('response_size', 0)} chars\n"
    )
    
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_line)
        print(f"[Observability] Transaction logged (latency: {metrics.get('latency_ms', 0.0):.1f}ms)")
    except Exception as e:
        print(f"[Observability] Logger failed: {e}")
