import os
from google import genai
from google.genai import types

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment.")
            
        self.client = genai.Client(api_key=api_key)
        self.system_instruction = (
            "You are an AI analytics assistant for a computer vision surveillance system called Odin-CV. "
            "Your job is to answer user queries about the events and alerts that have been logged by the system. "
            "You will be provided with 'Analytics Context' containing the raw logs. Use ONLY this context to answer the user's questions. "
            "If the context doesn't contain the answer, say 'I cannot determine that from the current logs.' "
            "CRITICAL: Present your answers in a highly readable, human-friendly format. "
            "Do NOT just spit out raw ISO timestamps like '2026-09-19T19:13:17.840102+00:00'. Instead, convert them into a clean, readable format like 'Sept 19, 2026 at 7:13 PM UTC'. "
            "Avoid overly technical phrasing unless specifically requested. Use bullet points, bold text, and clear summaries to make your answers look polished and professional."
        )

    def query(self, user_question: str, context: str) -> str:
        prompt = f"### Analytics Context\n{context}\n\n### User Question\n{user_question}"
        try:
            response = self.client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction
                )
            )
            return response.text
        except Exception as e:
            return f"Error communicating with LLM: {str(e)}"
