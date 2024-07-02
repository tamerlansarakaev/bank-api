import { GoogleGenerativeAI } from '@google/generative-ai';
import { IProfile } from 'src/client/services/user.service';
import { modelInstruction } from './insturction';

export class ChatSession {
  private chatSession: any;

  constructor(private user: IProfile) {}

  async initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: modelInstruction,
    });

    if (!this.user) return;
    this.chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [
            {
              text: `This object: ${JSON.stringify(this.user)}, And your name is Bank AI Assistant`,
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'Okey i remember it' }],
        },
      ],
    });

    return this.chatSession;
  }

  async sendMessage(message: string) {
    const result = await this.chatSession.sendMessage(message);
    return result.response.text();
  }
}
