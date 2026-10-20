-- =============================================================================
-- DATABASE_SCHEMA.sql — NusaFuel Grid (UINIC 8.0 Competition)
-- PostgreSQL DDL — 6 Relational Tables
-- Author: NusaFuel Grid Engineering Team
-- Description: Full relational schema for SPBU Queue Management,
--              Odd-Even Enforcement, Anti-Hoarding Guard, and Auto-Restock Webhook.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------

CREATE TYPE fuel_type_enum AS ENUM ('Pertalite', 'Pertamax', 'Solar');

CREATE TYPE operational_mode_enum AS ENUM (
  'NORMAL',
  'THROTTLED',
  'UNLOADING',
  'EMERGENCY_ONLY'
);

CREATE TYPE plate_parity_enum AS ENUM ('ODD', 'EVEN');

CREATE TYPE vehicle_type_enum AS ENUM ('MOTOR', 'MOBIL', 'DARURAT');

CREATE TYPE ticket_status_enum AS ENUM (
  'BOOKED',
  'COMPLETED',
  'BLOCKED_HOARDING'
);

CREATE TYPE dispatch_trigger_enum AS ENUM (
  'AUTO_WEBHOOK_LOW_TANK',
  'MANUAL_OPERATOR'
);

CREATE TYPE dispatch_status_enum AS ENUM (
  'PENDING_DISPATCH',
  'IN_TRANSIT',
  'DELIVERED'
);

CREATE TYPE actor_role_enum AS ENUM (
  'PUBLIC_DRIVER',
  'SPBU_OPERATOR',
  'DEPOT_SYSTEM',
  'SECURITY_GUARD'
);

CREATE TYPE log_severity_enum AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- ---------------------------------------------------------------------------
-- TABLE 1: spbu_stations
-- Represents each physical SPBU (gas station) in Buleleng.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spbu_stations (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  code                    VARCHAR(20)  NOT NULL UNIQUE,             -- e.g. '54.811.14'
  name                    VARCHAR(120) NOT NULL,                    -- e.g. 'SPBU Pertamina Gajah Mada'
  address                 VARCHAR(255) NOT NULL,
  district                VARCHAR(80)  NOT NULL,
  lat                     FLOAT        NOT NULL,
  lng                     FLOAT        NOT NULL,
  active_nozzles          INT          NOT NULL DEFAULT 4,
  odd_even_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  dynamic_throttling_active BOOLEAN    NOT NULL DEFAULT TRUE,
  emergency_reserve_active  BOOLEAN    NOT NULL DEFAULT TRUE,
  operational_mode        operational_mode_enum NOT NULL DEFAULT 'NORMAL',
  created_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR,
  updated_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR
);

COMMENT ON TABLE  spbu_stations IS 'Physical SPBU locations in Kabupaten Buleleng, Bali.';
COMMENT ON COLUMN spbu_stations.code IS 'Pertamina station code, e.g. 54.811.14';
COMMENT ON COLUMN spbu_stations.odd_even_active IS 'Whether Odd-Even plate restriction is enforced today.';
COMMENT ON COLUMN spbu_stations.dynamic_throttling_active IS 'Whether Dynamic Quota Throttling is active.';
COMMENT ON COLUMN spbu_stations.emergency_reserve_active IS 'Whether 10% Emergency Reserve Lock is active.';

-- ---------------------------------------------------------------------------
-- TABLE 2: fuel_tanks
-- Each SPBU can have multiple fuel tanks (one per fuel type).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_tanks (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  spbu_id                 VARCHAR(36)  NOT NULL REFERENCES spbu_stations(id) ON DELETE CASCADE,
  fuel_type               fuel_type_enum NOT NULL,
  current_liters          INT          NOT NULL DEFAULT 0 CHECK (current_liters >= 0),
  max_capacity_liters     INT          NOT NULL CHECK (max_capacity_liters > 0),
  booked_liters           INT          NOT NULL DEFAULT 0 CHECK (booked_liters >= 0),
  burn_rate_lpm           FLOAT        NOT NULL DEFAULT 1.2,  -- liters per minute average dispense rate
  unloading_minutes_left  INT          NOT NULL DEFAULT 0 CHECK (unloading_minutes_left >= 0),
  last_do_liters          INT          NOT NULL DEFAULT 0,    -- last Delivery Order volume
  created_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR,
  updated_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR,
  UNIQUE (spbu_id, fuel_type)
);

