# train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier # We'll use this in the next step
from sklearn.metrics import accuracy_score          # And this as well
import joblib

print("--- Step 3: Data Preprocessing & Splitting ---")

# 1. Load the dataset
df = pd.read_csv('Crop_recommendation.csv')

# 2. Separate features (X) and target (y)
# Features are all columns except 'label'
X = df.drop('label', axis=1)
# Target is the 'label' column
y = df['label']

print("\nFeatures (X) shape:", X.shape)
print("Target (y) shape:", y.shape)

# 3. Split the data into training and testing sets
# We use an 80/20 split. random_state ensures we get the same split every time.
# stratify=y ensures the proportion of each crop is the same in both train and test sets.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("\nTraining set shape (X_train):", X_train.shape)
print("Testing set shape (X_test):", X_test.shape)

print("\nData preprocessing and splitting complete.")

# --- We will add the model training code below this line in the next step ---

# === APPEND THIS CODE TO THE END OF train_model.py ===

print("\n--- Step 4: Model Building & Training ---")

# 1. Initialize the Model
# We choose RandomForestClassifier. n_estimators is the number of "trees" in the forest.
# random_state ensures that the model gives the same results every time it's trained.
model = RandomForestClassifier(n_estimators=100, random_state=42)
print("Model initialized: RandomForestClassifier")

# 2. Train the Model
# The .fit() method is where the model learns from the training data.
print("Training the model... This might take a moment.")
model.fit(X_train, y_train)
print("Model training complete.")

# 3. Save the Trained Model
# We use joblib to save our model to a file named 'crop_model.joblib'.
# This allows us to load and use the model later without having to retrain it.
model_filename = 'crop_model.joblib'
joblib.dump(model, model_filename)
print(f"Model saved to '{model_filename}'")

# --- We will add model evaluation code below this line in the next step ---

# === APPEND THIS CODE TO THE END OF train_model.py ===

print("\n--- Step 5: Model Evaluation ---")

# 1. Load the saved model
# We load the model we just saved in the previous step.
loaded_model = joblib.load('crop_model.joblib')
print("Model loaded from 'crop_model.joblib'")

# 2. Make Predictions on the Test Set
# The .predict() method uses the trained model to make predictions on new, unseen data.
print("Making predictions on the test set...")
y_pred = loaded_model.predict(X_test)

# 3. Calculate Accuracy
# We compare the model's predictions (y_pred) with the actual true labels (y_test).
# Accuracy is the percentage of correct predictions.
accuracy = accuracy_score(y_test, y_pred)

print("\n--- Evaluation Results ---")
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# We can also look at a few example predictions vs actual values
print("\nExample Predictions:")
# Create a DataFrame to compare actual vs predicted for the first 10 test samples
comparison_df = pd.DataFrame({'Actual': y_test.head(10), 'Predicted': y_pred[:10]})
print(comparison_df)