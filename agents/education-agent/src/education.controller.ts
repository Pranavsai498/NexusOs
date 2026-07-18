import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { EducationService } from './education.service';

@Controller('education')
export class EducationController {
  constructor(private service: EducationService) {}

  @Tool({
    name: 'execute_education_action',
    description: 'Execute an action for the education agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}