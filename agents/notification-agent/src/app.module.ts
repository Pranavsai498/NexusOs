import { Module, McpApp } from '@nitrostack/core';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  name: 'AppModule',
  providers: [NotificationController, NotificationService],
  exports: [NotificationService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}