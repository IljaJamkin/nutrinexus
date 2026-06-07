import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6InRqsNdCTon_CzYqq88zgoxjAq_D-36ew7W3CKaXTQzg";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const foodList = input.foodLogs.length > 0 
      ? input.foodLogs.map((f: any) => `- ${f.foodName}: ${f.calories} kcal, ${f.protein}g Protein, ${f.carbs}g Carbs, ${f.fats}g Fats`).join('\n') 
      : "No food logged today.";

    const promptText = `You are an expert nutritionist providing a daily summary. Analyze these logs against the goals for ${input.currentDate}.
    User's Goals:
    - Calories: ${input.userProfile.targetCalories} kcal
    - Protein: ${input.userProfile.targetProtein} g
    Provide a concise summary (3-5 sentences). Return ONLY the summary text.`;

    const result = await model.generateContent(promptText);
    return NextResponse.json({ summary: result.response.text().trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}