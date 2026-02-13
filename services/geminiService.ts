
import { GoogleGenAI, Type } from "@google/genai";
import { Material, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchMaterialWithAI = async (
  query: string,
  inventory: Material[]
): Promise<SearchResult> => {
  // 인벤토리 데이터가 너무 크면 AI 컨텍스트 제한에 걸릴 수 있으므로 
  // 실제 서비스에서는 벡터 DB를 쓰지만, 여기서는 샘플링 또는 전체를 전달합니다.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      사용자 쿼리: "${query}"
      자재 인벤토리(일부): ${JSON.stringify(inventory.slice(0, 150))} 
      
      업무: 사용자의 쿼리에 가장 부합하는 전자부품을 찾으세요. 
      label_spec, erp_spec, match tokens를 모두 고려하여 판단하세요.
      정확한 매칭이 없으면 가장 유사한 스펙을 가진 부품을 추천하세요.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchFound: { type: Type.BOOLEAN },
          material: {
            type: Type.OBJECT,
            properties: {
              pn_code: { type: Type.STRING },
              location: { type: Type.STRING },
              label_spec: { type: Type.STRING },
              erp_spec: { type: Type.STRING }
            }
          },
          explanation: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["matchFound", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const identifyMaterialFromImage = async (
  base64Image: string,
  inventory: Material[]
): Promise<SearchResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `이미지의 부품 라벨이나 형태를 보고 아래 인벤토리 데이터 중 어떤 부품인지 맞추세요.
                 품번(pn_code)과 스펙을 정확히 대조하세요.
                 데이터: ${JSON.stringify(inventory.slice(0, 100))}`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchFound: { type: Type.BOOLEAN },
          material: {
            type: Type.OBJECT,
            properties: {
              pn_code: { type: Type.STRING },
              label_spec: { type: Type.STRING }
            }
          },
          explanation: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
