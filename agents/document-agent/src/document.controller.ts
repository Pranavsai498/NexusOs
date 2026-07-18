import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private service: DocumentService) {}

  @Tool({
    name: 'execute_document_action',
    description: 'Execute an action for the document agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}