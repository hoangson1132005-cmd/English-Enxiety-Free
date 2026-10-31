# English Anxiety Free

> **Nền tảng học tiếng Anh cho mọi ngành nghề.** Học viên làm bài test đầu vào, nhận lộ trình học cá nhân do AI chọn từ kho nội dung của giáo viên, học từng bài có điểm số và nhận xét, rồi thi tổng kết để lên trình độ tiếp theo.  
> Ứng dụng web full-stack (Next.js + Prisma + PostgreSQL), 100% miễn phí cho người học.

Nội dung theo ngành (kinh doanh, CNTT, y tế, du lịch, logistics, ...) **không cố định trong code**: admin upload giáo trình, giáo án rồi AI tách thành chặng, bài, từ vựng và câu hỏi. Bộ nội dung mẫu đi kèm là tiếng Anh công việc dùng chung.

---

## 🌟 Tính Năng Nổi Bật

1. **Test đầu vào (`/placement`)**: từ vựng, đọc, nghe (phát âm bằng text-to-speech hoặc file audio), viết (AI chấm), nói (nhận diện giọng nói). Báo cáo radar 5 kỹ năng, CEFR A1–C1, quy đổi TOEIC/IELTS.
2. **Lộ trình cá nhân (`/roadmap`)**: mỗi học viên một lộ trình riêng, AI xếp bài theo trình độ, kỹ năng yếu, lĩnh vực quan tâm và số phút học mỗi ngày.
3. **Bài học (`/learn/*`)**: Học → Luyện tập từng câu → Kết quả (điểm, đáp án, nhận xét rút kinh nghiệm, làm lại để cải thiện). Giao diện riêng cho nghe, đọc, viết, nói, từ vựng.
4. **Kho từ vựng & flashcard (`/vocab`)**: lặp lại ngắt quãng (SRS); từ gặp trong bài tự lưu vào kho cá nhân, giữ qua mọi lộ trình, tự thêm/sửa/xóa.
5. **AI Tutor (`/tutor`)**: trả lời theo trình độ và lĩnh vực của từng học viên.
6. **Kiểm tra tổng kết**: học xong lộ trình thì thi để lên level hoặc học lộ trình cải thiện.
7. **Khu quản trị (`/admin`)**: người dùng, nội dung (import giáo án bằng AI), đề test, lộ trình từng học viên, báo cáo, nội dung trang chủ.
8. **Dữ liệu nghiên cứu**: khối ngành, ngành học, năm học, đồng ý nghiên cứu ẩn danh; không hiển thị bảng so sánh giữa các khối cho học viên.

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

## 🧭 Luồng Nội Dung & Lộ Trình Cá Nhân

**Ai thấy gì**

| Thứ | Phạm vi |
|---|---|
| Kho nội dung: chặng, bài học, câu hỏi, từ vựng của bài | Dùng chung, do admin quản lý |
| Lộ trình (danh sách bài, thứ tự, tuần) | **Riêng từng học viên** (`UserRoadmap`) |
| Tiến độ, điểm, các lần làm bài (`LessonAttempt`) | Riêng từng học viên |
| Kho từ vựng cá nhân ("Từ vựng từ lộ trình" + bộ tự tạo) | Riêng từng học viên, **giữ nguyên qua mọi lộ trình** |

**Vòng đời một chu kỳ học**

