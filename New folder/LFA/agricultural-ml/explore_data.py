# explore_data.py

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --- 1. Load the Dataset ---
print("Loading the dataset...")
# We use the filename that we placed in our project folder
df = pd.read_csv('Crop_recommendation.csv')
print("Dataset loaded successfully!")

# --- 2. Basic Exploration ---
print("\n--- First 5 Rows of the Dataset ---")
print(df.head())

print("\n--- Dataset Information ---")
# This tells us the column names, number of non-null values, and data types
df.info()

print("\n--- Statistical Summary ---")
# This gives us mean, std, min, max, etc., for the numerical columns
print(df.describe())

print("\n--- Checking for Missing Values ---")
# This will show a count of any missing values in each column
print(df.isnull().sum())

print("\n--- Unique Crop Labels ---")
# Let's see how many different crops we are working with
print(df['label'].unique())


# --- 3. Visualization ---
print("\nGenerating visualizations... (Close the plot windows to continue)")

# Plot the distribution of a key feature, for example, Temperature
plt.figure(figsize=(10, 6))
sns.histplot(df['temperature'], kde=True, bins=30)
plt.title('Distribution of Temperature')
plt.xlabel('Temperature (°C)')
plt.ylabel('Frequency')
plt.show() # This will display the first plot

# Create a correlation matrix heatmap
# We rename the columns for better readability on the plot
df_renamed = df.rename(columns={
    'N': 'Nitrogen', 'P': 'Phosphorus', 'K': 'Potassium',
    'ph': 'pH', 'rainfall': 'Rainfall', 'temperature': 'Temperature',
    'humidity': 'Humidity'
})

# We only want to correlate the numerical features
numerical_cols = ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall']
correlation_matrix = df_renamed[numerical_cols].corr()

plt.figure(figsize=(12, 9))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Matrix of Features')
plt.show() # This will display the second plot

print("\nExploratory Data Analysis complete.")