import { Module, McpApp } from '@nitrostack/core';
import { LifeBrainController } from './lifeBrain.controller';
import { LifeBrainService } from './lifeBrain.service';

@Module({
  name: 'AppModule',
  providers: [LifeBrainController, LifeBrainService],
  exports: [LifeBrainService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}