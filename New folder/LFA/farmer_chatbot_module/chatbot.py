# chatbot.py

import requests
import google.generativeai as genai
from config import API_KEY
import database as db

# --- CONFIGURATION ---
# Configure the Generative AI model
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# These are the URLs where the other engineers have deployed their models.
# Replace with the actual URLs when you get them.
WEATHER_API_URL = "http://127.0.0.1:5001/predict_weather"  # Example URL
YIELD_API_URL = "http://127.0.0.1:5002/predict_yield"      # Example URL


# --- INTENT RECOGNITION ---
def get_intent(user_query):
    """
    Uses the LLM to quickly classify the user's intent.
    This is much more flexible than simple keyword matching.
    """
    # For speed, we will use keyword matching first. If no match, then use LLM.
    query_lower = user_query.lower()
    if 'weather' in query_lower or 'rain' in query_lower or 'forecast' in query_lower:
        return 'weather_forecast'
    if 'yield' in query_lower or 'harvest' in query_lower or 'production' in query_lower:
        return 'yield_prediction'
    
    # If no keywords match, you could use a more advanced LLM call here,
    # but for now, we'll default to general advice.
    return 'general_advice'


# --- MAIN ORCHESTRATOR FUNCTION ---
def handle_chat_request(farmer_id, user_query):
    """
    This is the main function that the Backend API will call.
    It orchestrates the entire response process.
    """
    context = db.get_farmer_context(farmer_id)
    if not context:
        return "Error: Could not find farmer profile."

    intent = get_intent(user_query)
    bot_response = ""

    # 1. Decision: Is the intent to call a predictive model?
    if intent == 'weather_forecast':
        try:
            location = context['profile'].get('location', 'Modasa')
            api_payload = {'location': location}
            response = requests.post(WEATHER_API_URL, json=api_payload)
            response.raise_for_status()  # Raise an exception for bad status codes
            weather_data = response.json()
            # Format a user-friendly response
            bot_response = f"The weather forecast for {location} is: {weather_data.get('forecast', 'Not available')}."
        except requests.exceptions.RequestException as e:
            print(f"Error calling Weather API: {e}")
            bot_response = "Sorry, I am unable to get the weather forecast right now."

    elif intent == 'yield_prediction':
        # This is left as an exercise, following the weather example.
        bot_response = "Yield prediction is not yet implemented."

    # 2. Decision: If no special intent, have a general conversation.
    else:
        try:
            system_prompt = f"""
            You are Krishi-Mitra, an expert AI assistant for farmers in Gujarat, India.
            You are talking to a farmer with this profile: {context['profile']}
            Their current crops are: {context['crops']}
            Respond in their preferred language: {context['profile'].get('preferred_language', 'en')}.
            Today's date is 14 September 2025.
            Be helpful, concise, and friendly.
            """

            chat = model.start_chat(history=context['history'])
            prompt = f"{system_prompt}\n\nFarmer's question: {user_query}"
            response = chat.send_message(prompt)
            bot_response = response.text
        except Exception as e:
            print(f"Error calling Generative AI: {e}")
            bot_response = "I'm sorry, I'm having a little trouble thinking right now. Please try again in a moment."

    # Store the conversation in the database for context
    db.add_to_chat_history(farmer_id, user_query, bot_response)
    
    return bot_response