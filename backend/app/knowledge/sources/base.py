from abc import ABC, abstractmethod


class DynamicSource(ABC):
    @abstractmethod
    def fetch_updates(self) -> list[dict]:
        """
        Fetch dynamic updates.
        Returns a list of dictionaries containing:
        - category: str
        - title: str
        - content: str
        - source: str
        - updated_date: str
        - confidence: str
        """
        raise NotImplementedError
