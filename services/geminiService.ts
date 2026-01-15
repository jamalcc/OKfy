import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePipelineFromPrompt = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um Arquiteto de Processos Sênior. 
      O usuário quer um pipeline Kanban para: "${userPrompt}".
      
      Gere um JSON com:
      1. 'phases': Lista de fases (min 3, max 7). Cada fase tem 'name' (string) e 'color' (HEX).
      2. 'suggestedFields': Lista de campos sugeridos para este tipo de processo.
      
      As fases devem ter nomes de ação ou estado (ex: "Triagem", "Em Análise", "Concluído").
      Use cores profissionais e distintas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  color: { type: Type.STRING },
                  slaDays: { type: Type.NUMBER }
                },
                required: ["name", "color"]
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Erro ao gerar pipeline:", error);
    throw error;
  }
};