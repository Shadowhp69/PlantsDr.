# config.py
import os
from dotenv import load_dotenv # type: ignore

# Load variables from the .env file into the environment
load_dotenv()

API_KEY = os.getenv('GEMINI_API_KEY')

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please set it in the .env file.")