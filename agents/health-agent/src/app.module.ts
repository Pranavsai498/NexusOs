import { Module, McpApp } from '@nitrostack/core';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  name: 'AppModule',
  providers: [HealthController, HealthService],
  exports: [HealthService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}