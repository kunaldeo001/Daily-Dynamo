import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization. 
 * We use the googleAI plugin. It will automatically look for GOOGLE_GENAI_API_KEY 
 * in the environment. We've added defensive checks in the flows to handle 
 * cases where this might be missing.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
