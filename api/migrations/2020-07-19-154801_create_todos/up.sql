CREATE TABLE todos (
	id SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	body TEXT NOT NULL,
	completed BOOLEAN NOT NULL DEFAULT 'f',
	archived BOOLEAN NOT NULL DEFAULT 'f',
	created TIMESTAMP NOT NULL DEFAULT NOW()
);