import { Module, McpApp } from '@nitrostack/core';
import { KnowledgegraphController } from './knowledgegraph.controller';
import { KnowledgegraphService } from './knowledgegraph.service';

@Module({
  name: 'AppModule',
  providers: [KnowledgegraphController, KnowledgegraphService],
  exports: [KnowledgegraphService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}