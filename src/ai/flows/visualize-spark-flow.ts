
'use server';
/**
 * @fileOverview A flow to visualize a daily spark using AI image generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VisualizeSparkInputSchema = z.object({
  sparkContent: z.string().describe('The content of the daily spark to visualize.'),
});
export type VisualizeSparkInput = z.infer<typeof VisualizeSparkInputSchema>;

const VisualizeSparkOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type VisualizeSparkOutput = z.infer<typeof VisualizeSparkOutputSchema>;

export async function visualizeSpark(input: VisualizeSparkInput): Promise<VisualizeSparkOutput> {
  return visualizeSparkFlow(input);
}

const visualizeSparkFlow = ai.defineFlow(
  {
    name: 'visualizeSparkFlow',
    inputSchema: VisualizeSparkInputSchema,
    outputSchema: VisualizeSparkOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A vibrant, whimsical, and highly artistic digital illustration representing the following daily challenge: "${input.sparkContent}". The style should be dreamlike, colorful, and inspiring, suitable for a productivity and joy-focused day planner app.`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate image media.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
