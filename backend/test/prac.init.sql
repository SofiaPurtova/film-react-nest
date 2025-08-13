CREATE TABLE film (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  rating FLOAT,
  director TEXT,
  tags TEXT[],
  about TEXT,
  description TEXT,
  image TEXT,
  cover TEXT
);

CREATE TABLE schedule (
  id UUID PRIMARY KEY,
  film_id UUID REFERENCES film(id) ON DELETE CASCADE,
  daytime TIMESTAMPTZ,
  hall TEXT,
  rows INT,
  seats INT,
  price NUMERIC(10,2),
  taken TEXT[]
);