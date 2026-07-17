import openai
from app.core.config import settings

# Configure the OpenAI client
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_embedding(text: str) -> list[float]:
    """Generate OpenAI embedding for a given text."""
    try:
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "":
            # Mock embedding for testing without API key
            return [0.0] * 1536
        
        response = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.0] * 1536

def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    """Simple chunking strategy by fixed character size."""
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Mock OCR extraction logic for the hackathon."""
    return f"Extracted mock content for {filename}. This document contains sensitive family information."
