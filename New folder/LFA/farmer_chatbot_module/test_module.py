# test_module.py

import database as db
import chatbot

def run_test():
    print("--- Starting Chatbot Module Test ---")
    
    # Initialize database first
    db.init_database()
    
    # Create or get a test farmer
    farmer = db.add_or_get_farmer('test_phone_number', name="Ramesh", location="Gandhinagar")
    farmer_id = farmer['id']
    
    # Add some test crops
    db.add_crop(farmer_id, "Cotton", "2025-06-01", "2025-12-01", 5.0)
    db.add_crop(farmer_id, "Wheat", "2025-11-01", "2026-04-01", 3.0)
    
    print("\n[Test Case 1: Weather Query]")
    try:
        response = chatbot.handle_chat_request(farmer_id, "What's the weather forecast?")
        print(f"Bot Response: {response}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n[Test Case 2: Yield Query]")
    try:
        response = chatbot.handle_chat_request(farmer_id, "What will be my cotton yield?")
        print(f"Bot Response: {response}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n[Test Case 3: General Advice]")
    try:
        response = chatbot.handle_chat_request(farmer_id, "How do I take care of my cotton crop?")
        print(f"Bot Response: {response}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n--- Test Complete ---")

if __name__ == "__main__":
    run_test()