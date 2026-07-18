import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { LifeBrainService } from './lifeBrain.service';

@Controller('lifeBrain')
export class LifeBrainController {
  constructor(private service: LifeBrainService) {}

  @Tool({
    name: 'execute_lifeBrain_action',
    description: 'Execute an action for the lifeBrain agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}