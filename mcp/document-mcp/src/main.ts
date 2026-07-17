import { McpApp } from '@nitrostack/core';
import { AppModule } from './app.module';

@McpApp({
  module: AppModule,
  server: {
    name: 'document-mcp',
    version: '1.0.0',
  },
})
class DocumentMcpApp {}
