'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a quirky, inspiring, or unexpected daily suggestion or challenge.
 * Includes a robust fallback mechanism for environments where the AI API might be unavailable.
 *
 * - aiDailySpark - A function that generates a daily spark.
 * - AiDailySparkInput - The input type for the aiDailySpark function.
 * - AiDailySparkOutput - The return type for the aiDailySpark function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_SPARKS = [
  "Wear mismatched socks today and see if anyone notices!",
  "Find something beautiful in the most unexpected place.",
  "Send a 'just because' message to an old friend.",
  "Try to speak only in rhymes for the next hour.",
  "Draw a monster on a sticky note and hide it for someone to find.",
  "Take a five-minute dance break to your favorite song, right now!",
  "Compliment a stranger on something other than their appearance.",
  "Eat dessert for breakfast—you're a grown-up dynamo!",
  "Narrate your chores today like you're an epic fantasy hero.",
  "Spend 10 minutes cloud-watching and name the shapes you see."
];

const AiDailySparkInputSchema = z
  .object({
    context: z
      .string()
      .optional()
      .describe(
        'Optional context about the user\'s day, mood, or current tasks to help tailor the suggestion.'
      ),
  })
  .optional();
export type AiDailySparkInput = z.infer<typeof AiDailySparkInputSchema>;

const AiDailySparkOutputSchema = z
  .object({
    suggestion: z
      .string()
      .describe('A quirky, inspiring, or unexpected suggestion or challenge for the day.'),
    isFallback: z.boolean().optional().describe('Whether a fallback suggestion was used.'),
  })
  .describe('The generated daily spark suggestion.');
export type AiDailySparkOutput = z.infer<typeof AiDailySparkOutputSchema>;

export async function aiDailySpark(
  input: AiDailySparkInput = {}
): Promise<AiDailySparkOutput> {
  return aiDailySparkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDailySparkPrompt',
  input: { schema: AiDailySparkInputSchema },
  output: { schema: AiDailySparkOutputSchema },
  prompt: `You are a creative and whimsical AI assistant, designed to add fun and spontaneity to a user's day.
Your goal is to generate a single, quirky, inspiring, or unexpected suggestion or challenge.
The suggestion should be short, engaging, and encourage the user to try something new or look at their day differently.

If provided, use the following context to make the suggestion more relevant, but always keep it lighthearted and positive:

Context: {{{context}}}

Now, generate a unique daily spark for the user.`,
});

const aiDailySparkFlow = ai.defineFlow(
  {
    name: 'aiDailySparkFlow',
    inputSchema: AiDailySparkInputSchema,
    outputSchema: AiDailySparkOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output || !output.suggestion) {
         throw new Error('Empty suggestion returned from AI');
      }
      return {
        ...output,
        isFallback: false
      };
    } catch (error) {
      console.warn('AI Daily Spark generation failed, using whimsical fallback:', error);
      const randomFallback = FALLBACK_SPARKS[Math.floor(Math.random() * FALLBACK_SPARKS.length)];
      return {
        suggestion: randomFallback,
        isFallback: true,
      };
    }
  }
);
