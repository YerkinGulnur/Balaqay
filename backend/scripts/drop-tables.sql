-- ============================================================
-- Balaqay — Drop All Tables (for reset)
-- Run: psql -U postgres -d balaqay -f scripts/drop-tables.sql
-- ============================================================

DROP VIEW  IF EXISTS progress_summary CASCADE;
DROP TABLE IF EXISTS daily_assignments CASCADE;
DROP TABLE IF EXISTS tasks             CASCADE;
DROP TABLE IF EXISTS child_measurements CASCADE;
DROP TABLE IF EXISTS children          CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TYPE  IF EXISTS task_section      CASCADE;
DROP TYPE  IF EXISTS task_type         CASCADE;
DROP TYPE  IF EXISTS age_group         CASCADE;

\echo 'All tables dropped ✓'