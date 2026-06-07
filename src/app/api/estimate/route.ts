import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// This is the permission slip that allows your mobile app to connect
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// This handles the automatic pre-check your phone sends before uploading the photo
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6InRqsNdCTon_CzYqq88zgoxjAq_D-36ew7W3CKaXTQzg";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    let promptText = "You are an expert nutritionist. Estimate calories (kcal), protein (g), fats (g), and carbohydrates (g) for this food. Provide a textual 'foodDescription' and a 'confidence' level (High, Medium, Low). Return ONLY a valid JSON object with keys: calories, protein, fats, carbohydrates, foodDescription, confidence.";

    if (input.description) {
      promptText += `\n\nDescription: ${input.description}`;
    }

    const promptContent: any[] = [promptText];

    if (input.photoDataUri) {
      const base64Data = input.photoDataUri.split(",")[1];
      const mimeType = input.photoDataUri.split(";")[0].split(":")[1] || "image/jpeg";
      promptContent.push({
        inlineData: { data: base64Data, mimeType: mimeType },
      });
    }

    const result = await model.generateContent(promptContent);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson), { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}