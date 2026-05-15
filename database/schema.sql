-- Feedback Management System - SQLite Schema
-- Run this script to recreate the database schema from scratch

CREATE TABLE IF NOT EXISTS feedback (
    feedback_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_name VARCHAR NOT NULL,
    program_name  VARCHAR NOT NULL,
    rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments      TEXT,
    submitted_at  DATETIME DEFAULT (datetime('now'))
);
