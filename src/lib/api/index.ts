import type { Profile, PlacementTest, TestResult, RoadmapView, VocabSet, VocabCard, ChatMessage, WeeklyStats, SkillProgress, QuestionBankItem, LessonDetail, LessonSubmitResult } from '@/types';
import questionsJson from '../mock/questions.json';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// Auth API (register goes through our own route; login/logout/session
// are handled by next-auth's signIn()/signOut()/useSession() directly)
// ============================================================

export async function apiRegister(data: {
  full_name: string;
  student_id: string;
  email: string;
  password: string;
  employment_status: string;
  faculty_group: string;
  major: string;
  study_year: number;
  research_consent: boolean;
}): Promise<{ id: string; email: string }> {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Đăng ký thất bại');
  }
  return res.json();
}

export async function apiForgotPassword(email: string): Promise<{ success: boolean; dev_reset_url?: string }> {
  const res = await fetch('/api/password/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Không thể gửi email');
  return res.json();
}

export async function apiResetPassword(token: string, password: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error('Liên kết không hợp lệ hoặc đã hết hạn');
  return { success: true };
}

// ============================================================
// Profile API
// ============================================================

export async function apiGetProfile(): Promise<Profile> {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('Không lấy được hồ sơ');
  return res.json();
}

export async function apiUpdateProfile(_userId: string, data: Partial<Profile>): Promise<Profile> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Cập nhật hồ sơ thất bại');
  return res.json();
}

export async function apiCompleteOnboarding(_userId: string, data: {
  goal: string;
  interests: string[];
  daily_minutes: number;
  self_assessed_level: string;
  faculty_group?: string;
  major?: string;
  study_year?: number;
}): Promise<{ success: boolean }> {
  const res = await fetch('/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Hoàn tất onboarding thất bại');
  return res.json();
}

// ============================================================
// Placement Test API
// ============================================================

export async function apiGetPlacementTest(testId?: string, sessionId?: string): Promise<PlacementTest> {
  const qs = sessionId ? `?session_id=${sessionId}` : testId ? `?test_id=${testId}` : '';
  const res = await fetch(`/api/placement/test${qs}`);
  if (!res.ok) throw new Error('Không lấy được đề test');
  return res.json();
}

export async function apiSubmitPlacementTest(payload: {
  answers: { question_id: string; answer: string | string[]; time_spent_seconds: number }[];
  time_spent_seconds: number;
  test_id?: string;
  session_id?: string;
}): Promise<{ result_id: string }> {
  const res = await fetch('/api/placement/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Nộp bài test thất bại');
  return res.json();
}

export async function apiGetTestResult(resultId?: string): Promise<TestResult> {
  const res = await fetch(`/api/placement/result${resultId ? `?id=${resultId}` : ''}`);
  if (!res.ok) throw new Error('Không lấy được kết quả');
  return res.json();
}

// ============================================================
// Roadmap API
// ============================================================

export async function apiGetRoadmap(): Promise<RoadmapView> {
  const res = await fetch('/api/roadmap', { cache: 'no-store' });
  if (!res.ok) throw new Error('Không lấy được lộ trình học');
  return res.json();
}

export async function apiRespondSuggestion(itemId: string, action: 'accept' | 'dismiss'): Promise<void> {
  const res = await fetch('/api/roadmap/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId, action }),
  });
  if (!res.ok) throw new Error('Không cập nhật được đề xuất');
}

