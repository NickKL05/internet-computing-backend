# Course Registration Dashboard - Backend

Backend server for the CP476 Course Registration Dashboard. Built with Node.js,
Express, and MySQL. This service exposes a REST API that the React frontend
consumes for authentication, the course catalog, planning, registration, and
admin course management.

## Tech stack

- Node.js (version 18 or newer)
- Express 4 for the HTTP layer
- MySQL 8 with the mysql2 driver (promise based, connection pooled)
- bcryptjs for password hashing
- A normalized `Accounts` supertype with `Students` and `Administrators`
  profile tables, and database backed sessions in `UserSessions`
- Jest and supertest for tests

## Prerequisites

Install these before running the project:

1. Node.js 18+ and npm (https://nodejs.org)
2. MySQL Server 8 (https://dev.mysql.com/downloads/mysql/) and a user that can
   create databases

Confirm they are installed:

```bash
node --version
npm --version
mysql --version
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill in your MySQL credentials
cp .env.example .env
#   On Windows PowerShell:  Copy-Item .env.example .env

# 3. Create the database and tables
npm run db:init

# 4. (Optional) Load sample data for development
npm run db:seed

# 5. Start the server
npm run dev      # development, restarts on file changes
npm start        # plain start
```

Once running, check it is alive:

- `GET http://localhost:3000/` returns basic API info
- `GET http://localhost:3000/health` returns the database connection status

`npm run db:seed` loads a sample dataset across three terms (a past term with
completed courses, the current open-registration term, and a future term):
faculties, departments, programs, ~14 courses with prerequisites and an
antirequisite, ~21 sections, five students with academic history and current
registrations, an active hold, degree requirements, plans, and saved filters.

Logins (students share one password, admins another):

```
students: teststudent, astudent, bstudent, cstudent, dstudent   password: Password123!
admins:   admin, registrar                                       password: Admin123!
```

Some scenarios baked into the data: `CP312` (Fall) is full so registering it
waitlists; `bstudent` has an active hold that blocks registration; and several
students have completed prerequisites so eligibility checks have something to
work against.

To create an additional administrator at any time:

```bash
npm run admin:create -- <username> <password> [firstName] [lastName] [email]
```

## Environment variables

See `.env.example` for the full list. The important ones are the `DB_*` MySQL
connection settings, `PORT`, and `CORS_ORIGIN` (set this to the frontend dev
server URL). Never commit your real `.env`.

## Project structure

```
src/
  config/        Centralized config loaded from environment variables
  db/            MySQL pool, query and transaction helpers, schema.sql
  middleware/    authenticate, authorize, requestLogger, notFound, errorHandler
  services/      Business logic (authService, sessionService, registrationService)
  utils/         ApiError, asyncHandler, logger
  routes/        Express routers (thin; map paths to controllers)
  controllers/   Request handlers (call services, shape responses)
  app.js         Express app assembly (middleware, routes, error handling)
  server.js      Entry point (startup, DB check, graceful shutdown)
scripts/
  init-db.js     Creates the database and tables from schema.sql
  seed.js        Inserts sample development data
  create-admin.js  Creates an administrator account
tests/
  app.test.js       Smoke tests for app wiring (no database needed)
  authorize.test.js Role guard unit tests
  conflict.test.js  Time conflict logic unit tests
```

## Architecture

Requests flow through clear layers, each with one job:

```
route  ->  controller  ->  service  ->  db helpers  ->  MySQL
```

- Routes map an HTTP method and path to a controller and attach middleware.
- Controllers translate between HTTP and services and never touch the database.
- Services hold the business rules and run queries through `src/db`.
- `src/db` runs parameterized queries and transactions against the pool.

All database access uses parameterized queries (the `?` placeholders) so the
code is safe from SQL injection. Use `db.withTransaction` for any operation
that writes to more than one table and must succeed or fail as a unit, such as
enrolling a student and incrementing `enrolled_count`.

## Authentication and roles

Authentication uses opaque session tokens stored server side in `UserSessions`.
The flow:

1. The login controller verifies credentials with `authService`, then calls
   `sessionService.createSession` to issue a token.
2. The client sends the token on later requests as
   `Authorization: Bearer <token>`.
3. The `authenticate` middleware validates the token, attaches `req.user`, and
   extends the session expiry. Sessions expire after 30 minutes of inactivity
   (configurable via `SESSION_INACTIVITY_MINUTES`), per user story US-01.

`req.user` is `{ accountId, role, username, studentId, adminId }`. A role is
**derived**, not stored: an account is an `admin` when an `Administrators` row
references it, otherwise a `student` when a `Students` row does. This keeps the
schema normalized (no role column that could disagree with the profile tables).

Guard admin only routes (US-13, US-14, US-25) by combining the two middlewares:

```js
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.post('/courses', authenticate, authorize('admin'), courseController.create);
```

## Division of work

The server foundation and services cover configuration, the database layer,
middleware (including `authenticate` and `authorize`), the auth, session, and
registration services, error handling, scripts, and tests. The feature routes
and controllers (catalog, planning, registration, and admin endpoints) are
built separately and mounted in `src/routes/index.js`; they call the services
in `src/services`.

## Registration rules

`registrationService` implements the registration logic so controllers stay
thin:

- Time conflict detection across a plan and against current registrations
  (US-06, US-18).
- `registerPlan` attempts each section in order and returns a per section
  result of `registered`, `waitlisted`, or `failed` with a reason (US-07).
- Eligibility checks: active holds, duplicate course, prerequisites (US-17),
  and antirequisites.
- Seat handling with row locking inside a transaction, waitlisting a full
  section (US-19).
- `dropSection` and `swapSection`, each writing an audit entry (US-08).

## Data model note

The original milestone schema kept login data in a `StudentAccounts` table tied
to `Students`. To support administrators without putting them in a student
table, the auth tables were normalized into an `Accounts` supertype with
`Students` and `Administrators` profile tables. If you initialized your database
from an earlier version, drop and re-run `npm run db:init` (there is no
production data yet). Flag this change to the data modeling lead.

## Testing

```bash
npm test
```

The included smoke tests do not need a database. Database backed tests should
point at a separate test database, not your development data.
