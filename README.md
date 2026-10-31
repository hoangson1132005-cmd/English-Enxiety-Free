# UTH English for Logistics

> **Nền tảng học tiếng Anh chuyên ngành Logistics & Chuỗi cung ứng dành riêng cho sinh viên Đại học Giao thông Vận tải TP.HCM (UTH).**  
> Ứng dụng web full-stack (Next.js + Prisma + PostgreSQL) phục vụ đề tài Nghiên cứu Khoa học Sinh viên — 100% Miễn phí, dành cho sinh viên.

---

## 🌟 Tính Năng Nổi Bật

1. **Design System đồng bộ bản sắc UTH**:
   - Tông màu chủ đạo: Primary Teal (`#2F7F7A`), nền nhạt (`#E3F2EF`), hoa đào hồng pastel (`#F4A7B9`), vàng kem (`#FFF4CC`).
   - Font chữ: *Lora / Playfair Display* (tiêu đề serif trang trọng giống logo UTH) và *Be Vietnam Pro* (nội dung sắc nét).
   - Bo góc lớn `rounded-2xl`, bóng đổ mềm mại, hỗ trợ Dark Mode hoàn hảo.

2. **Bài Test Đầu Vào Chuyên Sâu (`/placement`)**:
   - 4 kỹ năng + Từ vựng: Incoterms (FOB, CIF, EXW, DAP...), Bill of Lading, Packing List, FCL/LCL, Demurrage, Detention, HS Code.
   - Hỗ trợ Audio player giả lập, đếm từ essay viết email nghiệp vụ, thu âm giọng nói với Web Speech API.
   - Màn hình AI phân tích kết quả từng bước.
   - Báo cáo kết quả (`/placement/result`): Biểu đồ Radar 5 thành phần (Recharts), CEFR (A1–C1), đối sánh tương đương TOEIC & IELTS, nhận xét AI cá nhân hóa.

3. **Lộ Trình Cá Nhân Hóa 12 Tuần (`/roadmap`)**:
   - Timeline trực quan theo 4 Chặng (Stages).
   - Thẻ nổi bật "Hôm nay học gì".
   - Giải thích lý do lộ trình phù hợp với năng lực sinh viên.

4. **Luyện 4 Kỹ Năng Thực Chiến (`/learn/*`)**:
   - **Listening**: Player audio (tốc độ 0.75x/1x/1.25x, tua 5s, ẩn/hiện transcript), trắc nghiệm & giải thích.
   - **Reading**: Bài đọc 2 cột (Bill of Lading thật), tra từ vựng trực tiếp dạng popup & lưu vào Flashcard.
   - **Writing**: Đề bài tình huống viết email logistics, AI chấm bài chi tiết: highlight lỗi sai, gợi ý sửa và bản viết mẫu (Model Answer).
   - **Speaking**: Luyện phát âm thuật ngữ, nhận dạng giọng nói, tính điểm tương đồng % (similarity score).

5. **Kho Từ Vựng & Flashcard Lặp Lại Ngắt Quãng (`/vocab`)**:
   - Flashcard 3D flip card mượt mà.
   - Phát âm từ bằng Speech Synthesis bản ngữ.
   - Hệ thống đánh giá Spaced Repetition (SRS): *Đã nhớ (7 ngày)*, *Khó (3 ngày)*, *Chưa nhớ (1 ngày)*.

6. **AI Tutor 24/7 (`/tutor` & Floating Panel)**:
   - Giao diện chat trực tiếp hoặc widget nổi ở góc màn hình.
   - Gợi ý câu hỏi nhanh (Incoterms, chữa email, tư vấn bài học).
   - Giả lập streaming phản hồi, sẵn sàng kết nối API backend.

7. **Dữ Liệu Nghiên Cứu Khoa Học**:
   - Phân loại Khối ngành: **Kỹ thuật / Kinh tế** (`engineering`), **Ngôn ngữ** (`language`), **Khác** (`other`).
   - Checkbox cam kết đồng ý nghiên cứu ẩn danh kèm Modal chi tiết.
   - Dashboard gắn badge khối ngành, đảm bảo **không** hiển thị bảng so sánh xếp hạng giữa các khối cho sinh viên.

---

## 🧰 Công Nghệ

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 + **PostgreSQL** · NextAuth v5 (Credentials) · Google Gemini (AI Tutor, chấm Writing) · Nodemailer (email đặt lại mật khẩu) · Recharts · Zustand.

---

## 🚀 Chạy Dự Án (Development)

Yêu cầu: Node.js ≥ 20, Docker (hoặc một PostgreSQL có sẵn).

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file môi trường rồi điền giá trị
cp .env.example .env

