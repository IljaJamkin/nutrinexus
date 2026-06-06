
'use server';
/**
 * @fileOverview Daily nutrition summary AI flow.
 *
 * - summarizeDailyNutrition - A function that generates a textual summary of daily intake.
 * - SummarizeDailyNutritionInput - Input schema for the flow.
 * - SummarizeDailyNutritionOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeDailyNutritionInputSchema = z.object({
  foodLogs: z.array(z.object({
    foodName: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
  })).describe('The list of food items logged for the day.'),
  userProfile: z.object({
    targetCalories: z.number(),
    targetProtein: z.number(),
    targetCarbs: z.number(),
    targetFats: z.number(),
  }).describe('The user\'s target nutrition goals.'),
  currentDate: z.string().describe('The current date.'),
});

const SummarizeDailyNutritionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the daily nutritional intake.'),
});

export type SummarizeDailyNutritionInput = z.infer<typeof SummarizeDailyNutritionInputSchema>;
export type SummarizeDailyNutritionOutput = z.infer<typeof SummarizeDailyNutritionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeDailyNutritionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SummarizeDailyNutritionInputSchema },
  output: { schema: SummarizeDailyNutritionOutputSchema },
  prompt: `You are an expert nutritionist providing a daily summary. Analyze the following food logs against the user's goals for {{currentDate}}.
  
  User's Goals:
  - Calories: {{userProfile.targetCalories}} kcal
  - Protein: {{userProfile.targetProtein}} g
  - Carbs: {{userProfile.targetCarbs}} g
  - Fats: {{userProfile.targetFats}} g

  Daily Logs:
  {{#each foodLogs}}
  - {{foodName}}: {{calories}} kcal, {{protein}}g Protein, {{carbs}}g Carbs, {{fats}}g Fats
  {{/each}}

  Provide a concise, motivating summary (3-5 sentences) highlighting how they are tracking against their goals.`,
});

export async function summarizeDailyNutrition(
  input: SummarizeDailyNutritionInput
): Promise<SummarizeDailyNutritionOutput> {
  return summarizeDailyNutritionFlow(input);
}

const summarizeDailyNutritionFlow = ai.defineFlow(
  {
    name: 'summarizeDailyNutritionFlow',
    inputSchema: SummarizeDailyNutritionInputSchema,
    outputSchema: SummarizeDailyNutritionOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error("AI failed to generate a summary.");
      }
      return output;
    } catch (error: any) {
      console.error("Genkit Summary Error:", error);
      throw new Error(`Summary Generation Failed: ${error.message}`);
    }
  }
);
