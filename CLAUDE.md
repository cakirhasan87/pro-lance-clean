# CLAUDE.md — Pro-Lance Clean

This file gives AI assistants the context needed to work effectively in this repository.

---

## Project Overview

**Pro-Lance** is a bilingual (English/Turkish) freelance services marketplace website for Smartia Solutions. The site showcases services, publishes blog content, captures leads via a contact form, and offers an admin dashboard for content management.

- **Live domain**: prolance.smartiasolutions.com (inferred from configuration)
- **Languages**: English (`/en/`) and Turkish (`/tr/`)
- **Company emails**: hasancakir@smartiasolutions.com, incicakir@smartiasolutions.com

---

## Tech Stack

### Backend
| Tool | Version | Role |
|------|---------|------|
| Python | 3.9+ | Runtime |
| Flask | 3.0.2 | Web framework & static file server |
| Gunicorn | 21.2.0 | WSGI production server |
| Supabase (Python) | 2.0.3 | Database client (PostgreSQL) |
| psycopg2-binary | 2.9.9 | Direct PostgreSQL driver |
| Redis | 5.0.1 | Caching / session store |
| Celery | 5.3.4 | Background task queue |
| Flask-SQLAlchemy | 3.1.1 | ORM (local SQLite dev) |
| Flask-Migrate | 4.0.5 | Database migrations |
| Flask-CORS | 4.0.0 | Cross-origin headers |
| python-dotenv | 1.0.1 | Env var loading |

### Frontend
- Vanilla HTML5 / CSS3 / JavaScript (no build step, no bundler)
- `@supabase/supabase-js` v2.39.0 (loaded from CDN or package.json)
- Google reCAPTCHA v3 — contact form protection
- Google Analytics / Google Tag Manager — analytics
- n8n Chat widget (previously integrated, now removed from pages)
- Service Worker (`sw.js`) — offline caching

### Infrastructure
- **Docker** — `docker-compose.yml` spins up Flask + PostgreSQL 13 + Redis 6
- **Supabase** — hosted PostgreSQL with Row-Level Security (RLS) and Auth
- **GitHub Actions** — CI/CD pipeline (`.github/workflows/ci-cd.yml`)

---

## Repository Layout

```
/
├── app.py                     # Main Flask app (entry point, ~1200 lines)
├── test_app.py                # Secondary Flask app used for isolated testing
├── config.py                  # Config: Supabase credentials, email, DB URLs
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker image (python:3.9-slim)
├── docker-compose.yml         # Local dev stack (Flask + Postgres + Redis)
├── .github/workflows/
│   └── ci-cd.yml              # CI: lint → test → deploy-staging/production
│
├── index.html                 # Root homepage (redirects to /en or /tr)
├── en/                        # English pages
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── blog.html
│   ├── contact.html
│   ├── collaboration.html
│   ├── login.html / register.html
│   ├── privacy-policy.html / terms-of-use.html / cookie-policy.html
│   ├── header.html / footer.html  # Shared partials
│   └── blog-posts/            # Individual blog post HTML files
│
├── tr/                        # Turkish pages (mirrors en/ structure)
│   └── ...
│
├── admin/                     # Admin dashboard (HTML + JS)
│   ├── index.html / login.html / dashboard.html
│   ├── blog-editor.html / enhanced-blog-editor.html
│   ├── contact-messages.html
│   ├── content-manager.html
│   ├── admin.js / content-manager.js / enhanced-blog-editor.js
│   └── admin-chat-config.js
│
├── js/                        # Shared frontend JavaScript
│   ├── chat.js                # n8n chat widget integration (inactive)
│   ├── supabase-client.js     # Supabase JS client wrapper
│   └── admin-chat-config.js
│
├── images/                    # Static image assets (WebP, SVG, JPG)
│
├── templates/                 # Flask Jinja2 error templates (404, 403, 500)
│
├── flask_app/                 # Legacy / alternate Flask structure
│   └── templates/
│       └── cookie-consent.html  # Injected into every HTML response
│
├── chatbot/                   # Standalone chatbot Flask service
│   ├── app.py
│   └── templates/
│
├── form_submissions/          # Local JSON backup of contact submissions
├── blog-posts/                # Root-level blog post data
├── blog/                      # Blog supporting files
│
├── sql_setup.sql              # Supabase table DDL (contact_form, RLS)
├── supabase-setup.sql         # contact_submissions table + triggers
├── cookie-consent-setup.sql   # Cookie consent table DDL
│
├── contact-form.js            # Root-level contact form handler (381 lines)
├── cookie-consent.js          # Root-level cookie consent manager (323 lines)
├── script.js                  # General utilities (294 lines)
├── sw.js                      # Service worker — offline caching (110 lines)
├── supabase-config.js         # Supabase client init (frontend)
│
└── test-site/                 # Isolated test environment
```

---

## Key Configuration

