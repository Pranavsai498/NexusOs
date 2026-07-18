import { Module, McpApp } from '@nitrostack/core';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';

@Module({
  name: 'AppModule',
  providers: [PlanningController, PlanningService],
  exports: [PlanningService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}