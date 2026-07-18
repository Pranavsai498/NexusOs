import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private service: EmergencyService) {}

  @Tool({
    name: 'execute_emergency_action',
    description: 'Execute an action for the emergency agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}