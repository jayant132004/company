from abc import ABC, abstractmethod
from typing import Dict, List, Any

class BaseMentor(ABC):
    """
    Abstract Base Class outlining standard methods for all AlgoVerse Mentors.
    TreeMentor, GraphMentor, DynamicProgrammingMentor, etc. will inherit
    from this class to plug directly into the shared AI tutoring and RAG core.
    """

    @abstractmethod
    def get_mentor_id(self) -> str:
        """Returns unique string identifier (e.g. 'sortmentor', 'treementor')."""
        pass

    @abstractmethod
    def get_mentor_name(self) -> str:
        """Returns user-facing title (e.g. 'TreeMentor')."""
        pass

    @abstractmethod
    def get_supported_algorithms(self) -> List[str]:
        """Returns list of algorithm keys supported by this mentor module."""
        pass

    @abstractmethod
    def execute_algorithm(self, algorithm: str, input_data: Any) -> Dict[str, Any]:
        """
        Executes an algorithm on the provided dataset and logs visualization steps.
        Must return standard format:
        {
            "result": Any,
            "steps": List[Dict[str, Any]],
            "metrics": Dict[str, Any]
        }
        """
        pass

    @abstractmethod
    def get_complexity_bounds(self, algorithm: str) -> Dict[str, str]:
        """Returns complexity bounds (e.g., {'time': 'O(n log n)', 'space': 'O(n)'})."""
        pass
