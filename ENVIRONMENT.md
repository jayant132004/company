## Environment variables

This project is safe to publish publicly. **Do not commit real credentials**.

### Required (for sessions)

- **`FLASK_SECRET_KEY`**: secret used to sign sessions/flash messages.
  - Development: any string is fine
  - Production: use a long random value

### Optional (database)

- **`DATABASE_URL`**: SQLAlchemy connection string.
  - Default (if unset): a local SQLite file at `./instance/visualization.db`
  - Example: `sqlite:////absolute/path/to/visualization.db`

### Optional (email / password reset)

If these are not set, the “forgot password” flow will still reset the password,
but the server won’t send an email.

- **`MAIL_SERVER`** (default `smtp.gmail.com`)
- **`MAIL_PORT`** (default `587`)
- **`MAIL_USE_TLS`** (default `true`)
- **`MAIL_USERNAME`**
- **`MAIL_PASSWORD`**

### Optional (Generative AI)

- **`GEMINI_API_KEY`**: API key for Google Gemini (Generative AI).
  - Used to generate dynamic, context-aware explanations for sorting algorithms.
  - Get a key from [Google AI Studio](https://makersuite.google.com/app/apikey).
  - If unset, the system falls back to rule-based explanations.
