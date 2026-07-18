import { ControllerDecorator as Controller, ToolDecorator as Tool } from '@nitrostack/core';
import { z } from 'zod';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Tool({
    name: 'execute_notification_action',
    description: 'Execute an action for the notification agent',
    inputSchema: z.object({ input: z.string() })
  })
  async executeAction(input: { input: string }) {
    const result = await this.service.processAction(input.input);
    return { result };
  }
}