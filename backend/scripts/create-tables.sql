-- ============================================================
-- Balaqay — Create Tables
-- Run: psql -U postgres -d balaqay -f scripts/create-tables.sql
-- ============================================================

-- Enums
CREATE TYPE age_group AS ENUM ('0-1', '1-3', '3-6', '6-10');
CREATE TYPE task_type  AS ENUM ('игровое', 'двигательное', 'речевое', 'когнитивное');
CREATE TYPE task_section AS ENUM ('задание', 'питание', 'развитие');

-- ─── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(100) NOT NULL,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─── children ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS children (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    birth_date  DATE,                              -- optional, for precise day count
    age_group   age_group    NOT NULL,
    avatar_color VARCHAR(20) NOT NULL DEFAULT '#FFB347',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_children_user ON children(user_id);

-- ─── child_measurements ───────────────────────────────────────
-- Stores height/weight snapshots over time (for progress charts)
CREATE TABLE IF NOT EXISTS child_measurements (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id     UUID          NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    height_cm    NUMERIC(5,1),
    weight_kg    NUMERIC(5,2),
    measured_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    note         TEXT
);

CREATE INDEX idx_measurements_child     ON child_measurements(child_id);
CREATE INDEX idx_measurements_child_date ON child_measurements(child_id, measured_at DESC);

-- ─── tasks ────────────────────────────────────────────────────
-- Pre-defined task catalogue — seeded once, never changes per user
CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255)  NOT NULL,
    description TEXT          NOT NULL,
    emoji       VARCHAR(10)   NOT NULL,
    type        task_type     NOT NULL,
    section     task_section  NOT NULL DEFAULT 'задание',
    age_group   age_group     NOT NULL,
    day_slot    SMALLINT      NOT NULL DEFAULT 1,  -- which slot in a day (1 or 2)
    sort_order  SMALLINT      NOT NULL DEFAULT 0,  -- cycling order within age group
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_age_group ON tasks(age_group);
CREATE INDEX idx_tasks_section   ON tasks(section);

-- ─── daily_assignments ────────────────────────────────────────
-- One row per child per task per day.
-- Populated automatically every morning by the scheduler,
-- or lazily on first request of the day.
CREATE TABLE IF NOT EXISTS daily_assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id        UUID        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    task_id         UUID        NOT NULL REFERENCES tasks(id),
    assigned_date   DATE        NOT NULL,          -- local date the task belongs to
    is_completed    BOOLEAN     NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (child_id, task_id, assigned_date)      -- no duplicates
);

CREATE INDEX idx_assign_child_date ON daily_assignments(child_id, assigned_date DESC);
CREATE INDEX idx_assign_child_done  ON daily_assignments(child_id, is_completed);

-- ─── Trigger: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─── View: progress_summary ───────────────────────────────────
-- Used by the progress endpoint — returns aggregate per child per date
CREATE OR REPLACE VIEW progress_summary AS
SELECT
    da.child_id,
    da.assigned_date,
    COUNT(*)                                          AS total_tasks,
    COUNT(*) FILTER (WHERE da.is_completed = TRUE)   AS completed_tasks,
    ROUND(
        COUNT(*) FILTER (WHERE da.is_completed = TRUE)::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1
    )                                                 AS completion_pct
FROM daily_assignments da
GROUP BY da.child_id, da.assigned_date;

\echo 'Tables created ✓'