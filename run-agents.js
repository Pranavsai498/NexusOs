const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'agents');
const agents = fs.readdirSync(agentsDir).filter(f => fs.statSync(path.join(agentsDir, f)).isDirectory());

console.log(`Found ${agents.length} MCP servers. Booting the NexusOS AI Fleet...`);

agents.forEach(agent => {
  const agentPath = path.join(agentsDir, agent);
  
  // First compile the agent
  console.log(`[${agent}] Compiling...`);
  const build = spawn('npx', ['tsc'], { cwd: agentPath, shell: true });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log(`[${agent}] Compilation successful. Starting MCP server...`);
      // Start the agent
      const start = spawn('node', ['dist/main.js'], { cwd: agentPath, shell: true });
      
      start.stdout.on('data', (data) => {
        console.log(`[${agent}] ${data.toString().trim()}`);
      });
      
      start.stderr.on('data', (data) => {
        console.error(`[${agent} ERROR] ${data.toString().trim()}`);
      });
      
      start.on('close', (code) => {
        console.log(`[${agent}] Exited with code ${code}`);
      });
    } else {
      console.error(`[${agent}] Failed to compile with code ${code}`);
    }
  });
});
