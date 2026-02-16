'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a quirky, inspiring, or unexpected daily suggestion or challenge.
 *
 * - aiDailySpark - A function that generates a daily spark.
 * - AiDailySparkInput - The input type for the aiDailySpark function.
 * - AiDailySparkOutput - The return type for the aiDailySpark function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

Example suggestions:
- "Wear mismatched socks today and see if anyone notices!"
- "Find something beautiful in the most unexpected place."
- "Send a 'just because' message to an old friend."
- "Try to speak only in rhymes for the next hour."
- "Draw a monster on a sticky note and hide it for someone to find."
- "Take a five-minute dance break to your favorite song, right now!"

Now, generate a unique daily spark for the user.`,
});

const aiDailySparkFlow = ai.defineFlow(
  {
    name: 'aiDailySparkFlow',
    inputSchema: AiDailySparkInputSchema,
    outputSchema: AiDailySparkOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
