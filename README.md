# Gemini Chat

A full-stack AI chat application built with React and Vite on the frontend, and
Node.js, Express, MongoDB, and the Google Gemini API on the backend. Chat
threads and their messages are stored in MongoDB.

## Features

- Chat with Google's Gemini Top Models.
- Save, revisit, and delete chat threads.
- Show a connection message while the backend starts or reconnects.
- Configure the backend URL for local development or deployment.

## Project structure

```text
Gemini/
├── backend/    Express API, MongoDB models, Gemini integration
└── frontend/   React and Vite application
```

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- A MongoDB connection string
- A Google Gemini API key

## Run locally

1. Configure the backend environment variables as described below.
2. In one terminal, start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Vite prints the local frontend address when it starts. The frontend defaults to
the backend at `http://localhost:8080`.

## Environment variables

Create `backend/.env` for local development:

```env
MONGO_URL=your_mongodb_connection_string
GENAI_API_KEY=your_google_gemini_api_key
PORT=8080
```

`PORT` is optional locally; the backend defaults to `8080`. Never commit real
API keys, database credentials, or environment files.

To use a non-default backend URL in the frontend, set `VITE_API_URL`. For local
development, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

The value is the backend base URL only; do not append `/api`. Vite reads
`VITE_` variables at build time, so restart the frontend dev server or rebuild
after changing this value.


### Backend web service

1. Create a **Web Service** for this repository and set **Root Directory** to
   `backend`.
2. Set **Build Command** to `npm install`.
3. Set **Start Command** to `npm start`.
4. Add these environment variables in Render:
   - `MONGO_URL` — your MongoDB connection string.
   - `GENAI_API_KEY` — your Google Gemini API key.
   - `NODE_ENV` — `production` (recommended).

Render supplies the `PORT` environment variable automatically. The backend
listens on that port and exposes `GET /health` for its health check.

### Frontend static site

1. Create a **Static Site** for this repository and set **Root Directory** to
   `frontend`.
2. Set **Build Command** to `npm install && npm run build`.
3. Set **Publish Directory** to `dist`.
4. Add `VITE_API_URL` as an environment variable, set to the deployed backend
   base URL (for example, `https://your-backend.onrender.com`).
5. Deploy or trigger a new deploy after setting the variable.


## Checks

Run these commands from the `frontend` directory:

```powershell
npm run lint
npm run build
```

Run the backend with `npm run dev` from `backend`. The backend package does not
currently define an automated test suite.
