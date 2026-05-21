import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
