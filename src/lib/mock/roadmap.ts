import type { Roadmap, Stage, Lesson, SkillType, CEFRLevel } from '@/types';

// Giáo trình mẫu: tiếng Anh công việc dùng chung cho mọi ngành.
// Nội dung theo ngành cụ thể do admin upload giáo án rồi AI tách thành chặng/bài.
type LessonRow = [id: string, skill: SkillType, title: string, minutes: number, xp: number, description: string, topic: string];

function lessons(stageId: string, rows: LessonRow[]): Lesson[] {
  return rows.map(([id, skill, title, minutes, xp, description, topic], idx) => ({
    id, stage_id: stageId, order: idx + 1, title, skill,
    duration_minutes: minutes, status: 'locked', xp_reward: xp, description, topic,
  }));
}

function stage(
  id: string, order: number, title: string, description: string, focus: SkillType[], weeks: number[],
  why: string, rows: LessonRow[], hasFinal = true
): Stage {
  return {
    id, order, title, description, focus_skills: focus, weeks, status: 'locked',
    has_midterm: false, has_final: hasFinal, why_this_stage: why, lessons: lessons(id, rows),
  };
}

export const mockRoadmap: Roadmap = {
  id: 'roadmap_001',
  user_id: 'user_001',
  cefr_level: 'B1' as CEFRLevel,
  total_weeks: 12,
  created_at: '2024-10-28T08:00:00.000Z',
  stages: [
    stage('stage_1', 1, 'Nền tảng tiếng Anh công việc',
      'Xây dựng vốn từ vựng cốt lõi và kỹ năng nghe cơ bản trong môi trường làm việc',
      ['vocabulary', 'listening'], [1, 2, 3],
      'Vốn từ vựng và kỹ năng nghe là nền tảng để học các kỹ năng phức tạp hơn.',
      [
        ['lesson_1_1', 'vocabulary', 'Từ vựng: Giới thiệu bản thân & đồng nghiệp', 20, 50, 'Các từ và mẫu câu để giới thiệu bản thân, vai trò và đội nhóm', 'introductions'],
        ['lesson_1_2', 'listening', 'Nghe: Cuộc gọi đặt lịch hẹn', 15, 40, 'Nghe hội thoại điện thoại đặt và đổi lịch hẹn', 'office'],
        ['lesson_1_3', 'vocabulary', 'Từ vựng: Văn phòng & lịch làm việc', 20, 50, 'Từ vựng về lịch hẹn, cuộc họp và sinh hoạt văn phòng', 'office'],
        ['lesson_1_4', 'listening', 'Nghe: Thông báo thay đổi lịch', 20, 50, 'Nghe thông báo nội bộ về thay đổi lịch họp và hạn chót', 'projects'],
        ['lesson_1_5', 'vocabulary', 'Từ vựng: Dự án & thời hạn', 20, 40, 'Từ vựng để trao đổi về tiến độ, ngân sách và hạn chót', 'projects'],
        ['lesson_1_6', 'vocabulary', 'Ôn tập chặng 1: Từ vựng email & văn phòng', 15, 60, 'Ôn lại toàn bộ từ vựng của chặng 1', 'email'],
      ]),
    stage('stage_2', 2, 'Email & tài liệu công việc',
      'Đọc hiểu và viết email, thông báo, tài liệu nội bộ',
      ['reading', 'writing'], [4, 5, 6],
      'Sau khi có vốn từ vựng vững, bạn áp dụng vào đọc tài liệu thật và viết email chuyên nghiệp.',
      [
        ['lesson_2_1', 'reading', 'Đọc: Email công việc', 25, 55, 'Đọc hiểu email yêu cầu và phản hồi trong công việc', 'email'],
        ['lesson_2_2', 'writing', 'Viết: Email xác nhận cuộc họp', 30, 60, 'Soạn email xác nhận thời gian, địa điểm và nội dung họp', 'email'],
        ['lesson_2_3', 'reading', 'Đọc: Thông báo & hướng dẫn nội bộ', 25, 55, 'Đọc hiểu thông báo, quy trình và hướng dẫn trong công ty', 'office'],
        ['lesson_2_4', 'writing', 'Viết: Email xin lùi hạn chót', 30, 60, 'Soạn email lịch sự để xin gia hạn và giải thích lý do', 'projects'],
      ]),
    stage('stage_3', 3, 'Giao tiếp chuyên nghiệp',
      'Tăng sự tự tin khi nói và nghe trong cuộc họp, trao đổi với khách hàng',
      ['speaking', 'listening'], [7, 8, 9],
      'Giai đoạn nâng cao tập trung vào độ trôi chảy và sự tự tin khi giao tiếp thực tế.',
      [
        ['lesson_3_1', 'speaking', 'Nói: Giới thiệu công việc của bạn', 20, 60, 'Luyện nói giới thiệu vai trò và nhiệm vụ của bạn trong cuộc họp', 'introductions'],
        ['lesson_3_2', 'listening', 'Nghe: Thảo luận trong cuộc họp', 25, 60, 'Nghe và nắm ý chính của cuộc họp nhóm', 'projects'],
      ], false),
    stage('stage_4', 4, 'Tổng hợp & nâng cao',
      'Kết hợp các kỹ năng trong tình huống thực tế và chuẩn bị cho giao tiếp chuyên nghiệp',
      ['reading', 'writing', 'speaking'], [10, 11, 12],
      'Củng cố toàn bộ kỹ năng qua các tình huống công việc thực tế.',
      [
        ['lesson_4_1', 'reading', 'Tình huống tổng hợp: Xử lý khiếu nại khách hàng', 35, 80, 'Đọc, phân tích và phản hồi một khiếu nại của khách hàng', 'customer'],
        ['lesson_4_2', 'reading', 'Kiểm tra cuối khóa', 40, 100, 'Bài kiểm tra tổng hợp kiến thức toàn khóa', 'email'],
      ]),
  ],
};
