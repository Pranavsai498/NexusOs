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

// 1. Patch main.ts for all agents to register OAUTH_CONFIG
agents.forEach(agent => {
  const mainTsPath = path.join(agentsDir, agent, 'src', 'main.ts');
  if (fs.existsSync(mainTsPath)) {
    let content = fs.readFileSync(mainTsPath, 'utf8');
    
    // Check if DIContainer is already imported/used
    if (!content.includes('OAUTH_CONFIG')) {
      // Modify import to include DIContainer
      content = content.replace(
        "import { McpApplicationFactory } from '@nitrostack/core';",
        "import { McpApplicationFactory, DIContainer } from '@nitrostack/core';"
      );
      
      // Inject DIContainer registration code
      const patch = `
// Register fallback OAUTH_CONFIG to prevent NitroStack DI container from crashing
try {
  DIContainer.getInstance().registerValue('OAUTH_CONFIG', {
    resourceUri: 'http://localhost:3000',
    authorizationServers: ['http://localhost:8000'],
    required: false
  });
} catch (e) {}
`;
      
      content = content.replace("async function bootstrap()", patch + "\nasync function bootstrap()");
      fs.writeFileSync(mainTsPath, content, 'utf8');
      console.log(`[${agent}] Patched main.ts successfully.`);
    }
  }
});

// 2. Fix life-brain.service.ts compilation error (OpenAI unused import/constructor)
const lifeBrainServicePath = path.join(agentsDir, 'life-brain', 'src', 'life-brain.service.ts');
if (fs.existsSync(lifeBrainServicePath)) {
  let content = fs.readFileSync(lifeBrainServicePath, 'utf8');
  
  // Remove import OpenAI
  content = content.replace("import OpenAI from 'openai';", "");
  
  // Remove private openai field
  content = content.replace("private openai: OpenAI;", "");
  
  // Remove constructor initialization
  content = content.replace(
    /constructor\(\)\s*\{[\s\S]*?this\.openai\s*=\s*new\s*OpenAI\([\s\S]*?\}\);?\s*\}/g,
    "constructor() {}"
  );
  
  fs.writeFileSync(lifeBrainServicePath, content, 'utf8');
  console.log('[life-brain] Patched life-brain.service.ts successfully.');
}
