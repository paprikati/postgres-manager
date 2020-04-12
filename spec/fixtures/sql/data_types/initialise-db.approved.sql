CREATE TABLE data_types (
    "id" uuid PRIMARY KEY UNIQUE NOT NULL,
    "str" varchar(10),
    "json" json,
    "int" smallint,
    "float" double precision,
    "uuid" uuid,
    "mandatory" varchar(50) NOT NULL,
    "date" timestamp without time zone,
    "uneditable" varchar(50)
);