import { Module, McpApp } from '@nitrostack/core';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';

@Module({
  name: 'AppModule',
  providers: [EmergencyController, EmergencyService],
  exports: [EmergencyService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}