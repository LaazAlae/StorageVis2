# Storage Visualizer

Interactive, local-first file inventory visualizer for SharePoint migration planning.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

The production build outputs a static app to `dist/`.

## Railway Deployment

This repo is ready for GitHub-to-Railway deployment.

1. Push this folder to GitHub.
2. In Railway, choose **New Project**.
3. Select **Deploy from GitHub repo**.
4. Pick this repository.
5. Railway will run `npm run build` and then `npm run start`.

No backend or database is required. CSV parsing and visualization happen in the browser.
