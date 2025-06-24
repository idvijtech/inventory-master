# Development Guide

## Project Structure

- `client/` — Frontend (React, Vite, Tailwind, etc.)
- `server/` — Backend (Express, Drizzle ORM, etc.)
- `shared/` — Shared code (schemas, types)

---

## 1. Install Dependencies

```sh
cd client && npm install
cd ../server && npm install
```

---

## 2. Development Workflow

### Start the Backend
```sh
cd server
npm run dev
```
- Runs at: http://localhost:5000

### Start the Frontend
```sh
cd client
npm run dev
```
- Runs at: http://localhost:5173 (default)

---

## 3. API Calls
- Use `/api/...` in frontend code for backend requests.
- Vite proxy (configured in `client/vite.config.ts`) forwards `/api` to backend.

---

## 4. Shared Schema Usage
- Shared Zod/Drizzle schemas in `shared/` provide type safety and validation for both frontend and backend.
- Update imports to use correct relative paths (e.g., `../../../shared/schema`).

---

## 5. CORS (if using absolute URLs)
- Enable CORS in backend:
  ```js
  import cors from 'cors';
  app.use(cors({ origin: 'http://localhost:5173' }));
  ```

---

## 6. Production Build

### Build Frontend
```sh
cd client
npm run build
```
- Output: `client/dist/`

### Deploy Backend
- Deploy `server/` to your server/cloud.
- Serve frontend static files with Nginx, Apache, or cloud static host.
- (Optional) Serve frontend from backend by copying build to `server/public` and using `express.static`.

---

## 7. Database Migration
```sh
cd server
npm run db:push
```

---

## 8. Environment Variables
- Store sensitive values in `.env` files and use `dotenv` in backend.

---

## 9. Troubleshooting
- Check browser DevTools Network tab for API calls.
- Ensure correct API URLs and proxy config.
- Update all shared imports to use relative paths.
- If CORS errors, check backend CORS config.

---

## 10. Summary
- Modular, maintainable, and scalable setup.
- Frontend and backend run independently.
- Shared types and validation for consistency.

---

Happy coding! 