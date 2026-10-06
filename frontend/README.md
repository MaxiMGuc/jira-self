# DefectFlow frontend

React + TypeScript SPA for DefectFlow. It will talk to the Java Core REST API
once those endpoints exist.

## Setup

```bash
cd frontend
npm install
```

Optional: copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

## Temporary frontend sign-in

Login currently uses an isolated frontend-only session. It is not real
authentication and must be replaced when the Java Core login API is ready.

- Username: `qa.demo`
- Email: `qa.demo@defectflow.local`
- Password: `Demo123!`

## Scripts

- `npm run dev` — local development server (port 5173)
- `npm run build` — production build
- `npm run preview` — preview the production build
