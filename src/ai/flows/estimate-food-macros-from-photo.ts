'use server';

export type EstimateFoodMacrosInput = {
  photoDataUri?: string;
  description?: string;
};

export type EstimateFoodMacrosOutput = {
  calories: number;
  protein: number;
  fats: number;
  carbohydrates: number;
  foodDescription: string;
  confidence: 'High' | 'Medium' | 'Low';
};

export async function estimateFoodMacrosFromPhoto(
  input: EstimateFoodMacrosInput
): Promise<EstimateFoodMacrosOutput> {
  try {
    const content: any[] = [];
    
    const promptText = `You are an expert nutritionist. Estimate the nutritional content of the provided food.
    Respond ONLY with a valid JSON object matching this exact structure:
    {
      "calories": number (estimated kcal),
      "protein": number (grams),
      "fats": number (grams),
      "carbohydrates": number (grams),
      "foodDescription": string (brief identification),
      "confidence": "High" | "Medium" | "Low"
    }
    Do not include markdown blocks like \`\`\`json. Just the raw JSON object.`;

    content.push({ type: "text", text: promptText });

    if (input.description) {
      content.push({ type: "text", text: `User Description: ${input.description}` });
    }
    
    if (input.photoDataUri) {
      content.push({ type: "image_url", image_url: { url: input.photoDataUri } });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        messages: [{ role: "user", content: content }]
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const aiResult = data.choices[0].message.content;
    
    // Clean markdown if the AI accidentally includes it
    const cleanJson = aiResult.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson) as EstimateFoodMacrosOutput;

  } catch (error: any) {
    console.error("AI Estimation Error:", error);
    throw new Error(`Nutrition Analysis Failed: ${error.message}`);
  }
}