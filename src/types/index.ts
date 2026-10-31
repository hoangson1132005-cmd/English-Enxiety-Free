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
  interests: LogisticsArea[];
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
export type LogisticsArea = string;
export type DailyMinutes = 10 | 20 | 30 | 45;
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary';

// --- Placement Test ---
export interface PlacementTest {
  id: string;
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
export type VocabTopic = 'incoterms' | 'documents' | 'customs' | 'freight' | 'booking' | 'container' | 'shipping';

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
    'Logistics và Quản lý chuỗi cung ứng',
    'Kinh tế vận tải biển',
    'Khai thác vận tải',
    'Quản trị kinh doanh (Logistics)',
    'Thương mại quốc tế',
    'Kỹ thuật hàng hải',
    'Kỹ thuật tàu thủy',
    'Kinh doanh quốc tế',
    'Quản trị cảng và logistics',
  ],
  other: [
    'Công nghệ thông tin',
    'Kế toán',
    'Tài chính ngân hàng',
    'Marketing',
    'Du lịch',
    'Quản trị kinh doanh',
    'Luật kinh tế',
    'Xây dựng',
    'Cơ khí',
    'Điện - Điện tử',
    'Y - Dược',
    'Sư phạm',
    'Nông - Lâm - Thủy sản',
    'Mỹ thuật - Thiết kế',
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

// --- Vị trí / lĩnh vực công việc quan tâm ---
// Giá trị sentinel: chọn mục này để hiện ô nhập tay (đa ngành nghề, không chỉ logistics).
export const OTHER_INTEREST_VALUE = '__other__';

export const JOB_INTEREST_OPTIONS: { id: string; label: string; group: string }[] = [
  // Logistics & XNK
  { id: 'documentation', label: 'Chứng từ XNK (Doc)', group: 'Logistics & XNK' },
  { id: 'customs', label: 'Thủ tục Hải quan', group: 'Logistics & XNK' },
  { id: 'sales', label: 'Sales / Pricing cước', group: 'Logistics & XNK' },
  { id: 'warehouse', label: 'Kho vận & Phân phối', group: 'Logistics & XNK' },
  { id: 'forwarder', label: 'Giao nhận Forwarder', group: 'Logistics & XNK' },
  { id: 'shipping_line', label: 'Hãng tàu biển', group: 'Logistics & XNK' },
  { id: 'supply_chain', label: 'Quản lý chuỗi cung ứng', group: 'Logistics & XNK' },
  // Các ngành khác
  { id: 'it', label: 'Công nghệ thông tin', group: 'Ngành khác' },
  { id: 'finance', label: 'Tài chính / Ngân hàng', group: 'Ngành khác' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán', group: 'Ngành khác' },
  { id: 'marketing', label: 'Marketing / Truyền thông', group: 'Ngành khác' },
  { id: 'hr', label: 'Nhân sự (HR)', group: 'Ngành khác' },
  { id: 'tourism', label: 'Du lịch / Khách sạn', group: 'Ngành khác' },
  { id: 'education', label: 'Giáo dục / Đào tạo', group: 'Ngành khác' },
  { id: 'manufacturing', label: 'Sản xuất / Nhà máy', group: 'Ngành khác' },
  { id: 'customer_service', label: 'Dịch vụ khách hàng', group: 'Ngành khác' },
  { id: 'sales_general', label: 'Kinh doanh / Bán hàng', group: 'Ngành khác' },
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
  questions: LessonQuestion[];
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
  interests: LogisticsArea[];
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
