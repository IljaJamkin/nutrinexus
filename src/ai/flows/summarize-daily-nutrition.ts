'use server';

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
  try {
    const logsText = input.foodLogs.map(log => 
      `- ${log.foodName}: ${log.calories} kcal, ${log.protein}g Protein, ${log.carbs}g Carbs, ${log.fats}g Fats`
    ).join('\n');

    const promptText = `You are an expert nutritionist. Analyze these food logs against the user's goals for ${input.currentDate}.
    
    User's Goals:
    - Calories: ${input.userProfile.targetCalories} kcal
    - Protein: ${input.userProfile.targetProtein} g
    - Carbs: ${input.userProfile.targetCarbs} g
    - Fats: ${input.userProfile.targetFats} g

    Daily Logs:
    ${logsText}

    Respond ONLY with a valid JSON object matching this exact structure:
    {
      "summary": "A brief 3-sentence summary of how they are tracking against goals."
    }
    Do not include markdown blocks.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [{ role: "user", content: promptText }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResult = data.choices[0].message.content;
    
    const cleanJson = aiResult.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson) as SummarizeDailyNutritionOutput;

  } catch (error: any) {
    console.error("Summary Error:", error);
    throw new Error(`Summary Generation Failed: ${error.message}`);
  }
}