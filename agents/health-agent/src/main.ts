import { McpApplicationFactory, DIContainer } from '@nitrostack/core';
import { Application } from './app.module';


// Register fallback OAUTH_CONFIG to prevent NitroStack DI container from crashing
try {
  DIContainer.getInstance().registerValue('OAUTH_CONFIG', {
    resourceUri: 'http://localhost:3000',
    authorizationServers: ['http://localhost:8000'],
    required: false
  });
} catch (e) {}

async function bootstrap() {
  const app = await McpApplicationFactory.create(Application);
  if (typeof app.start === 'function') {
    await app.start();
  }
  console.log('Health MCP Server is running!');
}

bootstrap().catch(console.error);