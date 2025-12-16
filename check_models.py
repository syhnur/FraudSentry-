import google.generativeai as genai

# Configure with your key
genai.configure(api_key="AIzaSyB27AD01sMMGaHcPYcxcJyYmdOe_4uTMRE")

print("Checking available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")