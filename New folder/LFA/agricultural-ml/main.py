# main.py

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# 1. Initialize the FastAPI application
app = FastAPI(
    title="Crop Recommendation API",
    description="An API to predict the optimal crop based on soil and weather conditions.",
    version="1.0.0"
)

# 2. Load the trained machine learning model
# The model is loaded only once when the application starts
model = joblib.load('crop_model.joblib')
print("Model loaded successfully!")

# 3. Define the input data structure using Pydantic
# These feature names must match EXACTLY the columns the model was trained on
class CropFeatures(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

    class Config:
        schema_extra = {
            "example": {
                "N": 90,
                "P": 42,
                "K": 43,
                "temperature": 20.87,
                "humidity": 82.0,
                "ph": 6.5,
                "rainfall": 202.9
            }
        }

# 4. Define the prediction endpoint
@app.post("/predict")
def predict_crop(features: CropFeatures):
    """
    Takes soil and weather features as input and returns the predicted crop.
    """
    # Convert the input data into a pandas DataFrame
    # The model expects a 2D array, so we create a DataFrame with a single row
    input_df = pd.DataFrame([features.dict()])

    # Make a prediction
    prediction = model.predict(input_df)

    # The model returns a numpy array, so we get the first (and only) element
    predicted_crop = prediction[0]

    # Return the prediction in a JSON response
    return {"predicted_crop": predicted_crop}

# A simple root endpoint to check if the API is running
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Crop Recommendation API!"}