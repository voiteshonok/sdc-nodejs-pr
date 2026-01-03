
## Setup: Backend, Database, and Frontend

### 1. Install dependencies

From the `pr-4` directory:

```bash
cd pr-4
npm install
```

### 2. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL 15 container:
- Host: `localhost`
- Port: `5433` (host) → `5432` (container)
- Database: `students_db`
- User: `postgres`
- Password: `postgres`

For more details and troubleshooting, see [`DATABASE_SETUP.md`](./DATABASE_SETUP.md).

### 3. Run migrations and seed initial data

Still in `pr-4`:

```bash
npm run db:setup
```

This will:
- Create the `students` table via Sequelize migration
- Insert initial students via seeders

You can also use:
- `npm run db:migrate` – apply migrations only
- `npm run db:seed` – apply seeders only

### 4. Start the backend (API server)

```bash
node index4.js
```

The backend will start on:
- **URL**: `http://localhost:3000`
- Main endpoints:
  - `GET /api/students` – list all students
  - `POST /api/students` – create student (validated with Joi in `StudentValidator.js`)
  - `POST /api/students/:id` – update student
  - `DELETE /api/students/:id` – remove student
  - `GET /api/students/average-age` – average age
  - `GET /api/students/group/:id` – students by group

Under the hood:
- All DB operations go through `DatabaseProxyConnector` (Sequelize ORM)
- `DatabaseProxyConnector` emits `STUDENT_EVENTS`, and `index4.js` logs them via `Logger`
- Backups are managed by `Backup` and can be controlled via:
  - `GET /api/backup/status`
  - `POST /api/backup/start`
  - `POST /api/backup/stop`

### 5. Run the frontend

The frontend is a static HTML file that talks to the backend API.

#### Option A: Open directly in browser

From `pr-4`:
- Open `frontend/frontend.html` in your browser (double-click in file explorer or:

```bash
xdg-open frontend/frontend.html   # Linux
open frontend/frontend.html       # macOS
```

Make sure the backend (`node index4.js`) is running so the frontend can call `http://localhost:3000/api/students`.

#### Option B: Serve with a simple static server (optional)

You can use any static file server (for example `npx serve`):

```bash
npx serve frontend
```

Then open the URL shown in the terminal (by default something like `http://localhost:3000` or `http://localhost:4173` depending on the tool).

### 6. Validation and Errors

- Incoming data for student create/update is validated with **Joi** in `StudentValidator.js`.
- On validation failure:
  - Backend returns `400` with `{ errors: [ ...messages ] }`
  - Frontend shows these messages directly in the UI.






