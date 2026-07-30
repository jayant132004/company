from typing import Dict, List, Set, Any

class ConceptNode:
    def __init__(self, id: str, name: str, topic: str, difficulty: str, prerequisites: List[str] = None):
        self.id = id
        self.name = name
        self.topic = topic
        self.difficulty = difficulty
        self.prerequisites = prerequisites or []

# Global CS Knowledge Graph Nodes Map
GLOBAL_KNOWLEDGE_GRAPH: Dict[str, ConceptNode] = {
    "arrays": ConceptNode("arrays", "Arrays Basics", "foundations", "beginner"),
    "recursion": ConceptNode("recursion", "Recursion", "foundations", "beginner"),
    "sorting": ConceptNode("sorting", "Sorting Introduction", "sorting", "beginner", ["arrays"]),
    "bubblesort": ConceptNode("bubblesort", "Bubble Sort", "sorting", "beginner", ["sorting"]),
    "insertionsort": ConceptNode("insertionsort", "Insertion Sort", "sorting", "beginner", ["sorting"]),
    "selectionsort": ConceptNode("selectionsort", "Selection Sort", "sorting", "beginner", ["sorting"]),
    "mergesort": ConceptNode("mergesort", "Merge Sort", "sorting", "intermediate", ["sorting", "recursion"]),
    "quicksort": ConceptNode("quicksort", "Quick Sort", "sorting", "intermediate", ["sorting", "recursion"]),
    "heapsort": ConceptNode("heapsort", "Heap Sort", "sorting", "intermediate", ["sorting"]),
    "timsort": ConceptNode("timsort", "Tim Sort", "sorting", "advanced", ["mergesort", "insertionsort"]),
    "binarysearch": ConceptNode("binarysearch", "Binary Search", "searching", "beginner", ["arrays"]),
    "interpolationsearch": ConceptNode("interpolationsearch", "Interpolation Search", "searching", "intermediate", ["binarysearch"]),
}

def get_node(concept_id: str) -> ConceptNode:
    clean_id = concept_id.lower().replace(" ", "").replace("_", "")
    return GLOBAL_KNOWLEDGE_GRAPH.get(clean_id)

def get_prerequisites(concept_id: str) -> List[str]:
    node = get_node(concept_id)
    return node.prerequisites if node else []

def get_all_concepts() -> List[Dict[str, Any]]:
    return [
        {
            "id": node.id,
            "name": node.name,
            "topic": node.topic,
            "difficulty": node.difficulty,
            "prerequisites": node.prerequisites
        }
        for node in GLOBAL_KNOWLEDGE_GRAPH.values()
    ]
