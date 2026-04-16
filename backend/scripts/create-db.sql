-- ============================================================
-- Balaway — Create Database
-- Run: psql -U postgres -f scripts/create-db.sql
-- ============================================================

SELECT 'CREATE DATABASE balaqay'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'balaqay'
)\gexec

\connect balaqay

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\echo 'Database balaqay ready ✓'