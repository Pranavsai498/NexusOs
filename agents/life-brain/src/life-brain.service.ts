import { Injectable } from '@nitrostack/core';
import OpenAI from 'openai';

@Injectable()
export class LifeBrainService {
  private openai: OpenAI;
  private conversationMemory: Record<string, any[]> = {};

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  async processUserRequest(message: string, userId: string): Promise<string> {
    // 1. Initialize memory for user if it doesn't exist
    if (!this.conversationMemory[userId]) {
      this.conversationMemory[userId] = [
        { role: 'system', content: 'You are the Life Brain Master Agent for NexusOS. Your job is to analyze the user request and route it to the correct MCP server: Document, Government, Finance, Health, Education, Legal, or Planning. Output ONLY the name of the MCP server, or "General" if you can handle it directly.' }
      ];
    }

    // 2. Add user message to memory
    this.conversationMemory[userId].push({ role: 'user', content: message });

    try {
      // 3. Ask OpenAI for orchestration intent (mock handling if no real key)
      if (process.env.OPENAI_API_KEY) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: this.conversationMemory[userId],
          max_tokens: 50,
          temperature: 0,
        });
        
        const intent = response.choices[0].message.content?.trim() || 'General';
        
        // 4. Update memory with assistant response
        this.conversationMemory[userId].push({ role: 'assistant', content: intent });
        
        return this.executeMcpAction(intent, message);
      } else {
        // Fallback mock logic for hackathon if API key is missing
        const intent = message.toLowerCase().includes('document') || message.toLowerCase().includes('vault') ? 'Document MCP' : 'General';
        return this.executeMcpAction(intent, message);
      }
    } catch (error) {
      console.error("OpenAI Orchestration error:", error);
      return "Life Brain encountered an error orchestrating your request.";
    }
  }

  private executeMcpAction(intent: string, message: string): string {
    if (intent.includes('Document')) {
      return `[Routed to Document MCP]: Searching your digital vault for documents related to: "${message}"`;
    }
    if (intent.includes('Government')) {
      return `[Routed to Government MCP]: Checking government schemes and eligibility.`;
    }
    if (intent.includes('Finance')) {
      return `[Routed to Finance MCP]: Analyzing your budget and financial goals.`;
    }
    return `[Handled by Life Brain]: I've updated your Knowledge Graph. How else can I help?`;
  }
}
