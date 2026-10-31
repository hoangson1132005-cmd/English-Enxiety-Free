// ============================================================
// English Anxiety Free — Core TypeScript Types
// ============================================================

// --- User & Auth ---
export type FacultyGroup = 'language' | 'engineering' | 'other';
export type EmploymentStatus = 'student' | 'employed';

export interface User {
  id: string;
  full_name: string;
  student_id: string; // MSSV
  email: string;
  avatar_url?: string;
  created_at: string;
  onboarding_completed: boolean;
  placement_completed: boolean;
}

export interface Profile extends User {
  employment_status: EmploymentStatus;
  faculty_group: FacultyGroup;
  major: string;
  study_year: 1 | 2 | 3;
  research_consent: boolean;
  goal: LearningGoal;
  interests: InterestArea[];
  daily_minutes: DailyMinutes;
  self_assessed_level: CEFRLevel;
  current_level: CEFRLevel;
  streak: number;
  total_xp: number;
  notification_enabled: boolean;
  dark_mode: boolean;
}

export type LearningGoal = 'internship' | 'work' | 'certificate' | 'communication';
// Free-text cho phép: đây là danh sách gợi ý, người dùng có thể tự nhập thêm
export type InterestArea = string;
export type DailyMinutes = 10 | 20 | 30 | 45;
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary';

// --- Placement Test ---
export interface PlacementTest {
  id: string;
  kind?: 'placement' | 'level_up';
  title: string;
  description: string;
  duration_minutes: number;
  sections: TestSection[];
}

export interface TestSection {
  id: string;
  skill: SkillType;
  title: string;
  instructions: string;
  questions: Question[];
  time_limit_minutes?: number;
}

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching' | 'essay' | 'speaking';

export interface Question {
  id: string;
  skill: SkillType;
  topic: string;
  level: CEFRLevel;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  audio_url?: string;
  passage?: string;
  word_limit?: number;
}

export interface UserAnswer {
  question_id: string;
  answer: string | string[];
  time_spent_seconds: number;
  flagged?: boolean;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  completed_at: string;
  scores: SkillScores;
  total_score: number;
  cefr_level: CEFRLevel;
  toeic_equivalent: number;
  ielts_equivalent: number;
  strengths: string[];
  weaknesses: string[];
  ai_feedback: string;
  time_spent_seconds: number;
  faculty_group: FacultyGroup;
  outcome?: 'level_up' | 'improve';
  pass_score?: number;
}

export interface SkillScores {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  vocabulary: number;
}

// --- Roadmap & Lessons ---
export type StageStatus = 'locked' | 'in_progress' | 'completed';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface Roadmap {
  id: string;
  user_id: string;
  cefr_level: CEFRLevel;
  total_weeks: number;
  stages: Stage[];
  created_at: string;
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  description: string;
  focus_skills: SkillType[];
  weeks: number[];
  lessons: Lesson[];
  status: StageStatus;
  has_midterm?: boolean;
  has_final?: boolean;
  why_this_stage?: string;
}

export interface Lesson {
  id: string;
  stage_id: string;
  order: number;
  title: string;
  skill: SkillType;
  duration_minutes: number;
  status: LessonStatus;
  xp_reward: number;
  description: string;
  topic: string;
}

// --- Vocabulary ---
export type CardDifficulty = 'easy' | 'hard' | 'unknown';
export type VocabTopic = string;

export interface VocabCard {
  id: string;
  term: string;
  pronunciation: string;
  definition: string;
  definition_vi: string;
  example: string;
  example_vi: string;
  topic: VocabTopic;
  level: CEFRLevel;
  audio_url?: string;
  last_reviewed?: string;
  next_review?: string;
  difficulty?: CardDifficulty;
  mastered?: boolean;
}

export interface VocabSet {
  id: string;
  title: string;
  title_vi: string;
  topic: VocabTopic;
  description: string;
  card_count: number;
  cards: VocabCard[];
  icon: string;
  is_own?: boolean;
}

// --- AI Tutor Chat ---
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  is_typing?: boolean;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// --- Progress & Stats ---
export interface Progress {
  user_id: string;
  date: string;
  minutes_studied: number;
  xp_earned: number;
  lessons_completed: number;
  vocab_reviewed: number;
  skills: Partial<SkillScores>;
}

export interface WeeklyStats {
  week_start: string;
  total_minutes: number;
  total_xp: number;
  lessons_completed: number;
  daily_breakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  day_label: string;
  minutes: number;
  xp: number;
}

export interface SkillProgress {
  skill: SkillType;
  score: number;
  previous_score: number;
  trend: 'up' | 'down' | 'stable';
  sessions: { date: string; score: number }[];
}

