import os
import uvicorn
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext

# --- 1. Configuration ---
# In a real app, use a .env file for these settings.
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-that-is-long-and-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Mock Twilio Configuration ---
TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN = "your_twilio_auth_token"
TWILIO_PHONE_NUMBER = "+15005550006" # Use Twilio's test number

# --- 2. In-Memory Database ---
# A simple dictionary to simulate a database for demonstration purposes.
fake_users_db = {}

# --- 3. Security & Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 4. Pydantic Models (Data Schemas) ---

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class SMSRequest(BaseModel):
    to_number: str = Field(..., example="+1234567890")
    message: str = Field(..., example="Hello from the API!")

class MLModelInput(BaseModel):
    features: List[float] = Field(..., example=[1.0, 2.5, 3.0, 4.5])

class MLModelOutput(BaseModel):
    prediction: float

class ChatbotRequest(BaseModel):
    user_id: str = Field(..., example="user123")
    text: str = Field(..., example="What's the weather like in Ahmedabad?")

class ChatbotResponse(BaseModel):
    reply: str

# --- 5. User & Authentication Logic ---

def get_user(db, username: str):
    """Retrieves a user from the fake database."""
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(db, username: str, password: str):
    """Authenticates a user by checking username and password."""
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Decodes token and returns the current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Checks if the current user is active."""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# --- 6. Mock Twilio Service ---
# This class simulates the behavior of the Twilio client.
class MockTwilioClient:
    def __init__(self, sid, token):
        self.sid = sid
        self.token = token
        print("--- Mock Twilio Client Initialized ---")
        print(f"SID: {self.sid}, Token: {'*' * len(token)}")

    def send_sms(self, to_number: str, from_number: str, body: str):
        """Prints the SMS to the console instead of sending it."""
        print("\n--- SIMULATING SENDING SMS ---")
        print(f"  To: {to_number}")
        print(f"  From: {from_number}")
        print(f"  Message: '{body}'")
        print("------------------------------\n")
        return {"status": "queued", "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}

# Initialize the mock client
mock_twilio_service = MockTwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


# --- 7. FastAPI App and Routes ---
app = FastAPI(
    title="Backend API Service",
    description="Manages user authentication, ML model integration, and SMS notifications.",
    version="1.0.0"
)

# --- Authentication Routes ---
@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Logs in a user and returns a JWT access token.
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(user: UserCreate):
    """
    Registers a new user in the database.
    """
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(**user.model_dump(), hashed_password=hashed_password)
    fake_users_db[user.username] = user_in_db.model_dump()
    return User(**user_in_db.model_dump())

@app.get("/users/me/", response_model=User, tags=["Users"])
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Fetches the profile of the currently authenticated user.
    """
    return current_user

# --- Twilio SMS Route ---
@app.post("/sms/send", status_code=status.HTTP_200_OK, tags=["Notifications"])
def send_sms_notification(
    sms_data: SMSRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    (Protected) Sends an SMS using the (mock) Twilio service.
    """
    print(f"User '{current_user.username}' is sending an SMS.")
    try:
        result = mock_twilio_service.send_sms(
            to_number=sms_data.to_number,
            from_number=TWILIO_PHONE_NUMBER,
            body=sms_data.message
        )
        return {"status": "success", "detail": "SMS sent successfully (simulated).", "twilio_response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")


# --- ML & Chatbot Integration Routes ---
@app.post("/ml/predict", response_model=MLModelOutput, tags=["Integrations"])
def predict_with_ml_model(
    model_input: MLModelInput,
    current_user: User = Depends(get_current_active_user)
):
    """
    (Protected) Simulates getting a prediction from a machine learning model.
    The frontend sends features, this API forwards them and returns a prediction.
    """
    print(f"User '{current_user.username}' requested a prediction with features: {model_input.features}")
    # --- MOCK ML MODEL LOGIC ---
    # In a real app, you would make an HTTP request to your ML model's API here.
    # e.g., response = requests.post("http://ml-model-service/predict", json={"features": model_input.features})
    # For now, we'll just sum the features as a stand-in for a real prediction.
    prediction = sum(model_input.features)
    # ---------------------------
    return {"prediction": prediction}

@app.post("/chatbot/message", response_model=ChatbotResponse, tags=["Integrations"])
def talk_to_chatbot(
    chat_request: ChatbotRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    (Protected) Simulates a conversation with a chatbot.
    The frontend sends a user message, this API gets a reply.
    """
    print(f"User '{current_user.username}' is chatting. Message: '{chat_request.text}'")
    # --- MOCK CHATBOT LOGIC ---
    # Here, you would call the chatbot's API.
    # e.g., response = requests.post("https://api.chatbot.com/v1/message", json=chat_request.dict())
    user_message = chat_request.text.lower()
    if "weather" in user_message and "ahmedabad" in user_message:
        reply = "The weather in Ahmedabad is currently sunny and around 34°C."
    elif "hello" in user_message:
        reply = f"Hello, {current_user.full_name or current_user.username}! How can I help you today?"
    else:
        reply = "I'm a simple mock chatbot. I can only tell you the weather in Ahmedabad."
    # ---------------------------
    return {"reply": reply}

# This allows running the app directly with `python main.py`
if __name__ == "__main__":
    print("Starting FastAPI server...")
    print("API docs will be available at http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
