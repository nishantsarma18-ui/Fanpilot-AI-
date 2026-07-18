import { GoogleGenAI } from '@google/genai';
import { apiKey } from './config.js';

export const ai = new GoogleGenAI({
  apiKey: apiKey || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export { Type } from '@google/genai';