1. Admin upload giáo án (Word/PDF) tại *Nội dung → Import*. AI tách thành chặng, bài, từ vựng, câu hỏi. Nội dung mới ở trạng thái **nháp**; admin xem lại rồi **xuất bản** chặng.
2. Học viên làm **test đầu vào** → hệ thống xếp trình độ CEFR và AI **chọn + sắp xếp bài từ kho đã xuất bản** thành lộ trình riêng (xét kỹ năng yếu, mục tiêu, số phút học mỗi ngày). AI chỉ chọn bài có sẵn trong kho; nếu AI lỗi thì dùng phương án dự phòng theo giáo trình.
3. Mỗi bài học có 3 bước: **Học** (nội dung + từ vựng) → **Luyện tập** (từng câu, giao diện theo kỹ năng nghe/đọc/viết/nói) → **Kết quả** (điểm, đáp án đúng, nhận xét rút kinh nghiệm, so sánh với lần trước). Cần **≥ 70 điểm** để qua bài và mở bài kế tiếp; làm lại không giới hạn, XP chỉ tính lần đầu qua bài.
4. Học xong toàn bộ lộ trình → **bài kiểm tra tổng kết** (đề admin tạo cho từng level, hoặc AI tự tạo từ nội dung đã học; nếu AI lỗi thì lấy mẫu lại câu hỏi trong bài). Đạt ≥ 70: lên level + lộ trình mới. Chưa đạt: lộ trình **cải thiện** tập trung phần yếu, học xong được thi lại.

**Admin điều chỉnh**

- *Người dùng → biểu tượng lộ trình*: xem lộ trình của từng học viên, thêm/bớt/đổi thứ tự bài, hoặc để AI tạo lại (giữ các bài đã xong).
- Xuất bản chặng mới **không tự chèn** vào lộ trình học viên đang học: hệ thống gửi **đề xuất**, học viên tự thêm hoặc bỏ qua.
- *Đề test*: chọn loại đề (đầu vào / tổng kết theo level). Mỗi loại, mỗi level có một đề đang kích hoạt.
- Cần gán level cho bài học cũ: `npx tsx scripts/backfill-lesson-levels.ts`.

> `npm run db:seed` chỉ nạp dữ liệu mẫu khi database chưa có nội dung. Để reset dữ liệu mẫu ở môi trường dev (xóa lộ trình, kết quả, từ vựng cá nhân): `SEED_RESET=1 npm run db:seed`. **Không dùng trên production.**

---

## 🏦 Ngân hàng câu hỏi và bài kiểm tra

Mọi bài kiểm tra của học viên đều **bốc câu từ Ngân hàng câu hỏi** (*Admin → Ngân hàng câu hỏi*), không dùng bộ câu cố định:

| Bài kiểm tra | Số câu | Nguồn câu hỏi |
|---|---|---|
| Cuối mỗi bài học | 8 (bài Viết/Nói: 5) | Ngân hàng + câu gắn với bài, đúng cấp độ & chủ đề của bài |
| Cuối mỗi chặng của học viên | 18 | Theo nội dung các bài trong chặng, ưu tiên kỹ năng yếu |
| Cuối khóa (cuối lộ trình) | 30 | Bao quát toàn bộ bài đã học, cân bằng kỹ năng |

- Chọn theo **cấp độ (A1–C1)**, **chủ đề**, **kỹ năng**, và **ưu tiên câu học viên chưa gặp** (làm lại sẽ ra bộ câu mới). Với bài kiểm tra cuối chặng / cuối khóa, AI đọc danh sách ứng viên và chọn bộ câu sát nhất; AI lỗi thì dùng kết quả lọc.
- **Không đủ câu phù hợp thì AI tự sinh thêm và lưu vào ngân hàng** (nguồn “AI tạo”, nên xem lại) để dùng lại cho người khác, không sinh riêng cho từng người.
- Nạp ngân hàng bằng cách nhập tay, hoặc tải file Word/PDF (AI tách câu và gắn cấp độ/kỹ năng/chủ đề). Trang có bộ lọc, sắp xếp, tìm kiếm, sửa/xóa hàng loạt và thống kê số lần dùng, tỷ lệ đúng của từng câu.
- Đề test cố định do admin tạo vẫn dùng cho **test đầu vào**. Đề tổng kết do admin tạo cho một level, nếu được kích hoạt, sẽ thay thế bài cuối khóa bốc từ ngân hàng cho level đó (mặc định không kích hoạt).

## 🧩 Học phần và chặng

