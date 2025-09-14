# quick_test.py - A simple test to verify everything works

import sys
import os

# Test 1: Check if all modules can be imported
print("=== Testing Module Imports ===")
try:
    from config import API_KEY
    print("✅ Config imported successfully")
    print(f"   API Key: {API_KEY[:10]}..." if API_KEY else "❌ API Key not found")
except Exception as e:
    print(f"❌ Config import failed: {e}")

try:
    import database as db
    print("✅ Database module imported successfully")
    
    # Check if required functions exist
    if hasattr(db, 'init_database'):
        print("✅ init_database function found")
    else:
        print("❌ init_database function missing")
        
    if hasattr(db, 'init_db'):
        print("✅ init_db function found")
    else:
        print("❌ init_db function missing")
        
except Exception as e:
    print(f"❌ Database import failed: {e}")

try:
    import chatbot
    print("✅ Chatbot module imported successfully")
except Exception as e:
    print(f"❌ Chatbot import failed: {e}")

# Test 2: Initialize database
print("\n=== Testing Database Initialization ===")
try:
    import database as db
    db.init_database(force_recreate=True)
    print("✅ Database initialized successfully")
    
    # Test farmer creation
    farmer = db.add_or_get_farmer("+919999999999", name="Test Farmer", location="Test City")
    if farmer:
        print(f"✅ Test farmer created: {farmer['name']}")
        farmer_id = farmer['id']
        
        # Test context retrieval
        context = db.get_farmer_context(farmer_id)
        if context:
            print("✅ Farmer context retrieved successfully")
        else:
            print("❌ Failed to retrieve farmer context")
    else:
        print("❌ Failed to create test farmer")
        
except Exception as e:
    print(f"❌ Database test failed: {e}")

# Test 3: Basic chatbot functionality
print("\n=== Testing Basic Chatbot ===")
try:
    if 'farmer_id' in locals():
        response = chatbot.handle_chat_request(farmer_id, "Hello, how are you?")
        print(f"✅ Chatbot responded: {response[:50]}...")
    else:
        print("❌ No farmer_id available for chatbot test")
except Exception as e:
    print(f"❌ Chatbot test failed: {e}")

print("\n=== Test Complete ===")
print("If all tests passed, you can run your more_test.py file")