### Environment Variables (`.env` — not committed)
```
SUPABASE_URL=https://hhudczwbcjejxvbxglkv.supabase.co
SUPABASE_KEY=<anon key>
SECRET_KEY=<flask secret>
DEBUG=False
DATABASE_URL=postgresql://...   # Supabase Postgres or local
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

### Supabase
- **Project ID**: `hhudczwbcjejxvbxglkv`
- **Tables**: `contact_messages`, `contact_submissions`, `contact_form`, `blog_posts`
- RLS is enabled — anonymous reads/inserts are controlled per table
- The anon key is embedded in `app.py` and `supabase-config.js` (public key, safe to expose)

### Flask App (`app.py`)
- Serves the entire repo as a static file tree from `static_folder='.'`
- Injects `flask_app/templates/cookie-consent.html` into every HTML response via `after_request`
- `DEBUG=True` is hardcoded — **change for production**
- CORS is wide-open (`*`) — tighten for production

---

## Flask Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Homepage |
| `/<path:filename>` | GET | Serve any static file from repo root |
| `/images/<path:filename>` | GET | Serve images directory |
| `/en/<path:filename>` | GET | English page tree |
| `/tr/<path:filename>` | GET | Turkish page tree |
| `/admin/` | GET | Admin dashboard |
| `/admin/<path:filename>` | GET | Admin static assets |
| `/submit-contact` | POST | Contact form → Supabase insert |
| `/sync-submissions` | GET | Sync local JSON backups to Supabase |
| `/test-supabase` | GET | Quick Supabase connection check |
| `/test-supabase-connection` | GET | Detailed diagnostics |
| `/test-form` | GET | Inline test form page |

---

## Database Schema (Supabase)

### `contact_messages`
Stores contact form submissions.
- `id`, `created_at`, `name`, `email`, `phone`, `subject`, `message`, `status`

### `contact_submissions`
Alternative submissions table (with triggers).
- Similar to `contact_messages`; created by `supabase-setup.sql`

### `contact_form`
Additional contact data table.
- Created by `sql_setup.sql`; has RLS policies

### `blog_posts`
Blog content managed via admin dashboard.
- Managed through `admin/enhanced-blog-editor.html`

---

## Development Workflows

### Local Setup (Docker)
```bash
cp .env.example .env          # Create env file with your credentials
docker-compose up             # Starts Flask (5000), Postgres (5432), Redis (6379)
```

### Local Setup (bare Python)
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Fill in SUPABASE_URL, SUPABASE_KEY, etc.
python app.py                 # Runs on http://localhost:5000
```

### Running Tests
```bash
pip install pytest pytest-cov flake8 black
pytest                         # Run all tests
pytest --cov=. --cov-report=xml  # With coverage
```

### Linting & Formatting
```bash
flake8 . --select=E9,F63,F7,F82   # Syntax/import errors only (required to pass)
flake8 . --max-complexity=10 --max-line-length=127  # Style (non-blocking)
black --check .                    # Format check
black .                            # Auto-format
```

---

## CI/CD Pipeline

File: `.github/workflows/ci-cd.yml`

**Triggers**: push to `main` or `development`; PR to `main`

1. **test** — lint (flake8), format check (black), pytest with PostgreSQL service
2. **deploy-staging** — runs on `development` branch (placeholder commands)
3. **deploy-production** — runs on `main` branch with `production` environment approval

Coverage uploaded to Codecov.

---

## Frontend Conventions

### Internationalization
- All user-facing pages exist in both `/en/` (English) and `/tr/` (Turkish)
- When editing page content, **always update both language versions**
- `header.html` and `footer.html` are shared partials included in each page

### Styling
- No CSS framework — custom CSS per page and in `<style>` tags
- Responsive design with CSS media queries
- Images served as WebP for performance; fallback SVG/JPG where needed

### JavaScript
- No bundler or transpiler — plain ES6+ modules
- `contact-form.js` handles validation, reCAPTCHA v3, and Supabase submission
- `cookie-consent.js` manages KVKK (Turkish GDPR) compliance banners
- `sw.js` is a service worker for offline caching — update cache version when assets change

### Admin Dashboard
- Auth is handled client-side via Supabase Auth
- Blog CRUD via `admin/enhanced-blog-editor.js` (Supabase direct calls)
- Contact messages viewed in `admin/contact-messages.html`

---

## Key Conventions

1. **Secrets**: Never commit `.env` files. The `SUPABASE_KEY` in `app.py` is the public anon key — it is safe to be in source, but `SERVICE_ROLE_KEY` must never be committed.
2. **CORS**: Currently `*` in `app.py:after_request` — when hardening, restrict to the production domain.
3. **DEBUG flag**: `app.config['DEBUG'] = True` is hardcoded in `app.py`. Set via env var in production.
4. **Dual storage**: Contact form submissions go to Supabase AND a local JSON backup in `form_submissions/`. The `/sync-submissions` endpoint reconciles them.
5. **Cookie consent injection**: `flask_app/templates/cookie-consent.html` is injected into every HTML response. If the template is missing, the server logs an error but continues serving.
6. **Blog posts**: Stored as static HTML files under `/en/blog-posts/` and `/tr/blog-posts/`, and as rows in Supabase `blog_posts`. Keep both in sync.
7. **n8n**: The n8n chat widget has been fully removed from all pages (see commit `c3bd188`). Do not re-add it without discussing the integration with the team.

---

## Testing Files

| File | Purpose |
|------|---------|
| `test_app.py` | Minimal Flask app for isolated route/form testing |
| `test_supabase_connection.py` | Validates Supabase connectivity |
| `test-contact.html` | Browser-based contact form test page |
| `test-validation.html` | Form validation testing |
| `test-n8n-mapping.html` | n8n webhook field mapping test |
| `accessibility-test.js` | Automated a11y compliance checks |

---

## Important Files Reference

| File | Lines | Notes |
|------|-------|-------|
| `app.py` | ~1200 | Main Flask application; all routes, Supabase client init |
| `config.py` | 37 | Env-based configuration; import here before using in app.py |
| `contact-form.js` | 381 | Contact form: validation, reCAPTCHA, Supabase write |
| `cookie-consent.js` | 323 | KVKK-compliant cookie banner logic |
| `script.js` | 294 | General UI utilities (navigation, animations) |
| `admin/content-manager.js` | 670 | Admin CRUD for blog and page content |
| `admin/enhanced-blog-editor.js` | 440 | Rich blog editor with Supabase integration |
| `sw.js` | 110 | Service worker; bump cache version on asset changes |
