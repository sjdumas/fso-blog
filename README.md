# Full Stack Open: Blog API

This project contains a REST API for users, blogs, authors, and reading lists, built for the [Using Relational Databases](https://fullstackopen.com/en/part13) part of the Full Stack Open course. It uses Node.js, Express, PostgreSQL, and Sequelize, with versioned migrations, token authentication backed by server-side sessions, and automated tests that run in GitHub Actions.

## Features

- Create and list users, and view a user's reading list
- Create, list, search, update, and delete blogs, sorted by likes
- Blog ownership: only a blog's creator can delete it
- Author statistics (blog count and total likes), calculated in the database
- Reading lists with read/unread status, filterable by status
- Login with JWTs stored as server-side sessions, so access can be revoked
- Logout, and the ability to disable users so they are locked out immediately
- Database schema managed with migrations that run automatically on startup

## Tech Stack

- Node.js (v20 or later)
- Express 5
- PostgreSQL
- Sequelize (ORM) and Umzug (migrations)
- JSON Web Tokens (`jsonwebtoken`) with server-side sessions
- dotenv and cross-env (configuration)
- Node's built-in test runner and axios (API tests)
- GitHub Actions (continuous integration)

## Project Structure

```
├── .github/
│   └── workflows/
│       └── test.yml          GitHub Actions workflow that runs the tests on pushes and pull requests
├── controllers/              API route handlers
│   ├── authors.js            /api/authors
│   ├── blogs.js              /api/blogs
│   ├── login.js              /api/login
│   ├── logout.js             /api/logout
│   ├── readinglists.js       /api/readinglists
│   ├── reset.js              /api/reset (test mode only)
│   └── users.js              /api/users
├── migrations/               Versioned database schema changes, run automatically at startup
│   ├── 20261015_00_initialize_users_and_blogs.js
│   ├── 20261015_01_add_year_to_blogs.js
│   ├── 20261015_02_add_reading_lists.js
│   └── 20261015_03_add_disabled_and_sessions.js
├── models/                   Sequelize models
│   ├── blog.js
│   ├── index.js              Defines the associations and exports all models
│   ├── reading_list.js
│   ├── session.js
│   └── user.js
├── requests/                 Example HTTP requests (*.rest) for the VS Code REST Client extension
├── tests/
│   ├── api_ch3.test.js       Blogs, users, and authors tests
│   ├── api_ch4.test.js       Reading list, session, and integration tests
│   └── helper.js             Shared helpers for resetting the database and creating test data
├── util/
│   ├── config.js             Reads settings from environment variables
│   ├── db.js                 Database connection and migration runner
│   └── middleware.js         Token extraction and error handling middleware
├── .editorconfig             Editor settings: 2-space indentation, LF line endings, UTF-8
├── .gitattributes            Normalizes line endings to LF in the repository
├── cli.js                    Script from an early exercise that prints all blogs (always connects with SSL)
├── commands.sql              SQL statements from the early database exercises
├── index.js                  Configures and starts the Express server
└── package.json              Dependencies and npm scripts
```

## Getting Started

### Prerequisites

- Node.js v20 or later
- A PostgreSQL database, either installed locally or hosted (for example, [Neon](https://neon.tech/))

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create two databases: one for development and a separate one for tests.

3. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST/TEST_DATABASE?sslmode=require"
   PORT=3001
   SECRET="replace-with-a-long-random-string"
   ```

   The app connects with SSL by default, which hosted providers like Neon require. For a local PostgreSQL server without SSL, end the URLs with `?sslmode=disable` instead.

   To generate a strong `SECRET`, run:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Never commit `.env`. It is listed in `.gitignore`.

4. Start the server:

   ```bash
   npm start
   ```

   For development with automatic restarts on file changes:

   ```bash
   npm run dev
   ```

The server listens on port `3001` by default, or the port set in `PORT`. Migrations run automatically on startup, so the tables are created the first time the app starts. `GET /` responds with `OK` and can be used as a health check.

## Authentication

1. Log in with `POST /api/login` to receive a token. Each login creates a new session in the database.
2. Send the token with requests that require login:

   ```
   Authorization: Bearer <token>
   ```

3. On every protected request, the server verifies the token's signature, checks that its session still exists, and checks that the user is not disabled.
4. `DELETE /api/logout` removes all of the user's sessions. Their tokens stop working immediately.

To disable a user, set the flag directly in the database:

```sql
UPDATE users SET disabled = true WHERE username = 'alice@example.com';
```

A disabled user cannot log in, and any active sessions they have are rejected. Disabling a user does not delete their sessions, so setting `disabled` back to `false` makes their existing tokens work again.

## API

All routes are under `/api`. Requests with a JSON body need the `Content-Type: application/json` header. Routes marked **Token** require an `Authorization: Bearer <token>` header.

### Login and Logout

| Method   | Path          | Auth  | Description                                   |
| -------- | ------------- | ----- | --------------------------------------------- |
| `POST`   | `/api/login`  |       | Log in with `username`; returns a token       |
| `DELETE` | `/api/logout` | Token | Log out by removing all of the user's sessions |

### Users

| Method | Path                   | Auth | Description                                  |
| ------ | ---------------------- | ---- | -------------------------------------------- |
| `GET`  | `/api/users`           |      | List users with the blogs they created       |
| `POST` | `/api/users`           |      | Create a user (`username`, `name`)           |
| `GET`  | `/api/users/:id`       |      | Get a user with their reading list           |
| `PUT`  | `/api/users/:username` |      | Update a user's `name`                       |

- `username` must be a unique, valid email address, and `name` must not be empty.
- A `password` field is accepted when creating a user but is currently ignored.
- `GET /api/users/:id` returns the reading list under `readings`. Each entry includes a `readingList` object with its `read` status and entry `id`.
- Filter the reading list with `?read=true` or `?read=false`.

### Blogs

| Method   | Path             | Auth  | Description                               |
| -------- | ---------------- | ----- | ----------------------------------------- |
| `GET`    | `/api/blogs`     |       | List blogs, sorted by likes (descending)  |
| `POST`   | `/api/blogs`     | Token | Create a blog owned by the logged-in user |
| `PUT`    | `/api/blogs/:id` |       | Update a blog's `likes`                   |
| `DELETE` | `/api/blogs/:id` | Token | Delete a blog (creator only)              |

- `title` and `url` are required. `author`, `likes`, and `year` are optional.
- `likes` defaults to `0` and must be a non-negative integer.
- `year` must be an integer from 1991 to the current year.
- Filter by title or author (case-insensitive) with `?search=`, for example `GET /api/blogs?search=react`.

### Authors

| Method | Path           | Auth | Description                                                  |
| ------ | -------------- | ---- | ------------------------------------------------------------ |
| `GET`  | `/api/authors` |      | List authors with blog counts and total likes, most liked first |

### Reading Lists

| Method | Path                    | Auth  | Description                               |
| ------ | ----------------------- | ----- | ----------------------------------------- |
| `POST` | `/api/readinglists`     |       | Add a blog to a user's reading list       |
| `PUT`  | `/api/readinglists/:id` | Token | Mark an entry as read or unread           |

- `POST` requires `blogId` and `userId`. New entries start with `read: false`, and a blog can only be added once to the same user's list.
- `PUT` takes `{ "read": true }` or `{ "read": false }`. The `:id` is the reading list entry's id (`readingList.id`), not the blog's id. Users can only update entries on their own reading list.

### Error Responses

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| `400`  | Invalid or missing data. Validation errors are returned as an array, for example `{ "error": ["username must be a valid email address"] }` |
| `401`  | Unknown username at login, missing or invalid token, session ended by logout, disabled account, or not the owner of a reading list entry |
| `403`  | Logged in, but not the creator of the blog being deleted                |
| `404`  | The requested resource does not exist                                   |

## Example Requests

These examples use `curl` in a Bash-style terminal (macOS, Linux, or Git Bash on Windows). The `requests/` folder has the same requests for the VS Code REST Client extension.

Create a user and log in:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice@example.com","name":"Alice Johnson"}'

curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice@example.com"}'
```

Create a blog with the returned token:

```bash
curl -X POST http://localhost:3001/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"author":"Alice","title":"My first post","url":"https://example.com/post","year":2024}'
```

Search blogs and view author statistics:

```bash
curl "http://localhost:3001/api/blogs?search=alice"
curl "http://localhost:3001/api/authors"
```

Log out:

```bash
curl -X DELETE http://localhost:3001/api/logout \
  -H "Authorization: Bearer <token>"
```

## Tests

The tests send real HTTP requests to a running server that uses the test database.

1. Start the server in test mode (uses `TEST_DATABASE_URL`):

   ```bash
   npm run start:test
   ```

   The tests always send requests to `http://localhost:3001`, so leave `PORT` unset or set it to `3001` when running them.

2. In a second terminal, run the tests:

   ```bash
   npm test
   ```

Node's test runner automatically finds all `*.test.js` files and runs them one at a time, because each file resets the same database.

Before running, the tests call `POST /api/reset`, which deletes all users, blogs, reading lists, and sessions. This endpoint only exists when the app runs in test mode (`TESTING=true`). **Never point `TEST_DATABASE_URL` at a database with data you want to keep.**

### Continuous Integration

On every push or pull request to `main` or `master`, GitHub Actions (`.github/workflows/test.yml`) starts a fresh PostgreSQL database, runs all migrations, starts the app in test mode, and runs the full test suite.

## Known Limitations

This project was built for learning, and a few things would need to change before using it in production:

- **Passwords are not checked.** Login only needs a valid username. Passwords should be hashed with a library like `bcrypt` and verified on login.
- **Session tokens are stored as plain text.** Storing a hash of each token would protect sessions if the database were ever exposed.
- **Sessions never expire.** They last until the user logs out. An expiry time would limit how long a stolen token could be used.
- **Some routes are open by design.** Adding to a reading list, updating blog likes, and updating a user's name do not require a token, following the course specification.