# 3. Bật PostgreSQL (bỏ qua nếu dùng DB có sẵn, chỉ cần sửa DATABASE_URL)
docker compose up -d db

# 4. Tạo bảng và nạp dữ liệu mẫu
npx prisma migrate deploy
npm run db:seed

# 5. Chạy
npm run dev        # http://localhost:3000
```

### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ | Chuỗi kết nối PostgreSQL |
| `AUTH_SECRET` | ✅ | Khóa ký phiên đăng nhập. Tạo bằng `npx auth secret` |
| `GEMINI_API_KEY` | ✅ | Key Google AI Studio cho AI Tutor và chấm bài Writing |
| `APP_URL` | ✅ (production) | URL công khai, dùng tạo link trong email đặt lại mật khẩu |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | ✅ | SMTP gửi email. Thiếu thì chức năng quên mật khẩu báo lỗi |

### Tài khoản mẫu (sau `db:seed`)

- Admin: `admin@soonolingo.local` / `admin123`
- Sinh viên mẫu: mật khẩu `demo1234`

> ⚠️ **Đổi mật khẩu admin và xóa tài khoản mẫu trước khi đưa lên môi trường thật.**

---

## 📦 Triển Khai (Production)

```bash
npm ci
npx prisma migrate deploy   # áp dụng migration lên DB production
npm run db:seed             # chỉ chạy lần đầu để có admin, đề test, lộ trình, từ vựng
npm run build
npm start                   # cổng 3000
```

Checklist: đặt `AUTH_SECRET` mới, `APP_URL` đúng tên miền, cấu hình SMTP, dùng Postgres được quản lý (Neon, Supabase, RDS...) và bật backup. Có thể deploy lên Vercel (đặt biến môi trường trong dashboard) hoặc VPS/Docker.

### Đặt lại mật khẩu

`/forgot-password` tạo token ngẫu nhiên (lưu dạng hash SHA-256, hiệu lực 30 phút, dùng một lần) và gửi link `APP_URL/reset-password?token=...` qua SMTP. API: `POST /api/password/forgot`, `POST /api/password/reset`.

### Lệnh hữu ích

| Lệnh | Tác dụng |
|---|---|
| `npm run db:migrate` | Tạo migration mới khi sửa `schema.prisma` (dev) |
| `npm run db:deploy` | Áp dụng migration (production) |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npx prisma studio` | Xem/sửa dữ liệu bằng giao diện |

---

## 📁 Cấu Trúc Thư Mục

```text
├── prisma/            # schema.prisma, migrations (PostgreSQL), seed
├── src/
│   ├── app/           # Trang (App Router) và API route
│   │   ├── api/       # auth, register, password, placement, lessons, vocab, tutor, admin/*
│   │   ├── admin/     # Khu quản trị: user, câu hỏi, đề test, bài học, lộ trình, báo cáo
│   │   └── ...        # login, register, onboarding, placement, roadmap, learn, vocab, tutor, dashboard, profile
│   ├── components/    # layout, features, ui
│   ├── lib/           # auth, prisma, gemini, mail, grading, progress...
│   ├── store/         # Zustand (auth, UI)
│   └── middleware.ts  # Bảo vệ route đăng nhập và /admin
├── docker-compose.yml # PostgreSQL cho dev
└── .env.example
```

---

## 🔬 Các Trường Dữ Liệu Phục Vụ Nghiên Cứu Khoa Học

Để phục vụ bài toán so sánh hiệu quả học tập giữa các nhóm đối tượng sinh viên, hệ thống lưu trữ các trường sau trong `Profile`:

| Tên trường | Kiểu dữ liệu | Ý nghĩa nghiên cứu |
|---|---|---|
| `faculty_group` | `'language' \| 'engineering' \| 'other'` | **Khối ngành**: Ngôn ngữ, Kỹ thuật/Kinh tế (Logistics, Vận tải), Khác. |
| `major` | `string` | Ngành học cụ thể của sinh viên tại UTH. |
| `study_year` | `1 \| 2 \| 3 \| 4 \| 5` | Năm học (K21 - K24). |
| `research_consent` | `boolean` | Sinh viên xác nhận đồng ý cho phép sử dụng dữ liệu học tập ẩn danh (`true`). |

### Quy tắc bảo mật học thuật:
1. Mọi payload gửi lên server khi submit test (`apiSubmitPlacementTest`) và submit bài học (`apiSubmitLesson`) đều đính kèm trường `faculty_group`.
2. Giao diện người dùng sinh viên **KHÔNG** hiển thị bảng so sánh hơn thua giữa hai khối để tránh thiên lệch tâm lý học tập.
3. Dữ liệu báo cáo nghiên cứu chỉ xuất thống kê nhóm (Aggregated Data).

---
