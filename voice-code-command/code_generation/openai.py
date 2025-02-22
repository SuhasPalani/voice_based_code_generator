import requests
import os


def generate_code_from_text(prompt):
    """Use OpenAI API to generate code based on the transcribed text."""
    try:
        if not os.getenv("OPENAI_API_KEY"):
            return "Error: Missing OpenAI API key."

        headers = {
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
            "Content-Type": "application/json",
        }

        # Identify language based on prompt content (simple keyword check)
        if "javascript" in prompt.lower():
            language = "JavaScript"
        elif "python" in prompt.lower():
            language = "Python"
        elif "java" in prompt.lower():
            language = "Java"
        else:
            language = "Python"  # Default to Python if no language is detected

        refined_prompt = f"Write a {language} function based on the following description:\n\n{prompt}\n\nEnsure the code is complete and formatted properly."

        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": f"You are a helpful assistant that generates {language} code."},
                {"role": "user", "content": refined_prompt},
            ],
            "max_tokens": 200,
            "temperature": 0.5,
        }

        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data)
        response_data = response.json()

        if response.status_code != 200:
            return f"Error: OpenAI API request failed. Details: {response_data}"

        if "choices" in response_data and len(response_data["choices"]) > 0:
            return response_data["choices"][0]["message"]["content"].strip()

        return "Error: OpenAI did not return code."
    except Exception as e:
        print(f"Error generating code: {e}")
        return f"Error: {e}"
