import { ControllerDecorator as Controller, Tool, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { LifeBrainService } from './life-brain.service';

@Controller('life_brain')
export class LifeBrainController {
  constructor(private readonly lifeBrainService: LifeBrainService) {}

  @Tool({
    name: 'handle_user_message',
    description: 'Process a message from the user and decide the next steps across all MCP servers.',
    inputSchema: z.object({
      message: z.string().describe('User message'),
      userId: z.string().describe('User ID')
    })
  })
  async handleUserMessage(input: { message: string; userId: string }, ctx: ExecutionContext) {
    const response = await this.lifeBrainService.processUserRequest(input.message, input.userId);
    return { response };
  }
}
