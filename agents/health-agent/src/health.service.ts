import { Injectable } from '@nitrostack/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class HealthService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async processAction(input: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return "Please set GEMINI_API_KEY in the .env file to use this agent.";
      }
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
      const systemPrompt = "You are a Health and Wellness AI. Analyze medical history or health queries to suggest preventive care, summarize records, or suggest checkups.\n\nUser Query/Data: " + input;
      
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      return `Failed to process action: ${error.message}`;
    }
  }
}
