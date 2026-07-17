from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.api.deps import get_db
from app.services import ai_service
from app.db.models import Document, DocumentChunk

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Any:
    """
    Upload a document, perform OCR, chunk the text, and generate embeddings.
    """
    # 1. Read file and extract text (Mock OCR)
    content = await file.read()
    extracted_text = ai_service.extract_text_from_file(content, file.filename)
    
    # 2. Save Document to DB
    new_doc = Document(filename=file.filename, content=extracted_text, category="General")
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # 3. Chunk text & generate embeddings
    chunks = ai_service.chunk_text(extracted_text)
    for text_chunk in chunks:
        embedding = ai_service.generate_embedding(text_chunk)
        db_chunk = DocumentChunk(document_id=new_doc.id, text_content=text_chunk, embedding=embedding)
        db.add(db_chunk)
    
    db.commit()

    # Document Agent: Categorization, Duplicate Detection, Verification, Expiry
    # Mock logic for hackathon purposes
    category = "Finance" if "tax" in extracted_text.lower() else "Identity"
    is_duplicate = False # Mock checking DB for similar vector match
    is_verified = True
    expiry_date = "2027-04-15" if category == "Finance" else None

    # Update document category
    new_doc.category = category
    db.commit()

    return {
        "id": new_doc.id,
        "filename": new_doc.filename,
        "message": "Document processed and stored in vector database.",
        "chunks_processed": len(chunks),
        "agent_analysis": {
            "category": category,
            "is_duplicate": is_duplicate,
            "is_verified": is_verified,
            "expiry_date": expiry_date
        }
    }

@router.get("/search")
def search_documents(query: str, db: Session = Depends(get_db)) -> Any:
    """
    Semantic search across documents using pgvector.
    """
    # Generate embedding for the query
    query_embedding = ai_service.generate_embedding(query)
    
    # Perform cosine similarity search (pgvector <-> operator)
    results = db.query(DocumentChunk).order_by(
        DocumentChunk.embedding.cosine_distance(query_embedding)
    ).limit(3).all()
    
    formatted_results = []
    for r in results:
        formatted_results.append({
            "document_id": r.document_id,
            "filename": r.document.filename,
            "snippet": r.text_content
        })
        
    return {"query": query, "results": formatted_results}

