# Health Track

React (Vite + TypeScript) frontend, FastAPI backend, MongoDB database.

```
.
├── backend/                 FastAPI app
│   ├── app/
│   │   ├── main.py          app factory, lifespan (connects to Mongo on startup)
│   │   ├── core/config.py   settings from env / .env
│   │   ├── db/mongo.py      client setup + get_db dependency
│   │   ├── api/router.py    registers route modules under /api
│   │   ├── api/routes/      one file per resource
│   │   └── schemas/         Pydantic request/response models
│   └── tests/
├── frontend/                React + TypeScript (Vite)
├── docker-compose.yml       local MongoDB (optional)
└── package.json             scripts to run everything
```

## Requirements

- Node 20+
- Python 3.10+
- A MongoDB database: MongoDB Atlas (cloud) or Docker for a local one

## Getting started

### 1. Install dependencies

```bash
npm run setup
```

This installs the frontend packages and creates the backend virtualenv (`backend/.venv`).

### 2. Configure the environment

Create the backend env file from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
MONGO_DB=app_db
CORS_ORIGINS=http://localhost:5173
```

- **MongoDB Atlas:** paste your connection string as `MONGO_URI`. In Atlas, make sure your IP is allowed under **Network Access** and the database user exists under **Database Access**.
- **Local MongoDB:** use `MONGO_URI=mongodb://localhost:27017` and run `npm run db` to start MongoDB in Docker.

Optional: `cp frontend/.env.example frontend/.env` to change `BACKEND_URL` / `VITE_API_BASE_URL`.

`.env` files are git-ignored. Never commit credentials.

### 3. Start the app

Run backend and frontend together:

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
# backend
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# frontend
npm --prefix frontend run dev
```

### 4. Open it

- Web app: http://localhost:5173 (the status card shows whether the API and MongoDB are connected)
- API docs: http://localhost:8000/docs

On Windows, replace `.venv/bin/` with `.venv\Scripts\`.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run setup`   | Install frontend deps and create backend venv |
| `npm run db`      | Start local MongoDB in Docker                 |
| `npm run dev`     | Run API (:8000) and web (:5173) together      |
| `npm run build`   | Build the frontend for production             |
| `npm run test`    | Run backend tests (needs MongoDB reachable)   |

## Troubleshooting

- **MongoDB shows disconnected / startup timeout:** check `MONGO_URI`, and for Atlas confirm your IP is allowlisted and the password is correct (URL-encode special characters).
- **CORS errors:** make sure `CORS_ORIGINS` in `backend/.env` matches the frontend URL.
- **`.venv/bin/uvicorn` not found:** run `npm run setup` first.

## Adding a feature

Backend: create `backend/app/api/routes/items.py`:

```python
from typing import Annotated
from fastapi import APIRouter, Depends
from pymongo.asynchronous.database import AsyncDatabase
from app.db.mongo import get_db

router = APIRouter()

@router.get("")
async def list_items(db: Annotated[AsyncDatabase, Depends(get_db)]):
    return await db.items.find({}, {"_id": 0}).to_list(100)
```

Register it in `api/router.py`:
`api_router.include_router(items.router, prefix="/items", tags=["items"])`.

Frontend: call it with `apiGet<Item[]>('/items')` from `src/api/client.ts`.
