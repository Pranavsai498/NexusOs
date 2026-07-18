import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { KnowledgegraphService } from './knowledgegraph.service';

@Controller('knowledgegraph')
export class KnowledgegraphController {
  constructor(private service: KnowledgegraphService) {}

  @Tool({
    name: 'execute_knowledgegraph_action',
    description: 'Execute an action for the knowledgegraph agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}