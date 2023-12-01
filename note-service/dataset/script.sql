DROP TABLE IF EXISTS notes;
CREATE TABLE notes (
  user_id serial PRIMARY KEY,
  user_name varchar,
  note text,
  access varchar
);

CREATE INDEX ON notes (access);