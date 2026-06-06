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
  const BACKEND_URL = "https://nutrinexusapp.vercel.app/api/estimate";
  
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Nutrition Analysis Failed");
  }

  return await response.json() as EstimateFoodMacrosOutput;
}