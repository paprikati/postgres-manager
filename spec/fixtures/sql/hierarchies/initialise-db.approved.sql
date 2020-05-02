CREATE TABLE grandparents (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "name" varchar(50)
);

CREATE TABLE parents (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "grandparent_id" uuid,
    "name" varchar(50)
);

CREATE TABLE children (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "parent_id" uuid,
    "grandparent_id" uuid,
    "name" varchar(50)
);

CREATE TABLE homes (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "parent_id" uuid,
    "grandparent_id" uuid,
    "name" varchar(50)
);

CREATE TABLE rooms (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "home_id" uuid,
    "parent_id" uuid,
    "grandparent_id" uuid,
    "name" varchar(50)
);