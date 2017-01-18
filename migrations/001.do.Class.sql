SET SCHEMA 'cms';

DROP TABLE IF EXISTS class CASCADE;
CREATE TABLE class
(
  id   TEXT PRIMARY KEY,
  name TEXT COLLATE pg_catalog."default" NOT NULL UNIQUE
);

--------
DROP TABLE IF EXISTS student CASCADE;
CREATE TABLE student
(
  id   TEXT PRIMARY KEY,
  name TEXT COLLATE pg_catalog."default" NOT NULL
);

DROP TABLE IF EXISTS student_class CASCADE;
CREATE TABLE student_class
(
  student_id TEXT NOT NULL REFERENCES student (id),
  class_id   TEXT NOT NULL REFERENCES class (id),
  CONSTRAINT u_constraint UNIQUE (student_id, class_id)
);
