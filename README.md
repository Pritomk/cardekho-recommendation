# CarDekho AI Advisor

AI-native car buying advisor that builds a driver profile, scores cars through deterministic product logic, and uses an abstract LLM layer to explain the recommendations.

## What It Builds

- Interactive discovery flow with cards, chips, sliders, and priority ranking.
- FastAPI backend with SQLite, SQLAlchemy models, seed data, sessions, recommendations, comparisons, and follow-up Q&A.
- Pluggable `LLMService` interface with `generate()`, `chat()`, and `structured_output()`.
- Recommendation engine that scores safety, comfort, maintenance, mileage, driving fit, family fit, ownership cost, resale, performance, and budget match.
- AI buyer report, smart insights, "why this car for you", and "why not the others" explanations.

## Run Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend seeds SQLite from `backend/app/data/cars.json` on startup.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## LLM Providers

The MVP defaults to `LLM_PROVIDER=mock`, which keeps the app fully runnable without API keys. To plug in a provider later, set `LLM_PROVIDER` to `openai`, `gemini`, `claude`, `anthropic`, `nvidia`, or `nvidia_nim`, then provide the matching API key in `.env`.

The backend never lets the LLM choose cars directly. It calculates candidates first, then asks the LLM layer to explain, summarize, or answer follow-up questions using recommendation context.

## API

- `GET /health`
- `GET /api/brands`
- `POST /api/recommendations`
- `POST /api/compare`
- `POST /api/follow-up`

