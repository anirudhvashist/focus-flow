# FocusFlow

A polished, local-first productivity dashboard for Pomodoro focus sessions, tasks and notes, with clean Vercel routes and offline support.

## Highlights

- Responsive dashboard UI with dark/light theme
- Pomodoro focus, short-break and long-break modes
- Session statistics, focus minutes and streak tracking
- Task priorities, filters, completion and deletion
- Autosaving notes
- PWA/offline support with a service worker
- No backend, database or paid APIs required
- Deployable as a static site on Vercel, Netlify or GitHub Pages

## Local development

Because this is a static site, no build step is required. Serve the folder from a local HTTP server so the service worker can run:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Vercel

The app uses clean routes (`/timer`, `/tasks`, `/notes`) backed by explicit Vercel rewrites, and legacy `.html` URLs redirect automatically. This avoids the common static-hosting problem where the home page works but deep links fail.

### Option A — Vercel dashboard

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: `.`
6. Deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and choose the project directory containing `index.html`.

## Important

FocusFlow stores user data in browser `localStorage`, so the data is device and browser specific. There is no shared account system yet.
