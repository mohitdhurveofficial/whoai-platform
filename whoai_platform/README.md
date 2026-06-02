# WhoAI Platform

This repository contains the WhoAI backend and frontend applications in a single monorepo.

Structure:
- `backend/` — FastAPI backend (Python)
- `frontend/` — Next.js frontend (TypeScript)

Quick start

1. Backend (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

2. Frontend (Node)

```bash
cd frontend
npm install
npm run dev
```

Root scripts

From the repository root (`whoai_platform`) you can run the helper scripts in `package.json`:

```bash
# Install helper dev deps
npm install

# Start backend
npm run start:backend

# Start frontend
npm run start:frontend

# Run both (requires `concurrently` installed)
npm run dev
```

If you prefer, run the services individually from their directories. If anything breaks after the reorganization, open an issue and I'll help fix specific import or path errors.
