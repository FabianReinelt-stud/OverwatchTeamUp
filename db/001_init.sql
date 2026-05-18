CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS heroes (
    hero_key VARCHAR(30) PRIMARY KEY,
    display_name VARCHAR(30),
    role VARCHAR(30),
    subrole VARCHAR(30),
    winrate NUMERIC(4,1),
    pickrate NUMERIC(4,1),
    health INT,
    armor INT,
    shields INT,
    portrait_url TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS team_comps (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,

    hero_1 VARCHAR(30) REFERENCES heroes(hero_key) ON DELETE RESTRICT,
    hero_2 VARCHAR(30) REFERENCES heroes(hero_key) ON DELETE RESTRICT,
    hero_3 VARCHAR(30) REFERENCES heroes(hero_key) ON DELETE RESTRICT,
    hero_4 VARCHAR(30) REFERENCES heroes(hero_key) ON DELETE RESTRICT,
    hero_5 VARCHAR(30) REFERENCES heroes(hero_key) ON DELETE RESTRICT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE INDEX IF NOT EXISTS idx_team_comps_user_id ON team_comps(user_id);