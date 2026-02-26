'use server';
/**
 * @fileOverview A flow to visualize a daily spark using AI image generation.
 * Includes a fallback to a whimsical placeholder if the AI generation fails (e.g., due to billing restrictions).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const VisualizeSparkInputSchema = z.object({
  sparkContent: z.string().describe('The content of the daily spark to visualize.'),
});
export type VisualizeSparkInput = z.infer<typeof VisualizeSparkInputSchema>;

const VisualizeSparkOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI or URL of the generated or fallback image.'),
  isFallback: z.boolean().optional().describe('Whether a fallback image was used.'),
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
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A vibrant, whimsical, and highly artistic digital illustration representing the following daily challenge: "${input.sparkContent}". The style should be dreamlike, colorful, and inspiring, suitable for a productivity and joy-focused day planner app.`,
      });

      if (!media || !media.url) {
        throw new Error('Failed to generate image media.');
      }

      return {
        imageUrl: media.url,
        isFallback: false,
      };
    } catch (error) {
      // If Imagen generation fails (common on free tier or projects without billing),
      // we return a high-quality whimsical placeholder from our curated list.
      console.warn('AI Image generation failed, using whimsical fallback:', error);
      
      // Use a random placeholder from our whimsical collection
      const fallback = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      
      return {
        imageUrl: fallback.imageUrl,
        isFallback: true,
      };
    }
  }
);
