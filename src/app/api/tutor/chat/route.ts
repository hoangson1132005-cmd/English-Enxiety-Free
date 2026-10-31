import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chatReply, GeminiNotConfiguredError, type ChatTurn } from '@/lib/gemini';

const SYSTEM_PROMPT = `Bạn là AI Tutor của English Anxiety Free — nền tảng học tiếng Anh chuyên ngành logistics. Trả lời ngắn gọn, đúng trọng tâm, có thể dùng cả tiếng Việt và tiếng Anh tùy ngữ cảnh câu hỏi. Ưu tiên ví dụ thực tế trong ngành logistics (Incoterms, chứng từ, vận tải, hải quan). Không trả lời các chủ đề ngoài tiếng Anh/logistics.`;
const HISTORY_LIMIT = 20;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const message = (body.message ?? '').trim();
  if (!message) return NextResponse.json({ error: 'Thiếu nội dung tin nhắn' }, { status: 400 });

  const priorMessages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
  });
  const history: ChatTurn[] = priorMessages
    .reverse()
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.content }));

  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: 'user', content: message },
  });

  let replyText: string;
  try {
    replyText = await chatReply(SYSTEM_PROMPT, history, message);
    if (!replyText) throw new Error('empty response');
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      replyText = 'AI Tutor chưa được cấu hình (thiếu GEMINI_API_KEY). Hãy báo admin cấu hình để mình trả lời được câu hỏi của bạn.';
    } else {
      console.error('Gemini chat failed:', err);
      replyText = 'Xin lỗi, mình đang gặp sự cố kết nối AI. Vui lòng thử lại sau giây lát.';
    }
  }

  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: 'assistant', content: replyText },
  });

  return NextResponse.json({ content: replyText });
}
