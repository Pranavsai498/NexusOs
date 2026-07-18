const fs = require('fs');
const path = require('path');

const agents = [
  'document-agent',
  'government-agent',
  'finance-agent',
  'health-agent',
  'education-agent',
  'legal-agent',
  'planning-agent',
  'knowledgegraph-agent',
  'emergency-agent',
  'notification-agent',
  'life-brain'
];

const agentsDir = path.join(__dirname, 'agents');

agents.forEach(agent => {
  const agentPath = path.join(agentsDir, agent);
  const name = agent.replace('-agent', '').replace('life-brain', 'lifeBrain');
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  const appModulePath = path.join(agentPath, 'src', 'app.module.ts');
  const mainTsPath = path.join(agentPath, 'src', 'main.ts');

  const appModuleContent = `import { Module, McpApp } from '@nitrostack/core';
import { ${capitalized}Controller } from './${name}.controller';
import { ${capitalized}Service } from './${name}.service';

@Module({
  name: 'AppModule',
  providers: [${capitalized}Controller, ${capitalized}Service],
  exports: [${capitalized}Service],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}`;

  const mainTsContent = `import { McpApplicationFactory } from '@nitrostack/core';
import { Application } from './app.module';

async function bootstrap() {
  const app = await McpApplicationFactory.create(Application);
  if (typeof app.start === 'function') {
    await app.start();
  }
  console.log('${capitalized} MCP Server is running!');
}

bootstrap().catch(console.error);`;

  fs.writeFileSync(appModulePath, appModuleContent);
  fs.writeFileSync(mainTsPath, mainTsContent);
});

console.log('Fixed McpApp decorator usage!');
