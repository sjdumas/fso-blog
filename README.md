# Full Stack Open: Blog

This repository contains the work for the Full Stack Open [Using Relational Databases](https://fullstackopen.com/en/part13) section of the course. It is a REST API for users, blog posts, authors, and reading lists, built with Node.js, Express, PostgreSQL, and Sequelize.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Sequelize and Umzug (database models and migrations)
- JSON Web Tokens (JWT)
- dotenv

## Project Structure

- `index.js` — configures and starts the Express server
- `controllers/` — API routes for blogs, users, login, authors, reading lists, and test reset
- `models/` — Sequelize models and their associations
- `migrations/` — versioned database schema migrations, run automatically at startup
- `util/` — database connection, environment configuration, and middleware
- `tests/` — API tests and test data helpers
- `requests/` — example HTTP requests
- `commands.sql` — sample SQL statements from the database exercises
- `.github/workflows/test.yml` — GitHub Actions test workflow

## Getting Started

You need Node.js and a running PostgreSQL server.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a development database and a separate test database. Add a `.env` file in the project root:

   ```env
   DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/fso_blog?sslmode=disable
   TEST_DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/fso_blog_test?sslmode=disable
   PORT=3001
   SECRET=replace-with-a-random-secret
   ```

   Replace `USER` and `PASSWORD` with your PostgreSQL credentials. The `sslmode=disable` parameter is for a local PostgreSQL server; without it, the app connects using SSL. Migrations run automatically when the server starts. Keep the test database separate: the test reset endpoint clears its users and blogs.

3. Start the app:

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

   The server listens on port `3001` by default (or the port set in `PORT`). `GET /` returns `OK`.

## API

All routes are under `/api`. JSON request bodies should use the `Content-Type: application/json` header.

### Authentication

`POST /api/login` accepts a username and returns a JWT:

```json
{ "username": "alice@example.com" }
```

Pass the returned token as `Authorization: Bearer <token>` when creating or deleting blogs. In the current implementation, login identifies the user by username and does not check a password.

### Users

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/users` | List users and their blogs |
| `POST` | `/api/users` | Create a user (`username`, `name`) |
| `GET` | `/api/users/:id` | Get a user and their reading-list blogs |
| `PUT` | `/api/users/:username` | Update a user's `name` |

Usernames must be valid email addresses.

### Blogs

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/blogs` | List blogs, ordered by likes (descending) |
| `POST` | `/api/blogs` | Create a blog (requires a bearer token) |
| `PUT` | `/api/blogs/:id` | Update a blog's `likes` |
| `DELETE` | `/api/blogs/:id` | Delete a blog (requires its creator's bearer token) |

Blog creation accepts `title` and `url`; `author` and `likes` are optional, and `likes` defaults to `0`. The optional `year` must be between 1991 and the current year. Add a `search` query parameter to filter blogs by title or author, for example `GET /api/blogs?search=react`.

### Authors

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/authors` | List authors with blog counts and total likes |

### Reading lists

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/readinglists` | Add a blog to a user's reading list |

The request body requires `blogId` and `userId`; new entries have `read: false`. A blog can only be added once to a given user's list. Reading-list entries are included in the corresponding user's `readings` field in `GET /api/users/:id`.

### Example Requests

Create a user and obtain a token:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice@example.com","name":"Alice Johnson"}'

curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice@example.com"}'
```

Use the returned token to create a blog:

```bash
curl -X POST http://localhost:3001/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"author":"Alice","title":"My first post","url":"https://example.com/post","likes":0}'
```

List blogs or search them by title or author:

```bash
curl "http://localhost:3001/api/blogs"
curl "http://localhost:3001/api/blogs?search=Alice"
```

## Tests

The test server uses `TEST_DATABASE_URL`. Start it in one terminal:

```bash
npm run start:test
```

Then run the API tests in another terminal:

```bash
npm test
```

The tests call the test-only `POST /api/reset` endpoint to clear test data. Never point `TEST_DATABASE_URL` at a database containing data you need to keep.
