import { ControllerDecorator as Controller, Tool, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Tool({
    name: 'extract_text',
    description: 'Perform OCR extraction on a document by file ID',
    inputSchema: z.object({
      fileId: z.string().describe('The ID of the uploaded document')
    })
  })
  async extractText(input: { fileId: string }, ctx: ExecutionContext) {
    const text = await this.documentService.processOCR(input.fileId);
    return { extractedText: text };
  }

  @Tool({
    name: 'search_documents',
    description: 'Search the digital vault for documents',
    inputSchema: z.object({
      query: z.string().describe('Search query')
    })
  })
  async searchDocuments(input: { query: string }, ctx: ExecutionContext) {
    const results = await this.documentService.searchDocuments(input.query);
    return { results };
  }
}
