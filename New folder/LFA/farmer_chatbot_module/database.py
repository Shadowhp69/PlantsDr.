# database.py

import sqlite3
import json
import os
from datetime import datetime

# Database file path
DB_PATH = "farmer_chatbot.db"

def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create farmers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            preferred_language TEXT DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create crops table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            crop_name TEXT NOT NULL,
            planting_date DATE,
            expected_harvest_date DATE,
            area_acres REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers (id)
        )
    ''')
    
    # Create chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            user_message TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def add_or_get_farmer(phone_number, name=None, location=None):
    """Add a new farmer or get existing farmer by phone number"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if farmer exists
    cursor.execute('SELECT * FROM farmers WHERE phone_number = ?', (phone_number,))
    farmer_row = cursor.fetchone()
    
    if farmer_row:
        # Farmer exists, return the existing farmer
        farmer = {
            'id': farmer_row[0],
            'phone_number': farmer_row[1],
            'name': farmer_row[2],
            'location': farmer_row[3],
            'preferred_language': farmer_row[4],
            'created_at': farmer_row[5]
        }
        conn.close()
        return farmer
    else:
        # Farmer doesn't exist, create new one
        if not name or not location:
            conn.close()
            return None
        
        cursor.execute('''
            INSERT INTO farmers (phone_number, name, location, preferred_language)
            VALUES (?, ?, ?, ?)
        ''', (phone_number, name, location, 'en'))
        
        farmer_id = cursor.lastrowid
        conn.commit()
        
        # Get the newly created farmer
        cursor.execute('SELECT * FROM farmers WHERE id = ?', (farmer_id,))
        farmer_row = cursor.fetchone()
        
        farmer = {
            'id': farmer_row[0],
            'phone_number': farmer_row[1],
            'name': farmer_row[2],
            'location': farmer_row[3],
            'preferred_language': farmer_row[4],
            'created_at': farmer_row[5]
        }
        
        conn.close()
        return farmer

def get_farmer_context(farmer_id):
    """Get farmer's complete context including profile, crops, and recent chat history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get farmer profile
    cursor.execute('SELECT * FROM farmers WHERE id = ?', (farmer_id,))
    farmer_row = cursor.fetchone()
    
    if not farmer_row:
        conn.close()
        return None
    
    profile = {
        'id': farmer_row[0],
        'phone_number': farmer_row[1],
        'name': farmer_row[2],
        'location': farmer_row[3],
        'preferred_language': farmer_row[4],
        'created_at': farmer_row[5]
    }
    
    # Get farmer's crops
    cursor.execute('SELECT * FROM crops WHERE farmer_id = ?', (farmer_id,))
    crop_rows = cursor.fetchall()
    
    crops = []
    for crop_row in crop_rows:
        crops.append({
            'id': crop_row[0],
            'crop_name': crop_row[2],
            'planting_date': crop_row[3],
            'expected_harvest_date': crop_row[4],
            'area_acres': crop_row[5],
            'created_at': crop_row[6]
        })
    
    # Get recent chat history (last 10 messages)
    cursor.execute('''
        SELECT user_message, bot_response, timestamp 
        FROM chat_history 
        WHERE farmer_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 10
    ''', (farmer_id,))
    
    history_rows = cursor.fetchall()
    history = []
    
    for hist_row in reversed(history_rows):  # Reverse to get chronological order
        history.extend([
            {"role": "user", "parts": [hist_row[0]]},
            {"role": "model", "parts": [hist_row[1]]}
        ])
    
    conn.close()
    
    return {
        'profile': profile,
        'crops': crops,
        'history': history
    }

def add_to_chat_history(farmer_id, user_message, bot_response):
    """Add a conversation exchange to chat history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO chat_history (farmer_id, user_message, bot_response)
        VALUES (?, ?, ?)
    ''', (farmer_id, user_message, bot_response))
    
    conn.commit()
    conn.close()

def add_crop(farmer_id, crop_name, planting_date=None, expected_harvest_date=None, area_acres=None):
    """Add a crop for a farmer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO crops (farmer_id, crop_name, planting_date, expected_harvest_date, area_acres)
        VALUES (?, ?, ?, ?, ?)
    ''', (farmer_id, crop_name, planting_date, expected_harvest_date, area_acres))
    
    crop_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return crop_id

# Initialize database when module is imported
if __name__ == "__main__":
    init_database()