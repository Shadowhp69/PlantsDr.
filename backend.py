from flask import Flask, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)
client = OpenAI(api_key=os.getenv("AIzaSyD4ttzvCR8p1XsVAhI6x2jNFBspO4iiZF0"))

@app.route("/", methods=["GET"])
def home():
    return "Chatbot API is running!"

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    message = data.get("message", "")
    language = data.get("language", "en")

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"You are a helpful assistant responding in {language}."},
            {"role": "user", "content": message}
        ],
    )
    answer = response.choices[0].message.content
    return jsonify({"response": answer})

if __name__ == "__main__":
    app.run(debug=True)

