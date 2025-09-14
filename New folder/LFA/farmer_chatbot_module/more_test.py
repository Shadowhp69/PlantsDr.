import sqlite3
import os
import database as db
import chatbot

def inspect_database(phone_number):
    """A utility to look inside the DB and verify data was written."""
    print(f"\n--- Inspecting DB for {phone_number} ---")
    conn = sqlite3.connect(db.DB_PATH)
    conn.row_factory = sqlite3.Row
    
    farmer = conn.execute("SELECT * FROM farmers WHERE phone_number = ?", (phone_number,)).fetchone()
    if not farmer:
        print("Result: Farmer NOT found in DB.")
        conn.close()
        return
        
    print(f"Result: Found Farmer '{farmer['name']}' with ID {farmer['id']} and language '{farmer['preferred_language']}'.")
    
    # Check both table names for chat logs
    logs = conn.execute("SELECT * FROM chat_history WHERE farmer_id = ?", (farmer['id'],)).fetchall()
    print(f"Result: Found {len(logs)} chat logs for this farmer.")
    
    if logs:
        print("Recent chat logs:")
        for log in logs[-2:]:  # Show last 2 logs
            print(f"  User: {log['user_message'][:50]}...")
            print(f"  Bot: {log['bot_response'][:50]}...")
    
    conn.close()
    print("--------------------------------------")


def run_advanced_tests():
    """Simplified advanced test suite"""
    print("--- Preparing for Advanced Tests (re-initializing DB) ---")
    
    # Use the correct function name
    db.init_database(force_recreate=True)
    print("Database initialized successfully!")
    print("----------------------------------------------------------\n")

    # Test Case 1: Create a new farmer
    print("[Test Case 1: New Farmer & Basic Conversation]")
    
    test_phone_number = "+919123456789"
    farmer = db.add_or_get_farmer(test_phone_number, name="Sanjay", location="Ahmedabad")
    
    if not farmer:
        print("❌ Failed to create farmer")
        return
    
    farmer_id = farmer['id']
    print(f"✅ Farmer '{farmer['name']}' (ID: {farmer_id}) created successfully.")
    
    # Test basic conversation
    user_query_1 = "Hello, I need help with my cotton farming."
    print(f"-> Farmer Query: '{user_query_1}'")
    
    try:
        bot_response_1 = chatbot.handle_chat_request(farmer_id, user_query_1)
        print(f"<- Bot Response: '{bot_response_1[:100]}...'")
        print("✅ Conversation successful!")
    except Exception as e:
        print(f"❌ Conversation failed: {e}")
    
    # Test follow-up question
    user_query_2 = "What fertilizer should I use?"
    print(f"\n-> Farmer Follow-up: '{user_query_2}'")
    
    try:
        bot_response_2 = chatbot.handle_chat_request(farmer_id, user_query_2)
        print(f"<- Bot Response: '{bot_response_2[:100]}...'")
        print("✅ Follow-up successful!")
    except Exception as e:
        print(f"❌ Follow-up failed: {e}")
    
    # Inspect database
    inspect_database(test_phone_number)

    # Test Case 2: Intent Recognition Tests
    print("\n[Test Case 2: Intent Recognition]")
    
    # Weather intent
    weather_query = "What's the weather forecast?"
    print(f"-> Weather Query: '{weather_query}'")
    try:
        weather_response = chatbot.handle_chat_request(farmer_id, weather_query)
        print(f"<- Weather Response: '{weather_response}'")
    except Exception as e:
        print(f"❌ Weather query failed: {e}")
    
    # Yield intent
    yield_query = "What will my harvest yield be?"
    print(f"\n-> Yield Query: '{yield_query}'")
    try:
        yield_response = chatbot.handle_chat_request(farmer_id, yield_query)
        print(f"<- Yield Response: '{yield_response}'")
    except Exception as e:
        print(f"❌ Yield query failed: {e}")
    
    # Final inspection
    inspect_database(test_phone_number)
    
    print("\n=== Advanced Tests Complete ===")


if __name__ == '__main__':
    run_advanced_tests()