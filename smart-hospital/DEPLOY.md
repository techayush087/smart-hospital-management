# Deploying SHAPMS

The app is two pieces: an **Angular frontend** (deploy to Vercel) and a **Node mock API**
(`mock-server.js`, deploy to a host that runs long-running Node — Render/Railway/Fly).
Vercel can't run the mock API (it's a long-running json-server, not a serverless function),
so the API goes elsewhere and the frontend points at it.

## 1. Deploy the mock API (Render example)

1. Create a new **Web Service** on [render.com](https://render.com), connect this repo.
2. Settings:
   - **Root Directory:** `smart-hospital`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:api`
   - **Environment variables:**
     - `JWT_SECRET` = (any long random string)
     - `CORS_ORIGINS` = your Vercel URL, e.g. `https://your-app.vercel.app`
       (comma-separate multiple; omit to allow all origins)
3. Deploy. Note the public URL, e.g. `https://shapms-api.onrender.com`.
4. Verify: `https://shapms-api.onrender.com/api/doctors` returns the 4 seed doctors.

> Note: the API reads/writes `db.json` on the host's disk. On free tiers this filesystem
> is ephemeral — registrations/bookings reset on redeploy/restart. Fine for a demo.

## 2. Point the frontend at the API

Edit `src/environments/environment.prod.ts`:

```ts
apiUrl: 'https://shapms-api.onrender.com/api',
```

Commit and push.

## 3. Deploy the frontend (Vercel)

1. Import the repo on Vercel.
2. Settings:
   - **Root Directory:** `smart-hospital`
   - Framework Preset: **Other** (the included `vercel.json` handles build + SPA rewrites)
3. Deploy. The `vercel.json` builds with `npm run build`, serves
   `dist/smart-hospital/browser`, and rewrites all routes to `index.html`
   (so deep links like `/auth/login` don't 404).

## 4. Verify

- Open the Vercel URL → redirects to `/auth/login`, page renders.
- Log in with `patient@test.com` / `Password1!` → lands on the dashboard.
- If login fails: check the browser console/network tab — usually a CORS error
  (fix `CORS_ORIGINS` on the API host to match the exact Vercel origin) or a wrong
  `apiUrl` in `environment.prod.ts`.

## Local development (unchanged)

```
npm run dev     # Angular (4200) + mock API (3000) together
```