COMMENT ON TABLE  fuel_tanks IS 'Real-time fuel tank telemetry per SPBU per fuel type.';
COMMENT ON COLUMN fuel_tanks.burn_rate_lpm IS 'Average liters dispensed per minute across all nozzles.';
COMMENT ON COLUMN fuel_tanks.unloading_minutes_left IS 'Countdown (minutes) for active tanker truck unloading. 0 = not unloading.';
COMMENT ON COLUMN fuel_tanks.booked_liters IS 'Total liters locked by pending BOOKED tickets.';

-- ---------------------------------------------------------------------------
-- TABLE 3: time_slots
-- 30-minute booking windows per SPBU per fuel tank.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_slots (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  spbu_id                 VARCHAR(36)  NOT NULL REFERENCES spbu_stations(id) ON DELETE CASCADE,
  fuel_tank_id            VARCHAR(36)  NOT NULL REFERENCES fuel_tanks(id) ON DELETE CASCADE,
  slot_date               VARCHAR(12)  NOT NULL,   -- YYYY-MM-DD
  window_label            VARCHAR(32)  NOT NULL,   -- e.g. '13:00 - 13:30 WITA'
  window_start_hour       INT          NOT NULL,   -- 7..20
  window_start_minute     INT          NOT NULL DEFAULT 0,
  capacity_liters         INT          NOT NULL,   -- total liter allocation for this slot
  booked_liters           INT          NOT NULL DEFAULT 0,
  is_locked               BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR
);

COMMENT ON TABLE  time_slots IS '30-minute booking windows per SPBU fuel tank for digital queue management.';
COMMENT ON COLUMN time_slots.capacity_liters IS 'Max liters that can be allocated in this 30-minute window.';
COMMENT ON COLUMN time_slots.booked_liters IS 'Currently committed liters from all BOOKED tickets.';
COMMENT ON COLUMN time_slots.is_locked IS 'True when slot is fully booked (booked_liters >= capacity_liters).';

