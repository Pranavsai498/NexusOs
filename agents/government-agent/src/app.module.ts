import { Module, McpApp } from '@nitrostack/core';
import { GovernmentController } from './government.controller';
import { GovernmentService } from './government.service';

@Module({
  name: 'AppModule',
  providers: [GovernmentController, GovernmentService],
  exports: [GovernmentService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}