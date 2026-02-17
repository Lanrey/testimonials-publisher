CREATE TABLE IF NOT EXISTS creators (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forms (
  id serial PRIMARY KEY,
  creator_id integer NOT NULL REFERENCES creators(id),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id serial PRIMARY KEY,
  form_id integer NOT NULL REFERENCES forms(id),
  name text NOT NULL,
  role text,
  company text,
  quote text NOT NULL,
  email text,
  created_at timestamp NOT NULL DEFAULT now(),
  approved_at timestamp
);
