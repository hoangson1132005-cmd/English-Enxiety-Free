// Giới hạn đăng nhập sai liên tục để chống dò mật khẩu (brute-force).
// Lưu trong bộ nhớ của tiến trình: đủ cho một máy chủ; nếu chạy nhiều bản (nhiều instance) cần chuyển sang Redis/DB.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Entry {
  failures: number;
  firstAt: number;
}

const attempts = new Map<string, Entry>();

function keyOf(email: string, ip: string) {
  return `${email.trim().toLowerCase()}|${ip}`;
}

export function isThrottled(email: string, ip: string) {
  const entry = attempts.get(keyOf(email, ip));
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(keyOf(email, ip));
    return false;
  }
  return entry.failures >= MAX_FAILURES;
}

export function recordFailure(email: string, ip: string) {
  const key = keyOf(email, ip);
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { failures: 1, firstAt: Date.now() });
  } else {
    entry.failures += 1;
  }
}

export function clearFailures(email: string, ip: string) {
  attempts.delete(keyOf(email, ip));
}
