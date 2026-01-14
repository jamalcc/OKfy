
import { GoogleGenAI, Type } from "@google/genai";

// CORREÇÃO DE SEGURANÇA: Usando import.meta.env (Vite Standard)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback para evitar crash se a chave não estiver configurada, mas logando erro
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY não encontrada no .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const generatePipelineFromPrompt = async (userPrompt: string) => {
  if (!apiKey) throw new Error("API Key não configurada");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Atualizado para modelo mais recente e rápido se disponível, ou mantenha 1.5-flash
      contents: `Você é um Arquiteto de Processos Sênior. 
      O usuário quer um pipeline Kanban para: "${userPrompt}".
      
      Gere um JSON com:
      1. 'phases': Lista de fases (min 3, max 7). Cada fase tem 'name' (string) e 'color' (HEX).
      2. 'suggestedFields': Lista de campos sugeridos para este tipo de processo.
      
      As fases devem ter nomes de ação ou estado (ex: "Triagem", "Em Análise", "Concluído").
      Use cores profissionais.`,
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
