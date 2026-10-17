# Task: Integrate an LLM into the Chat Section

**Goal:** Replace the random-text reply in the chat with a real response from OpenAI (GPT).

Today, when a user submits a message, the frontend calls `POST /api/chat` and the backend returns a random line from a fixed list. After this task, the backend sends the message to OpenAI and returns the model's answer. The frontend should need few or no changes.

## How it works today

```
PromptSection (input + Submit)
   -> ChatSection.handleSubmit
      -> sendChat()                  frontend/src/api/chat.ts
         -> POST /api/chat           backend/app/api/routes/chat.py   (returns random text)
```

Files you will touch:

| File | Change |
| ---- | ------ |
| `backend/requirements.txt` | add the OpenAI SDK |
| `backend/.env` | add your API key (never commit it) |
| `backend/app/core/config.py` | add settings for the key and model |
| `backend/app/services/llm.py` (new) | the code that calls OpenAI |
| `backend/app/api/routes/chat.py` | call the service instead of picking a random reply |
| `backend/tests/test_chat.py` | update the tests (mock the LLM) |
| `frontend/src/components/Chat/ChatSection.tsx` | optional improvements (Step 8) |

## Before you start

1. Read the project [README](../README.md) and get the app running (`npm run setup`, then `npm run dev`).
2. Confirm the chat works at http://localhost:5173 and returns random replies.
3. Create your own branch from `feature/backend`:
   ```bash
   git switch feature/backend
   git switch -c feature/backend-llm
   ```
4. You will receive an OpenAI API key from your mentor. Treat it like a password:
   - Put it **only** in `backend/.env`. That file is git-ignored.
   - Never paste it in code, tests, commits, screenshots, chat messages or the frontend.
   - Run `git status` before each commit and make sure `.env` is not listed.

## Steps

### Step 1: Add the key and model to `backend/.env`

```
OPENAI_API_KEY=sk-...your-key...
OPENAI_MODEL=gpt-4o-mini
```

Also add the two variable names (with **no real key**) to `backend/.env.example` so other developers know they are needed:

```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Step 2: Install the OpenAI SDK

Add this line to `backend/requirements.txt`:

```
openai>=1.50
```

Then install it into the backend virtualenv:

```bash
cd backend
.venv/bin/pip install -r requirements.txt
```

### Step 3: Add settings

In `backend/app/core/config.py`, add two fields to the `Settings` class:

```python
openai_api_key: str = ""
openai_model: str = "gpt-4o-mini"
```

Pydantic reads `OPENAI_API_KEY` and `OPENAI_MODEL` from `.env` automatically, so no other loading code is needed.

### Step 4: Create the LLM service

Create `backend/app/services/__init__.py` (empty file) and `backend/app/services/llm.py`.

Keep the OpenAI call in this one file so the route stays small and the call is easy to mock in tests.

```python
from openai import AsyncOpenAI

from app.core.config import Settings

SYSTEM_PROMPT = (
    "You are a friendly health and wellness assistant. "
    "Keep answers short and clear. "
    "You are not a doctor; for medical concerns, suggest seeing a professional."
)


async def generate_reply(message: str, settings: Settings) -> str:
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
    )
    return response.choices[0].message.content or ""
```

Notes:
- `AsyncOpenAI` is used because FastAPI routes here are `async`. The sync client would block the server.
- Check the official docs if anything differs in the SDK version you install: https://platform.openai.com/docs/api-reference/chat

### Step 5: Use the service in the chat route

Edit `backend/app/api/routes/chat.py`:

- Remove the `REPLIES` list and the `random` import.
- Inject `Settings` with `Depends(get_settings)` (see `routes/health.py` for the pattern).
- Call `generate_reply(body.message, settings)` and return it in `ChatResponse`.
- If `openai_api_key` is empty, raise `HTTPException(status_code=500, detail="OpenAI API key is not configured")`.
- Wrap the OpenAI call in `try/except` and raise `HTTPException(status_code=502, detail="LLM request failed")` on failure. Log the real error on the server, and do not send it to the client.

The response shape must stay `{"reply": "..."}` so the frontend keeps working.

### Step 6: Test it manually

1. Restart the backend (or let `--reload` do it).
2. Open http://localhost:8000/docs, expand `POST /api/chat`, click **Try it out**, send `{"message": "Give me one tip to sleep better"}`.
3. Confirm you get a real, relevant answer.
4. Try the failure cases:
   - Empty `OPENAI_API_KEY` returns a 500 with a clear message.
   - A wrong key returns a 502 and the server logs show the cause.
5. Open http://localhost:5173 and chat. Replies should now come from the model. When the backend fails, the chat shows "Sorry, I couldn't reach the server."

### Step 7: Update the tests

`backend/tests/test_chat.py` currently expects a random reply. **Tests must never call the real OpenAI API.** That costs money, needs the key, and is slow and flaky.

Mock the service instead. Example:

```python
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app


def test_chat_returns_llm_reply():
    with patch("app.api.routes.chat.generate_reply", new=AsyncMock(return_value="Drink water")):
        with TestClient(app) as client:
            res = client.post("/api/chat", json={"message": "hello"})
    assert res.status_code == 200
    assert res.json() == {"reply": "Drink water"}
```

Also test that:
- an empty message returns 422 (already covered)
- an LLM failure returns 502 (make the mock raise an exception)

The route has to import `generate_reply` by name (`from app.services.llm import generate_reply`) for the patch path above to work. Run the tests:

```bash
cd backend && .venv/bin/pytest
```

The tests need MongoDB reachable, the same as the existing health test.

### Step 8 (optional): Make the chat feel better

Do these only after Steps 1 to 7 work and are committed.

1. **Conversation memory:** the model currently sees one message at a time. Send the previous messages from the frontend (`{"messages": [{"role": "user" | "assistant", "content": "..."}]}`) and pass them to OpenAI. Note the frontend uses the role `system` for bot messages; OpenAI expects `assistant`, so map it.
2. **Typing indicator:** while the reply is loading, show a "Thinking…" bubble on the left in `ChatSection.tsx`.
3. **Streaming:** stream tokens with `stream=True` and FastAPI's `StreamingResponse` so text appears as it is generated.

## Definition of done

- [ ] Chat replies come from OpenAI, not from a random list
- [ ] The API key is read from `backend/.env`; it is not in any committed file
- [ ] `backend/.env.example` lists `OPENAI_API_KEY` and `OPENAI_MODEL` with no real values
- [ ] A missing key and an OpenAI failure return clear errors (500 / 502)
- [ ] Tests pass with the OpenAI call mocked
- [ ] The frontend chat works end to end in the browser
- [ ] `git status` and `git diff` show no secrets before you commit

## Git workflow

```bash
git add -A
git status                      # check .env is NOT listed
git commit -m "Integrate OpenAI into chat endpoint"
git push -u origin feature/backend-llm
```

Then open a pull request into `feature/backend` and ask your mentor for review.

## Troubleshooting

| Problem | Likely cause |
| ------- | ------------ |
| 500 "API key is not configured" | `OPENAI_API_KEY` missing in `backend/.env`, or the backend was not restarted |
| 502 "LLM request failed" | wrong key, no credit on the OpenAI account, bad model name, or no internet; check the backend terminal logs |
| `ModuleNotFoundError: openai` | step 2 was skipped, or `pip` ran outside `backend/.venv` |
| Chat shows "couldn't reach the server" | backend is down or returned an error; check the terminal and `/docs` |
| Tests try to hit OpenAI | the mock path is wrong; patch where the name is **used** (`app.api.routes.chat.generate_reply`) |
