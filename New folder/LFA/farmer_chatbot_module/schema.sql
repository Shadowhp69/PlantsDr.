-- schema.sql

-- Stores the profile of each farmer. The phone_number is the unique identifier.
CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    location TEXT DEFAULT 'Modasa', -- Set a sensible default based on your target area
    preferred_language TEXT DEFAULT 'en', -- e.g., 'en' for English, 'gu' for Gujarati
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stores information about the specific crops each farmer is currently growing.
CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL,
    crop_name TEXT NOT NULL,
    planting_date DATE,
    -- Add any other relevant fields, e.g., acres, soil_type
    FOREIGN KEY (farmer_id) REFERENCES farmers (id) ON DELETE CASCADE
);

-- A complete log of every message exchanged, linked to a farmer.
CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_message TEXT,
    bot_response TEXT,
    intent TEXT, -- Optional but useful for analytics later
    FOREIGN KEY (farmer_id) REFERENCES farmers (id) ON DELETE CASCADE
);