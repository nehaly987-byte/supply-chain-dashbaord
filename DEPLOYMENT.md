# Deployment Guide

This project is a monorepo containing a React/Vite frontend and a Node.js/Express backend. Here are the step-by-step instructions to deploy the backend to **Render** and the frontend to **Vercel**.

---

## 1. Deploy the Backend to Render

We've already included a `render.yaml` configuration file at the root of the project to make this easy.

1. Push your code to a GitHub repository.
2. Sign up or log in to [Render](https://render.com/).
3. On the Render Dashboard, click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect the `render.yaml` file and automatically create a Web Service named `supply-chain-api`.
6. During the setup, Render will ask you for Environment Variables because we set `sync: false` for sensitive data:
   * **`DATABASE_URL`**: Enter your Neon PostgreSQL connection string (make sure it ends with `?sslmode=require`).
   * **`GROK_API_KEY`**: Your Grok API Key for AI features.
7. Click **Apply** to deploy.
8. Once deployed, Render will give you a public URL (e.g., `https://supply-chain-api-xxxx.onrender.com`).
   * **Copy this URL**, you will need it for the Vercel frontend.
   * *Note: The first build might take a few minutes as it installs monorepo dependencies.*

---

## 2. Deploy the Frontend to Vercel

Vercel natively supports `pnpm` monorepos, making this very straightforward.

1. Sign up or log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Important Configuration Steps:**
   * Under **Framework Preset**: Vercel should auto-detect `Vite`.
   * Under **Root Directory**: Click "Edit" and select `artifacts/supply-chain-dashboard`.
     * *Vercel knows how to crawl up to the root to run `pnpm install` for the whole workspace.*
5. **Environment Variables**:
   * Add a new variable named `VITE_API_URL`
   * Set the value to the Render public URL you copied earlier (e.g., `https://supply-chain-api-xxxx.onrender.com`).
   * *(Do not add a trailing slash `/` at the end of the URL).*
6. Click **Deploy**.

## 3. Database Migrations (Important)

In development, you push schema changes using `pnpm --filter db push`.
For production on Render:
Currently, the Render setup does not run migrations automatically (to avoid accidental data loss). You can run migrations against your production database from your local machine:
1. Update your local `.env` inside `lib/db/.env` with the production database URL.
2. Run the push locally:
   ```bash
   pnpm --filter @workspace/db push
   ```

*Alternatively, if your Neon DB is the same for dev and prod, you don't need to do anything.*

## Summary of Changes Made to Prepare for Deployment:
1. Removed `replit`-specific tooling constraints.
2. Created a `render.yaml` Blueprint to define the entire build+start cycle inside this pnpm workspace natively for the backend.
3. Updated the frontend's `src/main.tsx` so the deployed React app will read `VITE_API_URL` and use it dynamically for all API calls (since local proxy via `vite.config.ts` won't run in Vercel's static Edge environment).
