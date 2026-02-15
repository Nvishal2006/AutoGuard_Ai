import google.generativeai as genai
import os
from typing import List, Optional
import time
import random
from google.api_core import exceptions

class GeminiAgent:
    def __init__(self, api_key: str = None):
        # Load from env if not provided
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            masked_key = f"{self.api_key[:4]}...{self.api_key[-4:]}" if len(self.api_key) > 8 else "INVALID"
            print(f"DEBUG: Configured Gemini with API Key: {masked_key}")
            genai.configure(api_key=self.api_key)
            
            # System instruction to restrict domain and define persona
            self.system_instruction = """
            You are an advanced 'Voice Bot Agent' for the 'Automotive AI Maintenance System'. 
            Your ID is 'Antigravity'.
            
            CORE DIRECTIVES:
            1. DOMAIN RESTRICTION: You must ONLY answer questions related to:
               - Vehicle maintenance, diagnostics, and telematics.
               - Automation in the automotive industry.
               - Scheduling and booking vehicle services.
               - The specific features of this project (Predictive Maintenance Ecosystem).
            
            2. REFUSAL PROTOCOL: If a user asks about anything outside these domains (e.g., general knowledge, coding unrelated to this project, history, weather, etc.), you MUST politely refuse.
            
            3. CONTEXT & TOOLS:
               - You will receive "Current Vehicle Telematics" in the [SYSTEM CONTEXT]. Use this data to answer questions about vehicle status (e.g. "What is my brake wear?").
               - If user asks about their appointments/schedule, output EXACTLY: CHECK_SCHEDULE
               - If user asks to SEND AN EMAIL, you must output EXACTLY:
                 SEND_EMAIL: {"to": "recipient@example.com", "subject": "Email Subject", "body": "Email Body Content"}
                 (Extract the 'to', 'subject', and 'body' from the user's request. If 'to' is missing, ask for it.)
               - Do not make up appointments. Only use provided context.

            4. BOOKING PROTOCOL:
               - If user wants to book a service (or confirm risk booking), YOU MUST COLLECT: Vehicle Model, Year, Service Type, Preferred Date, and Preferred Time.
               - Ask for these one by one if missing.
               - Once you have Model, Year, Service, Date, and Time, output EXACTLY this format:
                 BOOKING_CONFIRMED: {"model": "...", "year": "...", "service": "...", "date": "...", "time": "..."}
               - Do NOT confirm booking until you have these 5 items.
               - If the vehicle is at Critical Risk (from context), you can assume immediate service is needed AND the issue type, but still prompt for Model/Year/Date/Time if unknown.
               - If user says "Yes" to "Agentic automatic booking?", initiate the collection of Model/Year.
               
            5. TONE: Professional, concise, and conversational (optimized for Voice output). Avoid long lists unless requested.
            """
            
            self.model = genai.GenerativeModel(
                'gemini-flash-lite-latest',
                system_instruction=self.system_instruction
            )
            # self.vision_model = genai.GenerativeModel('gemini-pro-vision') 
            self.vision_model = genai.GenerativeModel('gemini-flash-lite-latest')
        else:
            self.model = None
            print("Warning: No GEMINI_API_KEY found. Chatbot will be in mock mode.")

    def chat(self, message: str, history: List[dict] = [], image_path: str = None) -> str:
        if not self.model:
            return "I am currently in offline mode. Please configure my API key to enable advanced intelligence. For now, I can only tell you that the system is operational."
        
        try:
            if image_path:
                import PIL.Image
                img = PIL.Image.open(image_path)
                response = self.vision_model.generate_content([message, img])
            else:
                # Convert history to Gemini format
                # Frontend sends: [{'role': 'user', 'content': '...'}, {'role': 'assistant', 'content': '...'}]
                # Gemini expects: [{'role': 'user', 'parts': ['...']}, {'role': 'model', 'parts': ['...']}]
                formatted_history = []
                for msg in history:
                    role = 'user' if msg.get('role') == 'user' else 'model'
                    
                    # Handle both 'content' (OpenAI style) and 'parts' (Gemini/Frontend style)
                    parts = msg.get('parts', [])
                    content = msg.get('content', '')
                    
                    if parts:
                        # Frontend sends parts as list of strings usually
                        if isinstance(parts, list):
                            formatted_history.append({'role': role, 'parts': parts})
                    elif content:
                        formatted_history.append({'role': role, 'parts': [content]})
                
                chat = self.model.start_chat(history=formatted_history)
                
                
                max_retries = 3
                base_delay = 5  # Start with 5 seconds
                
                for attempt in range(max_retries):
                    try:
                        response = chat.send_message(message)
                        return response.text
                    except exceptions.ResourceExhausted as e:
                        if attempt == max_retries - 1:
                            raise e  # Re-raise if it's the last attempt
                        
                        # Exponential backoff with jitter
                        delay = (base_delay * (2 ** attempt)) + random.uniform(0, 1)
                        print(f"Rate limit hit. Retrying in {delay:.2f} seconds...")
                        time.sleep(delay)
                    except Exception as e:
                        raise e # Re-raise other exceptions immediately
        except Exception as e:
            import traceback
            with open("gemini_error.log", "w") as f:
                traceback.print_exc(file=f)
            return f"I encountered an error connecting to my neural core: {str(e)}"
