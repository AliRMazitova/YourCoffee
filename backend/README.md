# YourCoffee Backend

Backend API for a coffee shop app (Node.js, Express, PostgreSQL, ES Modules).

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Fill `.env`:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=your_coffee
DB_PORT=5432
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=secret
REFRESH_TOKEN_SECRET=refresh_secret
```

3. Start server:

```bash
npm start
```

Server runs on `http://localhost:5000`.

## What is already configured

- JWT auth (`register/login/refresh/logout/me`)
- Drinks API:
  - list and filters
  - details
  - volumes with nutrition from `drink_volume_nutrition`
  - ingredients from `drink_volume_ingredients`
  - tags, moods, addons
  - price calculation for a selected volume and allowed addons only
- Favorites, preferences, recommendations
- Basic security:
  - `helmet` for safe headers
  - `express-rate-limit` on `/api/auth/*`
  - CORS restricted by `CORS_ORIGIN`
- 404 handler for unknown routes

## Frontend integration notes

- For protected endpoints, send header:
  - `Authorization: Bearer <accessToken>`
- Main API schema is in `openapi.yaml`.
- SQL schema lives in `sql/init.sql`.
