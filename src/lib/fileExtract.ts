import mammoth from 'mammoth';
import type { FilePart } from '@/lib/gemini';

export const MAX_IMPORT_FILE_BYTES = 8 * 1024 * 1024; // 8MB

// Converts an uploaded .docx/.pdf (or plain text) file into parts Gemini can
// read. .docx is extracted to plain text locally (Gemini doesn't read docx
// natively); .pdf is handed to Gemini directly since it reads PDFs (including
// tables/layout) natively via multimodal input.
export async function fileToGeminiParts(file: File): Promise<(string | FilePart)[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith('.docx')) {
    const { value: text } = await mammoth.extractRawText({ buffer });
    return [text];
  }
  if (name.endsWith('.pdf')) {
    return [{ inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } }];
  }
  return [buffer.toString('utf-8')];
}
