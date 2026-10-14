# Full Stack Open: Blog

This repository contains the work for the Full Stack Open [Using Relational Databases](https://fullstackopen.com/en/part13) section of the course.

This project involves building a relational database-backed API with Node.js, Express, PostgreSQL, and Sequelize.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Sequelize
- dotenv

## Project Structure

- `index.js` — starts the Express server and connects to PostgreSQL
- `controllers/` — route handlers for blog and user APIs
- `models/` — Sequelize model definitions
- `util/` — database and app configuration helpers
- `commands.sql` — SQL used during database setup or exercises

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database and set your connection string in a `.env` file:

   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/fso_blog
   PORT=3001
   ```

3. Start the app:

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

## API Endpoints

### Users

- `GET /api/users` — list all users
- `POST /api/users` — create a user
- `GET /api/users/:id` — fetch a user by id
- `PUT /api/users/:username` — update a user's name

Example:

```bash
curl http://localhost:3001/api/users
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","name":"Alice Johnson"}'
```

### Blogs

- `GET /api/blogs` — list all blogs
- `POST /api/blogs` — create a blog post
- `PUT /api/blogs/:id` — update likes
- `DELETE /api/blogs/:id` — remove a blog post

Example:

```bash
curl http://localhost:3001/api/blogs
curl -X POST http://localhost:3001/api/blogs \
  -H "Content-Type: application/json" \
  -d '{"author":"Alice","title":"My first post","url":"https://example.com/post","likes":0}'
```

