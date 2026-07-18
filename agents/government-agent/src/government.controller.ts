import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { GovernmentService } from './government.service';

@Controller('government')
export class GovernmentController {
  constructor(private service: GovernmentService) {}

  @Tool({
    name: 'execute_government_action',
    description: 'Execute an action for the government agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}