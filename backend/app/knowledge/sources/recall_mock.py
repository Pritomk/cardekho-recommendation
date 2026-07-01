from app.knowledge.sources.base import DynamicSource


class RecallMockSource(DynamicSource):
    def fetch_updates(self) -> list[dict]:
        return [
            {
                "category": "Vehicle Recalls",
                "title": "Maruti Suzuki recall for hybrid engine relay issue",
                "content": "Maruti Suzuki has issued a voluntary recall for the Grand Vitara Hybrid models manufactured between January and May 2023 due to a potential defect in the motor generator relay. Owners are advised to get it replaced at authorized service centers free of cost.",
                "source": "Manufacturer Recall Database",
                "updated_date": "1 week ago",
                "confidence": "High",
            }
        ]
