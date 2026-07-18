import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private service: FinanceService) {}

  @Tool({
    name: 'execute_finance_action',
    description: 'Execute an action for the finance agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}