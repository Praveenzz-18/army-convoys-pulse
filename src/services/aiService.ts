import { model } from "../lib/gemini";

export interface RouteRecommendation {
  route: string;
  distance: string;
  estimatedTime: string;
  safetyScore: number;
  hazards: string[];
  recommendation: string;
}

export const getRouteRecommendation = async (origin: string, destination: string): Promise<RouteRecommendation> => {
  const prompt = `As a military logistics AI, recommend the best route for an army convoy from ${origin} to ${destination}. 
  Provide the response in JSON format with the following fields:
  - route: string (concise description of the path)
  - distance: string (estimated distance in km)
  - estimatedTime: string (estimated duration)
  - safetyScore: number (1-100 scale)
  - hazards: string[] (potential risks like terrain or traffic)
  - recommendation: string (brief tactical advice)
  
  Respond ONLY with the JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (sometimes Gemini adds markdown block)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as RouteRecommendation;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to get AI recommendation");
  }
};