// Trả về test_id (đề admin chỉ định) hoặc session_id (bộ câu bốc từ ngân hàng)
export async function apiStartExam(): Promise<{ test_id?: string; session_id?: string }> {
  const res = await fetch('/api/exam/start', { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Không mở được bài kiểm tra');
  return data;
}

export async function apiStartStageQuiz(phase: number): Promise<{ session_id: string }> {
  const res = await fetch('/api/quiz/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Không mở được bài kiểm tra');
  return data;
}

// ============================================================
// Lesson API
// ============================================================

export async function apiGetLesson(lessonId: string): Promise<LessonDetail> {
  const res = await fetch(`/api/lessons/${lessonId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Không tìm thấy bài học');
  return res.json();
}

export async function apiSubmitLesson(payload: {
  lesson_id: string;
  session_id: string;
  answers: { question_id: string; answer: string | string[] }[];
  time_spent_seconds: number;
}): Promise<LessonSubmitResult> {
  const res = await fetch('/api/lessons/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Nộp bài thất bại');
  return res.json();
}

export async function apiSaveLessonWords(lessonId: string, terms?: string[]): Promise<{ added: number; total: number }> {
  const res = await fetch('/api/vocab/save-words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lesson_id: lessonId, terms }),
  });
  if (!res.ok) throw new Error('Không lưu được từ vựng');
  return res.json();
}

// ============================================================
// Vocabulary API
// ============================================================

export async function apiGetVocabSets(): Promise<VocabSet[]> {
  const res = await fetch('/api/vocab/sets');
  if (!res.ok) throw new Error('Không lấy được danh sách từ vựng');
  return res.json();
}

export async function apiCreateVocabSet(data: {
  title: string;
  title_vi?: string;
  description?: string;
  icon?: string;
}): Promise<VocabSet> {
  const res = await fetch('/api/vocab/sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Tạo bộ từ thất bại');
  }
  return res.json();
}

export async function apiDeleteVocabSet(setId: string): Promise<void> {
  const res = await fetch(`/api/vocab/sets/${setId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa bộ từ thất bại');
}

export async function apiAddVocabCard(setId: string, data: {
  term: string;
  definition_vi: string;
  definition?: string;
  pronunciation?: string;
  example?: string;
  example_vi?: string;
}): Promise<VocabCard> {
  const res = await fetch(`/api/vocab/sets/${setId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Thêm từ thất bại');
  }
  return res.json();
}

export async function apiDeleteVocabCard(setId: string, cardId: string): Promise<void> {
  const res = await fetch(`/api/vocab/sets/${setId}/cards/${cardId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa từ thất bại');
}

export async function apiUpdateCardDifficulty(
  cardId: string,
  difficulty: 'easy' | 'hard' | 'unknown'
): Promise<{ next_review: string }> {
  const res = await fetch('/api/vocab/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_id: cardId, difficulty }),
  });
  if (!res.ok) throw new Error('Cập nhật ôn tập thất bại');
  return res.json();
}

// ============================================================
// AI Tutor API
// ============================================================

export async function apiGetChatHistory(): Promise<ChatMessage[]> {
  const res = await fetch('/api/tutor/history');
  if (!res.ok) throw new Error('Không lấy được lịch sử chat');
  return res.json();
}

export async function apiSendMessage(message: string): Promise<{ content: string }> {
  const res = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Gửi tin nhắn thất bại');
  return res.json();
}

// ============================================================
// Progress & Dashboard API
// ============================================================

export async function apiGetDashboard(): Promise<{
  weekly_stats: WeeklyStats;
  skill_progress: SkillProgress[];
  due_vocab: { term: string; meaning: string }[];
}> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Không lấy được dữ liệu tổng quan');
  return res.json();
}

export async function apiGetWeeklyStats(): Promise<WeeklyStats> {
  return (await apiGetDashboard()).weekly_stats;
}

// ============================================================
// Notifications API
// ============================================================

export interface NotificationItem {
  id: string;
  type: 'lesson_completed';
  title: string;
  description: string;
  created_at: string;
}

export async function apiGetNotifications(): Promise<{ items: NotificationItem[]; has_unread: boolean }> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Không lấy được thông báo');
  return res.json();
}

export async function apiGetSkillProgress(): Promise<SkillProgress[]> {
  return (await apiGetDashboard()).skill_progress;
}

// ============================================================
// Question Bank API
// ============================================================

export async function getQuestionBank(): Promise<QuestionBankItem[]> {
  await delay(300);
  return questionsJson.questions as QuestionBankItem[];
}

export async function getQuestionsBySkill(skill: string): Promise<QuestionBankItem[]> {
  await delay(200);
  return (questionsJson.questions as QuestionBankItem[]).filter(q => q.skill === skill);
}