CREATE INDEX IF NOT EXISTS idx_time_slots_spbu_date ON time_slots(spbu_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_tank ON time_slots(fuel_tank_id);

-- ---------------------------------------------------------------------------
-- TABLE 4: queue_tickets
-- Digital QR tickets issued to drivers who book a time slot.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS queue_tickets (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  ticket_code             VARCHAR(24)  NOT NULL UNIQUE,          -- e.g. 'NFG-81114-042'
  spbu_id                 VARCHAR(36)  NOT NULL REFERENCES spbu_stations(id) ON DELETE CASCADE,
  slot_id                 VARCHAR(36)  NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  plate_number            VARCHAR(20)  NOT NULL,                 -- validated Indonesian plate regex
  plate_parity            plate_parity_enum NOT NULL,
  vehicle_type            vehicle_type_enum NOT NULL,
  fuel_type               fuel_type_enum NOT NULL,
  quota_liters            INT          NOT NULL CHECK (quota_liters > 0),
  qr_hash                 VARCHAR(64)  NOT NULL,                 -- SHA-256 cryptographic verification hash
  status                  ticket_status_enum NOT NULL DEFAULT 'BOOKED',
  verified_by_operator    VARCHAR(36)  NULL,                     -- operator who scanned & verified
  verified_at             VARCHAR(32)  NULL,
  block_reason            VARCHAR(255) NULL,                     -- populated when status = BLOCKED_HOARDING
  created_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR
);

COMMENT ON TABLE  queue_tickets IS 'Digital QR queue tickets issued to drivers. Verified by SPBU cashier scanner.';
COMMENT ON COLUMN queue_tickets.ticket_code IS 'Human-readable code, e.g. NFG-81114-042.';
COMMENT ON COLUMN queue_tickets.qr_hash IS 'SHA-256 of (ticket_code + plate_number + slot_id + quota_liters + secret_salt).';
COMMENT ON COLUMN queue_tickets.status IS 'BOOKED: pending; COMPLETED: verified & fuel dispensed; BLOCKED_HOARDING: anti-hoarding rejection.';

CREATE INDEX IF NOT EXISTS idx_queue_tickets_plate ON queue_tickets(plate_number);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_spbu_status ON queue_tickets(spbu_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_slot ON queue_tickets(slot_id);

-- ---------------------------------------------------------------------------
-- TABLE 5: restock_dispatches
-- B2B auto-restock webhook records: tanker truck dispatch orders to Depot.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restock_dispatches (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  dispatch_code           VARCHAR(24)  NOT NULL UNIQUE,           -- e.g. 'DISP-8002-0001'
  spbu_id                 VARCHAR(36)  NOT NULL REFERENCES spbu_stations(id) ON DELETE CASCADE,
  fuel_tank_id            VARCHAR(36)  NOT NULL REFERENCES fuel_tanks(id) ON DELETE CASCADE,
  fuel_type               fuel_type_enum NOT NULL,
  trigger_source          dispatch_trigger_enum NOT NULL DEFAULT 'AUTO_WEBHOOK_LOW_TANK',
  trigger_fill_percent    FLOAT        NOT NULL,                  -- tank % at time of trigger
  requested_liters        INT          NOT NULL DEFAULT 8000,
  status                  dispatch_status_enum NOT NULL DEFAULT 'PENDING_DISPATCH',
  eta_minutes             INT          NOT NULL DEFAULT 20,
  dispatched_at           VARCHAR(32)  NULL,
  delivered_at            VARCHAR(32)  NULL,
  created_at              VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR
);

COMMENT ON TABLE  restock_dispatches IS 'Tanker truck restock orders auto-triggered when tank < 20% or manually by operator.';
COMMENT ON COLUMN restock_dispatches.trigger_fill_percent IS 'Tank fill percentage that triggered this dispatch (e.g. 16.9).';

CREATE INDEX IF NOT EXISTS idx_restock_dispatches_spbu ON restock_dispatches(spbu_id, status);

-- ---------------------------------------------------------------------------
-- TABLE 6: security_audit_logs
-- Immutable append-only log of all state-mutating events.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id                      VARCHAR(36)  PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
  timestamp               VARCHAR(32)  NOT NULL DEFAULT NOW()::VARCHAR,
  actor_role              actor_role_enum NOT NULL,
  event_type              VARCHAR(60)  NOT NULL,   -- e.g. 'SLOT_BOOKED', 'QR_VERIFIED', 'HOARDING_BLOCKED'
  spbu_code               VARCHAR(20)  NOT NULL,
  reference_id            VARCHAR(64)  NULL,       -- ticket_code / dispatch_code / plate_number
  severity                log_severity_enum NOT NULL DEFAULT 'INFO',
  message                 TEXT         NOT NULL,
  metadata_json           TEXT         NULL        -- optional JSON blob for additional context
);

COMMENT ON TABLE  security_audit_logs IS 'Immutable audit trail for all security-sensitive and state-mutating events.';
COMMENT ON COLUMN security_audit_logs.event_type IS 'Structured event name: SLOT_BOOKED | QR_VERIFIED | HOARDING_BLOCKED | DO_UPDATED | POLICY_CHANGED | WEBHOOK_TRIGGERED | CRISIS_SIMULATED | PARITY_TOGGLED.';
COMMENT ON COLUMN security_audit_logs.severity IS 'INFO: routine operations; WARNING: quota-limit events; CRITICAL: hoarding blocks, tank dry, webhook failures.';

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON security_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_spbu ON security_audit_logs(spbu_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON security_audit_logs(severity);

-- ---------------------------------------------------------------------------
-- FOREIGN KEY SUMMARY (for documentation clarity)
-- ---------------------------------------------------------------------------
-- fuel_tanks.spbu_id           -> spbu_stations.id
-- time_slots.spbu_id           -> spbu_stations.id
-- time_slots.fuel_tank_id      -> fuel_tanks.id
-- queue_tickets.spbu_id        -> spbu_stations.id
-- queue_tickets.slot_id        -> time_slots.id
-- restock_dispatches.spbu_id   -> spbu_stations.id
-- restock_dispatches.fuel_tank_id -> fuel_tanks.id
-- ---------------------------------------------------------------------------
