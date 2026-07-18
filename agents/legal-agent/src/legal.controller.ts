import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private service: LegalService) {}

  @Tool({
    name: 'execute_legal_action',
    description: 'Execute an action for the legal agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}