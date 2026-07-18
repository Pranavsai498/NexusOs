import { Injectable } from '@nitrostack/core';


@Injectable()
export class LifeBrainService {
  
  private conversationMemory: Record<string, any[]> = {};

  constructor() {}

  async processUserRequest(message: string, userId: string): Promise<string> {
    if (!this.conversationMemory[userId]) {
      this.conversationMemory[userId] = [
        { role: 'system', content: 'You are the Life Brain Master Agent for NexusOS. Your job is to analyze the user request and route it to the correct MCP server. Options: Document, Government, Finance, Health, Planning, Knowledge Graph. Output ONLY the name of the MCP server, or "General" if you can handle it directly.' }
      ];
    }

    this.conversationMemory[userId].push({ role: 'user', content: message });

    try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key') {
        const { GoogleGenerativeAI } = require('@google/generativeai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
        
        const historyText = this.conversationMemory[userId].map(m => `${m.role}: ${m.content}`).join('\n');
        const result = await model.generateContent(historyText);
        const response = await result.response;
        const intent = response.text().trim() || 'General';
        
        this.conversationMemory[userId].push({ role: 'assistant', content: intent });
        
        return this.executeMcpAction(intent, message);
      } else {
        const msg = message.toLowerCase();
        let intent = 'General';
        if (msg.includes('document') || msg.includes('vault') || msg.includes('tax')) intent = 'Document';
        else if (msg.includes('health') || msg.includes('doctor') || msg.includes('medical')) intent = 'Health';
        else if (msg.includes('finance') || msg.includes('budget') || msg.includes('money')) intent = 'Finance';
        else if (msg.includes('government') || msg.includes('scheme') || msg.includes('law')) intent = 'Government';
        else if (msg.includes('plan') || msg.includes('goal')) intent = 'Planning';
        else if (msg.includes('graph') || msg.includes('network')) intent = 'Knowledge Graph';
        
        return this.executeMcpAction(intent, message);
      }
    } catch (error) {
      console.error("Gemini Orchestration error:", error);
      return "Life Brain encountered an error orchestrating your request.";
    }
  }

  private executeMcpAction(intent: string, message: string): string {
    return `[Routed to ${intent} MCP]: Forwarding context -> "${message}"`;
  }
}
