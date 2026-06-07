
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EstimateFoodMacrosInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('A textual description of the food item.'),
});

const EstimateFoodMacrosOutputSchema = z.object({
  calories: z.number().describe('Estimated total calories in kcal.'),
  protein: z.number().describe('Estimated protein content in grams.'),
  fats: z.number().describe('Estimated fat content in grams.'),
  carbohydrates: z.number().describe('Estimated carbohydrate content in grams.'),
  foodDescription: z.string().describe('A brief identification of the food item found in the photo or description.'),
  confidence: z.enum(['High', 'Medium', 'Low']).describe('The level of confidence in the estimation.'),
});

export type EstimateFoodMacrosInput = z.infer<typeof EstimateFoodMacrosInputSchema>;
export type EstimateFoodMacrosOutput = z.infer<typeof EstimateFoodMacrosOutputSchema>;

const prompt = ai.definePrompt({
  name: 'estimateFoodMacrosPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: EstimateFoodMacrosInputSchema },
  output: { schema: EstimateFoodMacrosOutputSchema },
  prompt: `You are an expert nutritionist and food analyst.
  
  Your task is to estimate the nutritional content (calories, protein, fats, and carbohydrates) of the food provided in the photo or described in text.
  
  - If a photo is provided, prioritize it for the analysis.
  - If only text is provided, base your analysis on that.
  - Provide a brief description of what you identified.
  - State your confidence level (High, Medium, or Low).
  
  {{#if description}}
  User Description: {{{description}}}
  {{/if}}
  
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}`,
});

export async function estimateFoodMacrosFromPhoto(
  input: EstimateFoodMacrosInput
): Promise<EstimateFoodMacrosOutput> {
  try {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to return nutritional data.");
    }
    return output;
  } catch (error: any) {
    console.error("AI Estimation Error:", error);
    throw new Error(`Nutrition Analysis Failed: ${error.message}`);
  }
}
