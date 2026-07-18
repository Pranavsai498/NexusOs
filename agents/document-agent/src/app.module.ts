import { Module, McpApp } from '@nitrostack/core';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  name: 'AppModule',
  providers: [DocumentController, DocumentService],
  exports: [DocumentService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}