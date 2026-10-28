'use server';

import { headers } from 'next/headers';

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

// Basic abuse protection: each visitor (IP address) gets a limited number of scans per hour.
// This memory resets when Vercel restarts the server, so the real safety net
// is the credit limit on the OpenRouter key.
const SCANS_PER_HOUR = 20;
const ONE_HOUR = 60 * 60 * 1000;
const MAX_DESCRIPTION_LENGTH = 500;
const scanHistory = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (scanHistory.size > 10000) scanHistory.clear();

  const recent = (scanHistory.get(ip) ?? []).filter(time => now - time < ONE_HOUR);
  const limited = recent.length >= SCANS_PER_HOUR;
  if (!limited) recent.push(now);
  scanHistory.set(ip, recent);
  return limited;
}

export async function estimateFoodMacrosFromPhoto(
  input: EstimateFoodMacrosInput
): Promise<EstimateFoodMacrosOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("AI Estimation Error: OPENROUTER_API_KEY is not set");
    throw new Error("Nutrition Analysis Failed: the server is not configured.");
  }

  const photo = input?.photoDataUri;
  const description = input?.description?.trim();

  if (!photo && !description) {
    throw new Error("Nutrition Analysis Failed: add a photo or a description.");
  }
  if (photo && (typeof photo !== "string" || !/^data:image\/[a-z0-9.+-]+;base64,/i.test(photo))) {
    throw new Error("Nutrition Analysis Failed: the photo is not a valid image.");
  }
  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Nutrition Analysis Failed: keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`);
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    throw new Error("Nutrition Analysis Failed: too many scans. Please try again later.");
  }

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

    if (description) {
      content.push({ type: "text", text: `User Description: ${description}` });
    }

    if (photo) {
      content.push({ type: "image_url", image_url: { url: photo } });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [{ role: "user", content: content }],
        // The answer is a small JSON object, so cap the length (and the cost) of each reply
        max_tokens: 400
      })
    });

    if (!response.ok) {
      // Log the details for yourself, but don't send provider error details to the browser
      console.error("AI Estimation Error:", response.status, await response.text());
      throw new Error(`AI service returned status ${response.status}`);
    }

    const data = await response.json();
    const aiResult = data.choices[0].message.content;

    // Clean markdown if the AI accidentally includes it
    const cleanJson = aiResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const result: EstimateFoodMacrosOutput = {
      calories: Number(parsed.calories),
      protein: Number(parsed.protein),
      fats: Number(parsed.fats),
      carbohydrates: Number(parsed.carbohydrates),
      foodDescription: String(parsed.foodDescription ?? "Unknown food"),
      confidence: ["High", "Medium", "Low"].includes(parsed.confidence) ? parsed.confidence : "Low"
    };

    const numbers = [result.calories, result.protein, result.fats, result.carbohydrates];
    if (numbers.some(value => !Number.isFinite(value) || value < 0)) {
      throw new Error("AI returned invalid numbers");
    }

    return result;

  } catch (error: any) {
    console.error("AI Estimation Error:", error);
    throw new Error("Nutrition Analysis Failed: please try again.");
  }
}