// --- API Payloads ---
export interface SubmitTestPayload {
  test_id: string;
  user_id: string;
  faculty_group: FacultyGroup;
  answers: UserAnswer[];
  time_spent_seconds: number;
}

export interface SubmitLessonPayload {
  lesson_id: string;
  user_id: string;
  faculty_group: FacultyGroup;
  score: number;
  time_spent_seconds: number;
  answers?: UserAnswer[];
}

// --- Question Bank (from /lib/mock/questions.json) ---
export interface QuestionBankItem {
  id: string;
  skill: SkillType;
  topic: string;
  level: CEFRLevel;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  audio_url?: string;
  passage?: string;
}

// --- Majors by Faculty ---
// Giá trị sentinel: khi người dùng chọn mục này trong dropdown ngành học,
// UI sẽ hiện ô nhập tay thay vì danh sách có sẵn.
export const OTHER_MAJOR_VALUE = '__other__';

export const MAJORS_BY_FACULTY: Record<FacultyGroup, string[]> = {
  language: [
    'Ngôn ngữ Anh',
    'Ngôn ngữ Trung Quốc',
    'Ngôn ngữ Nhật',
    'Ngôn ngữ Hàn Quốc',
    'Ngôn ngữ Pháp',
    'Ngôn ngữ Đức',
    'Biên phiên dịch',
    'Đông phương học',
  ],
  engineering: [
    'Quản trị kinh doanh',
    'Kinh tế',
    'Thương mại quốc tế',
    'Kinh doanh quốc tế',
    'Tài chính ngân hàng',
    'Kế toán',
    'Công nghệ thông tin',
    'Kỹ thuật cơ khí',
    'Kỹ thuật điện - điện tử',
    'Kỹ thuật xây dựng',
    'Khai thác vận tải',
    'Quản lý chuỗi cung ứng',
  ],
  other: [
    'Marketing',
    'Du lịch - Khách sạn',
    'Luật',
    'Y - Dược',
    'Sư phạm',
    'Nông - Lâm - Thủy sản',
    'Mỹ thuật - Thiết kế',
    'Truyền thông',
    'Tâm lý học',
    'Xã hội học',
  ],
};

export const FACULTY_GROUP_LABELS: Record<FacultyGroup, string> = {
  language: 'Ngôn ngữ',
  engineering: 'Kỹ thuật / Kinh tế',
  other: 'Khác',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  student: 'Sinh viên',
  employed: 'Đã đi làm',
};

// --- Lĩnh vực / ngành nghề quan tâm ---
// Giá trị sentinel: chọn mục này để hiện ô nhập tay nếu lĩnh vực của bạn không có trong danh sách.
export const OTHER_INTEREST_VALUE = '__other__';

export const INTEREST_GROUPS = ['Kinh doanh & Quản lý', 'Công nghệ & Kỹ thuật', 'Dịch vụ & Giao tiếp', 'Giáo dục, Y tế & Khác'] as const;

