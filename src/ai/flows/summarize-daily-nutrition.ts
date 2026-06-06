import { GoogleGenerativeAI } from '@google/generative-ai';

export type SummarizeDailyNutritionInput = {
  foodLogs: Array<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
  userProfile: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
  };
  currentDate: string;
};

export type SummarizeDailyNutritionOutput = {
  summary: string;
};

export async function summarizeDailyNutrition(
  input: SummarizeDailyNutritionInput
): Promise<SummarizeDailyNutritionOutput> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AQ.Ab8RN6InRqsNdCTon_CzYqq88zgoxjAq_D-36ew7W3CKaXTQzg";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Updated model version here
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const foodList = input.foodLogs.length > 0 
    ? input.foodLogs.map(f => `- ${f.foodName}: ${f.calories} kcal, ${f.protein}g Protein, ${f.carbs}g Carbs, ${f.fats}g Fats`).join('\n') 
    : "No food logged today.";

  const promptText = `You are an expert nutritionist providing a daily summary. Analyze these logs against the goals for ${input.currentDate}.

User's Goals:
- Calories: ${input.userProfile.targetCalories} kcal
- Protein: ${input.userProfile.targetProtein} g
- Carbs: ${input.userProfile.targetCarbs} g
- Fats: ${input.userProfile.targetFats} g

Today's Food Logs:
${foodList}

Provide a concise summary (3-5 sentences) highlighting how well they met goals, good choices, and gentle suggestions. Start with "Daily Nutritional Summary for ${input.currentDate}:". Return ONLY the summary text.`;

  const result = await model.generateContent(promptText);
  const responseText = result.response.text();

  return { summary: responseText.trim() };
}