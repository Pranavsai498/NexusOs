import google.generativeai as genai
from app.core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# We'll use this for the chat endpoint
model = genai.GenerativeModel('models/gemini-3.5-flash')

def chunk_text(text: str, max_chars=1000):
    return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

def generate_embedding(text: str):
    if not settings.GEMINI_API_KEY:
        return [0.0] * 768
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 768

def extract_text_from_file(content: bytes, filename: str) -> str:
    # A real OCR implementation would go here (e.g., Tesseract or Gemini vision)
    return f"Extracted text from {filename}...\n" + content.decode('utf-8', errors='ignore')

async def generate_chat_response(prompt: str, context: str = "") -> str:
    """Generate a chat response using Gemini API."""
    try:
        if not settings.GEMINI_API_KEY:
            return "Gemini API key is not configured. Please add it to your .env file."
        
        full_prompt = f"System Context: You are NexusOS, an AI Family Intelligence Platform.\n\nFamily Context: {context}\n\nUser Query: {prompt}"
        response = await model.generate_content_async(full_prompt)
        return response.text
    except Exception as e:
        print(f"Error generating chat response: {e}")
        return f"Error connecting to AI: {str(e)}"

async def extract_structured_data_from_image(content: bytes, mime_type: str, prompt: str) -> str:
    """Send image content and a prompt to Gemini 1.5 Flash to extract structured JSON data."""
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API key is not configured.")
        
        # Prepare the image part using dict syntax supported by google-generativeai
        image_part = {
            "mime_type": mime_type,
            "data": content
        }
        
        # Request JSON output specifically
        full_prompt = f"{prompt}\nReturn the result strictly as a valid JSON object. Do not include markdown code block formatting (like ```json) in your response, just the raw JSON string."
        
        response = await model.generate_content_async([image_part, full_prompt])
        return response.text.strip()
    except Exception as e:
        print(f"Error during Gemini structured data extraction: {e}")
        raise e
