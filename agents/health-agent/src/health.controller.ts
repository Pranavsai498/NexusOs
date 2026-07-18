import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private service: HealthService) {}

  @Tool({
    name: 'execute_health_action',
    description: 'Execute an action for the health agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}