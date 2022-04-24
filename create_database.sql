DROP DATABASE IF EXISTS creeptdstats;
CREATE DATABASE creeptdstats;
USE creeptdstats;

CREATE TABLE languages
(
    id INT PRIMARY KEY NOT NULL,
    code VARCHAR(3) NOT NULL
);

CREATE TABLE guilds
(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    discord_id VARCHAR(32) NOT NULL UNIQUE,
    language INT NOT NULL DEFAULT 1,
    FOREIGN KEY(language) REFERENCES languages(id)
);

CREATE TABLE users
(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    discord_id VARCHAR(32) NOT NULL UNIQUE,
    creeptd_username VARCHAR(128) NOT NULL
);

INSERT INTO languages(id, code) VALUES(0, 'EN');

INSERT INTO languages(id, code) VALUES(1, 'FR');

DROP USER IF EXISTS 'creeptdstatsbot'@'localhost';
CREATE USER 'creeptdstatsbot'@'localhost' IDENTIFIED BY '';

GRANT SELECT, INSERT, UPDATE, DELETE ON creeptdstats.* TO 'creeptdstatsbot'@'localhost'