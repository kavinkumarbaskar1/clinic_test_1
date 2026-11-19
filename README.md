# Clinic booking app

Baseline full-stack scaffold for the clinic scheduling application.

## Frontend

```bash
npm install
npm run dev:frontend
```

The React app runs on `http://localhost:5173` by default. Set
`VITE_API_BASE_URL` in `frontend/.env` when the API is not available at
`http://localhost:8000/api`.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The FastAPI app runs on `http://localhost:8000` by default. The baseline
health endpoint is available at `GET /api/health` and does not read or write
patient scheduling data.

## Linting

```bash
npm run lint
cd backend && ruff check .
```
