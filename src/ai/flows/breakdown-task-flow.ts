
'use server';
/**
 * @fileOverview This file defines a Genkit flow for breaking down a task into quirky, actionable sub-steps.
 *
 * - breakdownTask - A function that breaks down a task.
 * - BreakdownTaskInput - The input type.
 * - BreakdownTaskOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task to break down.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
  steps: z.array(z.string()).describe('Three quirky, actionable steps to complete the task.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: { schema: BreakdownTaskInputSchema },
  output: { schema: BreakdownTaskOutputSchema },
  prompt: `You are a Productivity Wizard with a sense of humor. 
Take the task "{{{taskTitle}}}" and break it down into exactly 3 quirky but actually helpful sub-steps. 
Make them sound encouraging and slightly whimsical.

Example:
Task: "Write a report"
Steps:
1. "Gather your scrolls and brew a potion of focused caffeine."
2. "Dictate the first paragraph to an invisible audience of scholars."
3. "Brave the final conclusion and reward yourself with a celebratory dance."

Break down this task now:`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
