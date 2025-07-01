-- init_schema.sql

-- This script will be executed by PostgreSQL's entrypoint
-- when the container starts for the first time.

-- Create the schema if it doesn't exist.
-- This ensures that if the script runs multiple times (e.g., during development
-- if you rebuild the container but the volume persists), it won't fail.
CREATE SCHEMA IF NOT EXISTS interviewdb;

-- Set the search path to 'interviewdb'.
-- This ensures that all subsequent unqualified table creations (e.g., 'CREATE TABLE cities')
-- will create the tables within the 'interviewdb' schema.
-- 'public' is included to ensure access to default types and functions.
SET search_path TO interviewdb, public;

-- Create tables within the 'interviewdb' schema
CREATE TABLE cities (
    city_id SERIAL PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL UNIQUE,
    city_code INT,
    country VARCHAR(100),
    population INT
);


CREATE TABLE streets (
     id SERIAL PRIMARY KEY
    , street_id INT
    , region_code INT
    , region_name VARCHAR(255)
    , city_id INT NOT NULL REFERENCES cities(city_id)
    , street_code INT
    , street_name VARCHAR(255)
    , street_name_status VARCHAR(255)
    , official_code INT
);

-- Create indexes for better query performance
CREATE INDEX idx_streets_street_name ON streets(street_name);
CREATE INDEX idx_streets_city_id ON streets(city_id);

-- Add some initial data for testing
-- INSERT INTO cities (city_name, country, population) VALUES
-- ('New York', 'USA', 8400000),
-- ('London', 'UK', 8900000);

