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
  const BACKEND_URL = "https://nutrinexusapp.vercel.app/api/summarize";

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Summary Generation Failed");
  }

  return await response.json() as SummarizeDailyNutritionOutput;
}