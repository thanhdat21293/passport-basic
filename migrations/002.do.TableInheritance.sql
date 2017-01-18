SET SCHEMA 'cms';
DROP TABLE IF EXISTS person CASCADE;

CREATE TABLE person
(
  id   TEXT PRIMARY KEY,
  name TEXT COLLATE pg_catalog."default" NOT NULL UNIQUE
);

DROP TYPE IF EXISTS trainer_type;

CREATE TYPE trainer_type AS ENUM ('part time', 'full time', 'associate');

DROP TABLE IF EXISTS trainer CASCADE;

CREATE TABLE trainer
(
  type trainer_type NOT NULL ,
  active BOOL NOT NULL
) INHERITS (person);