import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-flash-lite-latest';

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super('GEMINI_API_KEY chưa được cấu hình.');
    this.name = 'GeminiNotConfiguredError';
  }
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiNotConfiguredError();
  return new GoogleGenAI({ apiKey });
}

export interface FilePart {
  inlineData: { mimeType: string; data: string }; // base64
}

// Asks Gemini to turn free-form text/PDF content into JSON matching `schema`
// (a Gemini-flavored JSON Schema object). Gemini's responseSchema guarantees
// the shape, so callers get back parsed, typed data directly.
export async function extractStructured<T>(
  prompt: string,
  parts: (string | FilePart)[],
  schema: Record<string, unknown>
): Promise<T> {
  const ai = getClient();
  const contents = [
    { text: prompt },
    ...parts.map((p) => (typeof p === 'string' ? { text: p } : p)),
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: contents }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini không trả về nội dung.');
  return JSON.parse(text) as T;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export async function chatReply(systemPrompt: string, history: ChatTurn[], message: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ],
    config: {
      systemInstruction: systemPrompt,
    },
  });
  return response.text ?? '';
}
