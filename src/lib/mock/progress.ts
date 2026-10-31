import type { Progress, WeeklyStats, SkillProgress } from '@/types';

export const mockProgress: Progress[] = [
  { user_id: 'user_001', date: '2024-10-22', minutes_studied: 20, xp_earned: 90, lessons_completed: 2, vocab_reviewed: 15, skills: { vocabulary: 65, listening: 58 } },
  { user_id: 'user_001', date: '2024-10-23', minutes_studied: 0, xp_earned: 0, lessons_completed: 0, vocab_reviewed: 0, skills: {} },
  { user_id: 'user_001', date: '2024-10-24', minutes_studied: 25, xp_earned: 110, lessons_completed: 2, vocab_reviewed: 20, skills: { vocabulary: 67, reading: 69 } },
  { user_id: 'user_001', date: '2024-10-25', minutes_studied: 15, xp_earned: 50, lessons_completed: 1, vocab_reviewed: 10, skills: { listening: 60 } },
  { user_id: 'user_001', date: '2024-10-26', minutes_studied: 30, xp_earned: 140, lessons_completed: 3, vocab_reviewed: 25, skills: { vocabulary: 69, writing: 57 } },
  { user_id: 'user_001', date: '2024-10-27', minutes_studied: 20, xp_earned: 90, lessons_completed: 2, vocab_reviewed: 15, skills: { reading: 71, listening: 62 } },
  { user_id: 'user_001', date: '2024-10-28', minutes_studied: 10, xp_earned: 50, lessons_completed: 1, vocab_reviewed: 8, skills: { vocabulary: 70 } },
];

export const mockWeeklyStats: WeeklyStats = {
  week_start: '2024-10-22',
  total_minutes: 120,
  total_xp: 530,
  lessons_completed: 11,
  daily_breakdown: [
    { date: '2024-10-22', day_label: 'Thứ 3', minutes: 20, xp: 90 },
    { date: '2024-10-23', day_label: 'Thứ 4', minutes: 0, xp: 0 },
    { date: '2024-10-24', day_label: 'Thứ 5', minutes: 25, xp: 110 },
    { date: '2024-10-25', day_label: 'Thứ 6', minutes: 15, xp: 50 },
    { date: '2024-10-26', day_label: 'Thứ 7', minutes: 30, xp: 140 },
    { date: '2024-10-27', day_label: 'CN', minutes: 20, xp: 90 },
    { date: '2024-10-28', day_label: 'Thứ 2', minutes: 10, xp: 50 },
  ],
};

export const mockSkillProgress: SkillProgress[] = [
  {
    skill: 'listening',
    score: 62,
    previous_score: 58,
    trend: 'up',
    sessions: [
      { date: '2024-10-01', score: 50 },
      { date: '2024-10-08', score: 54 },
      { date: '2024-10-15', score: 58 },
      { date: '2024-10-22', score: 60 },
      { date: '2024-10-28', score: 62 },
    ],
  },
  {
    skill: 'reading',
    score: 71,
    previous_score: 68,
    trend: 'up',
    sessions: [
      { date: '2024-10-01', score: 62 },
      { date: '2024-10-08', score: 65 },
      { date: '2024-10-15', score: 68 },
      { date: '2024-10-22', score: 70 },
      { date: '2024-10-28', score: 71 },
    ],
  },
  {
    skill: 'writing',
    score: 55,
    previous_score: 52,
    trend: 'up',
    sessions: [
      { date: '2024-10-01', score: 45 },
      { date: '2024-10-08', score: 48 },
      { date: '2024-10-15', score: 52 },
      { date: '2024-10-22', score: 53 },
      { date: '2024-10-28', score: 55 },
    ],
  },
  {
    skill: 'speaking',
    score: 48,
    previous_score: 45,
    trend: 'up',
    sessions: [
      { date: '2024-10-01', score: 40 },
      { date: '2024-10-08', score: 42 },
      { date: '2024-10-15', score: 44 },
      { date: '2024-10-22', score: 46 },
      { date: '2024-10-28', score: 48 },
    ],
  },
  {
    skill: 'vocabulary',
    score: 70,
    previous_score: 65,
    trend: 'up',
    sessions: [
      { date: '2024-10-01', score: 58 },
      { date: '2024-10-08', score: 61 },
      { date: '2024-10-15', score: 65 },
      { date: '2024-10-22', score: 68 },
      { date: '2024-10-28', score: 70 },
    ],
  },
];
