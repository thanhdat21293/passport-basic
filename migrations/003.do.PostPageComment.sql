SET SCHEMA 'cms';
DROP TABLE IF EXISTS post CASCADE;

CREATE TABLE post
(
  id   TEXT PRIMARY KEY,
  title TEXT COLLATE pg_catalog."default" NOT NULL,
  content TEXT COLLATE pg_catalog."default" NOT NULL,
  author TEXT NOT NULL REFERENCES person(id),
  cdate TIMESTAMP  -- created date
);


DROP TABLE IF EXISTS page CASCADE;
CREATE TABLE page
(
  id   TEXT PRIMARY KEY,
  title TEXT COLLATE pg_catalog."default" NOT NULL,
  content TEXT COLLATE pg_catalog."default" NOT NULL,
  author TEXT NOT NULL REFERENCES person(id),
  cdate TIMESTAMP  -- created date
);

DROP TABLE IF EXISTS comment CASCADE;

CREATE TABLE comment
(
  id   TEXT PRIMARY KEY,
  content TEXT COLLATE pg_catalog."default" NOT NULL,
  author TEXT NOT NULL REFERENCES person(id),
  target_id TEXT NOT NULL,   -- sẽ là id của post hoặc page
  reply_comment_id TEXT REFERENCES comment(id),  -- comment that it replies to.
  cdate TIMESTAMP  -- created date
);