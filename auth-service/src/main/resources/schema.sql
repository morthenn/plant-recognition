DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL,
    role VARCHAR(50) NOT NULL
); 