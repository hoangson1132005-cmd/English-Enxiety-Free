import type { TestResult } from '@/types';

export const mockTestResult: TestResult = {
  id: 'result_001',
  user_id: 'user_001',
  test_id: 'placement_001',
  completed_at: '2024-10-28T09:30:00.000Z',
  scores: {
    listening: 62,
    reading: 71,
    writing: 55,
    speaking: 48,
    vocabulary: 68,
  },
  total_score: 61,
  cefr_level: 'B1',
  toeic_equivalent: 550,
  ielts_equivalent: 4.5,
  strengths: [
    'Reading comprehension of logistics documents (B/L, emails)',
    'Vocabulary knowledge of Incoterms (FOB, CIF, EXW)',
    'Understanding of shipping terminology',
  ],
  weaknesses: [
    'Speaking fluency and pronunciation of logistics terms',
    'Written communication (email writing)',
    'Listening to fast-paced business conversations',
  ],
  ai_feedback: `Dựa trên kết quả bài kiểm tra đầu vào, bạn đang ở mức **B1 (Intermediate)** trong tiếng Anh logistics.

**Điểm mạnh**: Bạn có nền tảng tốt về đọc hiểu tài liệu logistics và từ vựng Incoterms. Điểm đọc hiểu 71/100 cho thấy bạn có thể hiểu emails, Bill of Lading và các chứng từ thương mại cơ bản.

**Cần cải thiện**: Kỹ năng nói cần được ưu tiên luyện tập (48/100). Việc phát âm thuật ngữ chuyên ngành và giao tiếp tự nhiên trong môi trường logistics sẽ là mục tiêu chính. Kỹ năng viết email cũng cần được củng cố.

**Lộ trình đề xuất**: Chương trình 12 tuần tập trung vào listening + speaking trong giai đoạn đầu, sau đó chuyển sang writing email nghiệp vụ và đọc hiểu hợp đồng/chứng từ phức tạp hơn.`,
  time_spent_seconds: 2340,
  faculty_group: 'engineering',
};
