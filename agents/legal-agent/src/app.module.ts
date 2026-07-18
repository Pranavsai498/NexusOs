import { Module, McpApp } from '@nitrostack/core';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';

@Module({
  name: 'AppModule',
  providers: [LegalController, LegalService],
  exports: [LegalService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}