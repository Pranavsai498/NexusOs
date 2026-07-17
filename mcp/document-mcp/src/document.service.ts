import { Injectable } from '@nitrostack/core';

@Injectable()
export class DocumentService {
  async processOCR(fileId: string): Promise<string> {
    // In a full integration, this would hit the backend's /upload or processing queue.
    return `Extracted text for document ${fileId} from NexusOS Vault.`;
  }

  async searchDocuments(query: string): Promise<any[]> {
    try {
      // Make a call to the FastAPI Backend RAG API
      const response = await fetch(`http://localhost:8000/api/v1/documents/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Backend returned status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to query Document RAG API:", error);
      return [];
    }
  }

  async categorizeDocument(text: string): Promise<string> {
    if (text.toLowerCase().includes('tax')) return 'Finance';
    if (text.toLowerCase().includes('birth')) return 'Identity';
    return 'General';
  }
}
