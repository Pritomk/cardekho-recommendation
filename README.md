# CarDekho AI Advisor

CarDekho AI Advisor is an intelligent, AI-native car buying assistant. It builds a detailed driver profile, scores cars using deterministic product logic, and leverages a Large Language Model (LLM) to explain recommendations in human terms. 

Instead of letting an AI arbitrarily guess which car you should buy (which leads to hallucinations), this system calculates the math behind safety, comfort, and budget first, and then uses AI purely for personalization and explanation.

---

## 🚀 Installation & Deployment Guide

The project is split into a Next.js frontend and a Python FastAPI backend.

### Running the Backend Locally
The backend uses Python, FastAPI, and an SQLite database seeded automatically on startup.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running the Frontend Locally
The frontend uses Next.js and Tailwind CSS.

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. 
*(If the development server hangs, run `npm run build && npm run start` or visit `http://127.0.0.1:3000`)*.

### Deployment
- **Frontend:** Automatically deployable to [Vercel](https://vercel.com). Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your backend.
- **Backend:** Configured for easy deployment on [Render](https://render.com) (via standard Web Service) or Railway. Requires setting `PYTHON_VERSION=3.12`, `LLM_PROVIDER`, and your specific API key (e.g., `NVIDIA_API_KEY`).

---

## 🧠 Project Reflections

### What did you build and why? What did you deliberately cut?
**Built:** I built an interactive car discovery wizard that translates technical car specs into lifestyle fits. The goal was to solve the paradox of choice in car buying—buyers are often overwhelmed by filters like "torque" or "wheelbase" when they really just want to know if it fits their family and budget. 
**Cut:** I deliberately cut live pricing/inventory APIs and user authentication. Instead of connecting to a live dealer database, I used a static SQLite seed database to keep the MVP focused entirely on the AI recommendation engine and user experience. I also deliberately prevented the LLM from choosing the cars directly to avoid hallucinations, delegating that to a deterministic scoring algorithm instead.

### What’s your tech stack and why did you pick it?
- **Frontend:** Next.js (React), Tailwind CSS, and Framer Motion. Picked because it allows for rapid creation of highly polished, interactive UI wizards with great performance.
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite. Python is the undisputed king of AI integration (allowing easy use of tools like `sentence-transformers`). FastAPI provides massive speed benefits and automatic Swagger UI documentation, while SQLite keeps the database portable for the MVP.
- **Hosting:** Vercel (Frontend) and Render/Railway (Backend).

### What did you delegate to AI tools vs. do manually? 
**Delegated:** I heavily relied on AI to scaffold the initial boilerplate for both the FastAPI routes and the Next.js UI components. AI generated the complex, repetitive Tailwind styling, the base structure of the deterministic scoring algorithm, and the database seed data.
**Manual:** I manually handled deployment configurations, CORS debugging, environment variable management, and resolving local networking quirks (like fixing Next.js Turbopack hangs and FastAPI CORS wildcard crashes).

**Where did the tools help most?**
AI was incredible at rapidly iterating the frontend design (building the wizard flow) and abstracting the LLM integration layer so I could easily swap between OpenAI, Anthropic, or NVIDIA API keys.

**Where did they get in the way?**
AI tools sometimes struggled with highly specific, environmental deployment quirks. For example, trying to deploy Python 3.14 to Render caused compilation errors with `pydantic-core`, which required manual log reading and fixing by downgrading the environment to Python 3.12. 

### If you had another 4 hours, what would you add?
1. **PostgreSQL & Auth:** I would swap SQLite for Postgres and add user authentication (via NextAuth or Supabase) so users can save their garage and recommendation history.
2. **RAG (Retrieval-Augmented Generation):** I would integrate Pinecone or a vector database with actual PDF car manuals, allowing the LLM to answer highly specific questions like *"Does this exact trim have ISOFIX mounts in the third row?"*
3. **Live Market Data:** Hook into an actual live car API to pull real-time pricing and local dealership availability.
