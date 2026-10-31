import type { ChatSession } from '@/types';

export const mockChatSession: ChatSession = {
  id: 'session_001',
  user_id: 'user_001',
  created_at: '2024-10-28T08:00:00.000Z',
  updated_at: '2024-10-28T08:30:00.000Z',
  messages: [
    {
      id: 'msg_001',
      role: 'assistant',
      content: `Xin chào Lan Anh! Tôi là AI Tutor của English Anxiety Free – trợ lý học tiếng Anh logistics của bạn.

Tôi có thể giúp bạn:
- Giải thích thuật ngữ logistics (Incoterms, chứng từ, quy trình...)
- Sửa email và văn bản tiếng Anh của bạn
- Gợi ý nội dung ôn tập hôm nay
- Luyện hội thoại tiếng Anh logistics

Bạn muốn học gì hôm nay?`,
      timestamp: '2024-10-28T08:30:00.000Z',
    },
  ],
};
