# DSA Visual Representation (Flask)

Interactive visualization of data structures and algorithms, with a special focus on **sorting visualizations** and an AI-style assistant called **SortMentor**.

## Tech stack (current repo)

- **Backend**: Flask (Python)
- **Database**: SQLite (via Flask-SQLAlchemy)
- **Frontend**: HTML (Jinja templates), Tailwind (CDN), JavaScript, CSS

## Run locally

1) Create and activate a virtualenv (recommended).

2) Install deps:

```bash
python3 -m pip install -r requirements.txt
```

3) Run the server:

```bash
python3 app.py
```

Open:
- **Main app**: `http://127.0.0.1:8000/`
- **SortMentor page**: `http://127.0.0.1:8000/sortmentor`

## SortMentor (API + visualization)

SortMentor provides step-by-step sorting “events” that you can visualize in any client.

API base prefix: `/api/sortmentor`

- **`POST /analyze`**: returns input features (n, sortedness, duplicates, etc.)
- **`POST /recommend`**: recommends an algorithm (ML if `algo_model.pkl` exists, otherwise rule-based)
- **`POST /execute`**: runs an algorithm and returns **steps[]** + metrics
- **`POST /compare`**: runs multiple algorithms for comparison
- **`POST /explain`**: returns a higher-level explanation + tip
- **`POST /session`**: runs the “agentic” session (analyze → recommend → compare → explain → record)

The UI in `templates/sortmentor.html` + `static/js/sortmentor.js` calls these endpoints and animates the returned steps.

## ML model (optional)

- Train: run `python3 algo_model_train.py` (writes `algo_model.pkl`)
- Test: run `python3 test_model.py`

If the model file is missing, SortMentor falls back to rule-based recommendations automatically.

## Environment variables

See `ENVIRONMENT.md`. **Do not commit real secrets**.