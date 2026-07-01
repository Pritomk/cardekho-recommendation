from datetime import datetime, timedelta

from app.knowledge.sources.base import DynamicSource


class NewsMockSource(DynamicSource):
    def fetch_updates(self) -> list[dict]:
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        return [
            {
                "category": "Safety",
                "title": "Bharat NCAP new safety ratings announced for compact SUVs",
                "content": "Bharat NCAP has updated its safety rating criteria. Several popular compact SUVs like Tata Nexon and Mahindra XUV300 have retained their 5-star ratings under the newer, stricter norms, making them excellent choices for safety-conscious buyers.",
                "source": "Bharat NCAP Official Press Release",
                "updated_date": yesterday,
                "confidence": "High",
            },
            {
                "category": "Fuel",
                "title": "E20 Fuel rollout expanded across major metro cities",
                "content": "The government has accelerated the E20 (20% Ethanol blend) fuel rollout. It is now available at 80% of fuel stations in metro cities. Vehicles not compatible with E20 may face long-term engine wear if forced to use it, significantly increasing maintenance costs after 5 years.",
                "source": "Ministry of Petroleum",
                "updated_date": "2 days ago",
                "confidence": "High",
            },
        ]
