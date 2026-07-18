import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { PlanningService } from './planning.service';

@Controller('planning')
export class PlanningController {
  constructor(private service: PlanningService) {}

  @Tool({
    name: 'execute_planning_action',
    description: 'Execute an action for the planning agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}