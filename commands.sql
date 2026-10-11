CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES ('Dan Abramov', 'https://overreacted.io/', 'Overreacted');
INSERT INTO blogs (author, url, title, likes) VALUES ('Kent C. Dodds', 'https://kentcdodds.com/blog', 'Kent C. Dodds Blog', 5);
