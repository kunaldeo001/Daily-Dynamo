
'use server';
/**
 * @fileOverview A flow to generate a whimsical "Daily Wrap-up" summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyWrapUpInputSchema = z.object({
  completedTasks: z.array(z.string()).describe('List of task titles completed today.'),
  reflectionNote: z.string().optional().describe('The user\'s daily reflection note.'),
});
export type DailyWrapUpInput = z.infer<typeof DailyWrapUpInputSchema>;

const DailyWrapUpOutputSchema = z.object({
  summary: z.string().describe('A whimsical and encouraging wrap-up of the day\'s achievements.'),
  title: z.string().describe('A quirky title for today\'s adventure.'),
});
export type DailyWrapUpOutput = z.infer<typeof DailyWrapUpOutputSchema>;

export async function dailyWrapUp(input: DailyWrapUpInput): Promise<DailyWrapUpOutput> {
  return dailyWrapUpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyWrapUpPrompt',
  input: { schema: DailyWrapUpInputSchema },
  output: { schema: DailyWrapUpOutputSchema },
  prompt: `You are the Chronicler of the Dynamo, a wise and slightly eccentric archivist of daily adventures.
Summarize the user's day based on their completed tasks and reflections. 

Tasks Completed:
{{#each completedTasks}}
- {{{this}}}
{{/each}}

User Reflection: {{{reflectionNote}}}

Write a whimsical, encouraging, and highly creative "Dynamo Wrap-up". Use metaphors of magic, steampunk technology, or epic quests. Give the day a quirky title. Keep it to about 3-4 sentences.`,
});

const dailyWrapUpFlow = ai.defineFlow(
  {
    name: 'dailyWrapUpFlow',
    inputSchema: DailyWrapUpInputSchema,
    outputSchema: DailyWrapUpOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.warn('Daily Wrap-up generation failed:', error);
      return {
        title: "The Unfinished Symphony",
        summary: "The gears of the day have turned, and while the chronicler's ink ran dry, your efforts have left a mark on the tapestry of time. Rest well, Dynamo!",
      };
    }
  }
);
