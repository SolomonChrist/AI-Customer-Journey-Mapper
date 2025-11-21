import { GoogleGenAI } from "@google/genai";
import { BusinessData, Persona, AIResponseJourneyStage, AIResponseOptimization, JourneyMap } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to clean JSON if it comes wrapped in markdown
function cleanJsonString(text: string): string {
  if (!text) return "{}";
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return clean;
}

export async function generateJourneyAI(apiKey: string, business: BusinessData, persona?: Persona): Promise<AIResponseJourneyStage[]> {
  if (!apiKey) throw new Error("API Key is required. Please enter it in the settings.");
  
  const ai = new GoogleGenAI({ apiKey });

  const personaContext = persona 
    ? `Focus deeply on this specific persona: ${persona.name} (${persona.demographics}). Pain points: ${persona.painPoints}. Triggers: ${persona.buyingTriggers}.`
    : "Focus on the general ideal customer described.";

  const prompt = `
    Act as a world-class Customer Journey Map expert. 
    Analyze the following business:
    Name: ${business.name}
    Offer: ${business.offer}
    Target Audience: ${business.customer}
    Price Point: ${business.price}
    Goals: ${business.goals.join(', ')}

    ${personaContext}

    Generate a detailed customer journey mapping for the following stages: Awareness, Interest, Consideration, Conversion, Purchase, Delivery, Retention, Referral.
    
    Return ONLY a raw JSON array. No markdown, no explanations.
    Schema per object in array:
    {
      "stage": "string (e.g. Awareness)",
      "goals": ["string"],
      "customer_thoughts": ["string"],
      "touchpoints": ["string"],
      "automations": ["string"],
      "content": ["string"],
      "risks": ["string"],
      "fixes": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Gemini Journey Generation Error:", error);
    throw error;
  }
}

export async function optimizeJourneyAI(apiKey: string, business: BusinessData, journeyMap: JourneyMap): Promise<AIResponseOptimization> {
  if (!apiKey) throw new Error("API Key is required");
  const ai = new GoogleGenAI({ apiKey });

  // Flatten journey map for context
  const journeySummary = Object.values(journeyMap.stages).map(s => ({
    stage: s.title,
    items: s.items.map(i => `${i.type}: ${i.content}`).join('; ')
  }));

  const prompt = `
    Act as an elite Revenue Operations and CX Consultant.
    Analyze this existing customer journey for: ${business.name} (${business.offer}).
    
    Journey Data:
    ${JSON.stringify(journeySummary)}

    Identify specific bottlenecks, high-impact quick wins, automation gaps (suggest tools like Zapier/n8n), and custom AI agents that could manage parts of this process.

    Return ONLY raw JSON.
    Schema:
    {
      "bottlenecks": ["string"],
      "quick_wins": ["string"],
      "automation_opportunities": ["string"],
      "ai_agents_to_build": ["string"],
      "content_gaps": ["string"],
      "funnel_ideas": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    throw error;
  }
}

export async function suggestStageItemsAI(apiKey: string, stageName: string, business: BusinessData, existingItems: string[]): Promise<string[]> {
    if (!apiKey) throw new Error("API Key is required");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Business: ${business.name} (${business.offer})
      Stage: ${stageName}
      Existing Items in Stage: ${existingItems.join(', ')}

      Suggest 3 new, creative, high-impact items (touchpoints, specific content ideas, or automations) for this stage.
      Return ONLY a JSON array of strings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      if (!text) return [];
      return JSON.parse(cleanJsonString(text));
    } catch (e) {
        console.error(e);
        return ["Error generating suggestions"];
    }
}