from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)
GEMINI_API_KEY = "YOUR_KEY***"


@app.route("/")
def index():
    return render_template("index.html")  # sucht in templates/index.html

@app.route("/ask", methods=["POST"])
def ask():
    user_input = request.json.get("prompt", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

    payload = {
        "contents": [
            {
                "parts": [{"text": user_input}]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        text = f"Fehler: {e}"

    return jsonify({"response": text})

if __name__ == "__main__":
    # app.run(debug=True)
    pass