- **Học phần** (*Admin → Học phần*) là nhóm bài do admin tổ chức trong kho nội dung, dùng chung cho mọi người.
- **Chặng** là phần của **riêng từng học viên**: AI chia lộ trình của họ thành 2–4 chặng có tên và mục tiêu riêng. Admin chỉnh ở *Người dùng → biểu tượng lộ trình* (đổi tên, thêm chặng, chuyển bài giữa các chặng). Mỗi chặng có bài kiểm tra cuối chặng.

## 🔊 Âm thanh bài nghe

- Mặc định hệ thống **đọc transcript thành tiếng** bằng giọng đọc của trình duyệt (miễn phí, không cần lưu file).
- Muốn giọng người thật: trong trình sửa câu hỏi (bài nghe), upload file mp3/wav/m4a (tối đa 6MB) hoặc dán đường dẫn audio đã có để dùng lại cho câu khác. File được lưu trong database (`AudioFile`) và chỉ người đã đăng nhập mới nghe được.
- File Word không chứa audio; sau khi import, admin mở từng câu nghe để gắn audio nếu cần.

## 🔐 Lối vào quản trị

Không có link công khai tới `/admin`. Quản trị viên đăng nhập ở trang đăng nhập thường (tự chuyển sang `/admin`) và thấy mục **Quản trị** trong thanh bên. Lối tắt ẩn: bấm logo 5 lần liên tiếp hoặc nhấn `Alt + Shift + A`. Quyền truy cập luôn được kiểm tra ở server (middleware), lối tắt chỉ để tiện. Đăng nhập sai 5 lần liên tiếp sẽ bị tạm khóa 15 phút (theo email + IP; lưu trong bộ nhớ nên cần chuyển sang Redis nếu chạy nhiều instance).

## 📄 File Word mẫu để thử import

Thư mục `sample-content/` có sẵn 8 file `.docx` để thử chức năng import bằng AI:

| File | Dùng ở đâu |
|---|---|
| `GiaoAn_01...` đến `GiaoAn_05...` (công sở, email & họp, du lịch - khách sạn, CNTT, bán hàng - CSKH) | *Admin → Nội dung → Import giáo án* |
| `NganHangCauHoi_Mau.docx` (60 câu, A1–C1) | *Admin → Ngân hàng câu hỏi → Tải file lên* |
| `DeDauVao_TongHop.docx` | *Admin → Đề test → Tải file lên*, loại đề: Đầu vào |
| `DeTongKet_A2.docx`, `DeTongKet_B1.docx` | Như trên, sau đó vào đề chọn loại *Đề tổng kết* + level tương ứng rồi kích hoạt |

Import tạo nội dung ở trạng thái **nháp**: xem lại rồi xuất bản chặng / kích hoạt đề. Định dạng file nên có tiêu đề chặng, bài, danh sách từ vựng, đoạn văn/transcript và câu hỏi kèm đáp án (xem file mẫu).

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
| `faculty_group` | `'language' \| 'engineering' \| 'other'` | **Khối ngành**: Ngôn ngữ, Kỹ thuật/Kinh tế, Khác. |
| `major` | `string` | Ngành học cụ thể của sinh viên tại UTH. |
| `study_year` | `1 \| 2 \| 3 \| 4 \| 5` | Năm học (K21 - K24). |
| `research_consent` | `boolean` | Sinh viên xác nhận đồng ý cho phép sử dụng dữ liệu học tập ẩn danh (`true`). |

### Quy tắc bảo mật học thuật:
1. Mọi payload gửi lên server khi submit test (`apiSubmitPlacementTest`) và submit bài học (`apiSubmitLesson`) đều đính kèm trường `faculty_group`.
2. Giao diện người dùng sinh viên **KHÔNG** hiển thị bảng so sánh hơn thua giữa hai khối để tránh thiên lệch tâm lý học tập.
3. Dữ liệu báo cáo nghiên cứu chỉ xuất thống kê nhóm (Aggregated Data).

---