export const JOB_INTEREST_OPTIONS: { id: string; label: string; group: string }[] = [
  { id: 'business', label: 'Kinh doanh / Quản trị', group: 'Kinh doanh & Quản lý' },
  { id: 'sales_general', label: 'Bán hàng / Sales', group: 'Kinh doanh & Quản lý' },
  { id: 'marketing', label: 'Marketing / Truyền thông', group: 'Kinh doanh & Quản lý' },
  { id: 'finance', label: 'Tài chính / Ngân hàng', group: 'Kinh doanh & Quản lý' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán', group: 'Kinh doanh & Quản lý' },
  { id: 'hr', label: 'Nhân sự (HR)', group: 'Kinh doanh & Quản lý' },
  { id: 'import_export', label: 'Xuất nhập khẩu / Thương mại quốc tế', group: 'Kinh doanh & Quản lý' },
  { id: 'it', label: 'Công nghệ thông tin', group: 'Công nghệ & Kỹ thuật' },
  { id: 'engineering', label: 'Kỹ thuật / Cơ khí / Điện', group: 'Công nghệ & Kỹ thuật' },
  { id: 'construction', label: 'Xây dựng / Kiến trúc', group: 'Công nghệ & Kỹ thuật' },
  { id: 'manufacturing', label: 'Sản xuất / Nhà máy', group: 'Công nghệ & Kỹ thuật' },
  { id: 'transport', label: 'Vận tải / Chuỗi cung ứng', group: 'Công nghệ & Kỹ thuật' },
  { id: 'customer_service', label: 'Dịch vụ khách hàng', group: 'Dịch vụ & Giao tiếp' },
  { id: 'tourism', label: 'Du lịch / Khách sạn / Nhà hàng', group: 'Dịch vụ & Giao tiếp' },
  { id: 'office', label: 'Hành chính / Văn phòng', group: 'Dịch vụ & Giao tiếp' },
  { id: 'daily', label: 'Giao tiếp hằng ngày', group: 'Dịch vụ & Giao tiếp' },
  { id: 'education', label: 'Giáo dục / Đào tạo', group: 'Giáo dục, Y tế & Khác' },
  { id: 'healthcare', label: 'Y tế / Dược', group: 'Giáo dục, Y tế & Khác' },
  { id: 'law', label: 'Luật / Pháp chế', group: 'Giáo dục, Y tế & Khác' },
  { id: 'design', label: 'Thiết kế / Sáng tạo', group: 'Giáo dục, Y tế & Khác' },
];

export const CEFR_TOEIC_MAP: Record<CEFRLevel, number> = {
  A1: 120,
  A2: 225,
  B1: 550,
  B2: 785,
  C1: 945,
};

export const CEFR_IELTS_MAP: Record<CEFRLevel, number> = {
  A1: 1.0,
  A2: 2.5,
  B1: 4.5,
  B2: 6.0,
  C1: 7.0,
};

// --- Dynamic lesson page (student) ---
export interface LessonQuestion {
  id: string;
  skill: SkillType;
  topic: string;
  level: CEFRLevel;
  type: QuestionType;
  question: string;
  options?: string[];
  passage?: string;
  audio_url?: string;
}

export interface LessonDetail {
  id: string;
  stage_id: string;
  order: number;
  title: string;
  skill: SkillType;
  duration_minutes: number;
  xp_reward: number;
  description: string;
  topic: string;
  content: string;
  vocab: LessonVocabItem[];
  item_status: 'pending' | 'in_progress' | 'completed' | 'suggested' | 'dismissed';
  best_score: number | null;
  next_lesson_id: string | null;
  attempts: { id: string; score: number; passed: boolean; created_at: string }[];
  questions: LessonQuestion[];
}

export interface LessonVocabItem {
  term: string;
  pronunciation?: string;
  definition: string;
  definition_vi?: string;
  example?: string;
  example_vi?: string;
}

export interface LessonSubmitResult {
  score: number;
  passed: boolean;
  pass_score: number;
  xp_earned: number;
  new_total_xp: number;
  new_streak: number;
  results: { question_id: string; score: number; feedback: string; correct_answer: string; given: string }[];
  review_summary: string;
  attempt_no: number;
  previous_best: number | null;
  words_saved: number;
  next_lesson_id: string | null;
  roadmap_done: boolean;
}

// --- Admin ---
export type AdminUserStatus = 'active' | 'disabled';

export interface AdminUser {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  faculty_group: FacultyGroup;
  major: string;
  study_year: 1 | 2 | 3 | 4 | 5;
  interests: InterestArea[];
  current_level: CEFRLevel;
  streak: number;
  total_xp: number;
  placement_completed: boolean;
  status: AdminUserStatus;
  created_at: string;
  last_active: string;
}

export interface AdminStats {
  total_users: number;
  active_today: number;
  new_this_week: number;
  placement_completion_rate: number;
  signup_trend: { day_label: string; count: number }[];
  faculty_distribution: { faculty_group: FacultyGroup; count: number }[];
}

// --- Lộ trình cá nhân (mỗi học viên một lộ trình riêng) ---
export type RoadmapItemStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface RoadmapItemView {
  item_id: string;
  lesson_id: string;
  title: string;
  skill: SkillType;
  duration_minutes: number;
  xp_reward: number;
  description: string;
  topic: string;
  week: number;
  reason: string;
  status: RoadmapItemStatus;
  best_score: number | null;
  source: 'ai' | 'admin' | 'suggested';
}

export interface RoadmapStageView {
  stage_id: string;
  title: string;
  items: RoadmapItemView[];
}

export interface RoadmapView {
  roadmap: {
    id: string;
    cycle: number;
    level: CEFRLevel;
    kind: 'initial' | 'level_up' | 'improve';
    generated_by: 'ai' | 'heuristic' | 'admin';
    rationale: string;
    focus_skills: SkillType[];
    created_at: string;
  };
  user_level: CEFRLevel;
  progress: { done: number; total: number; percent: number; avg_score: number | null; total_minutes: number };
  stages: RoadmapStageView[];
  suggestions: RoadmapItemView[];
  next_item_id: string | null;
  all_done: boolean;
  history: { id: string; cycle: number; kind: string; level: CEFRLevel; outcome: string | null; exam_score: number | null; completed_at: string | null }[];
}
