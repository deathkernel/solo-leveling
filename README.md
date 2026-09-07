# SYSTEM

Offline-first personal progression web app inspired by game-style hunter systems.

## Stack

- React
- TypeScript
- Vite
- IndexedDB for local persistence
- Vercel-ready production build

## Local development

```bash
cd web
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
cd web
npm run build
npm run preview
```

The production output is generated in `web/dist`.

## Deployment

The Vercel project should use `web` as its Root Directory. The repository already contains `web/vercel.json` with the Vite build configuration.

## Data safety

Player progress and historical data are designed to persist locally through versioned IndexedDB migrations. Future schema changes must migrate existing records rather than clearing the database.
