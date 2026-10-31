import type { HelpNoteProps } from '@/components/admin/HelpNote';

// Ghi chú hướng dẫn hiển thị ở đầu từng trang admin (có link bấm nhanh sang bước tiếp theo).
export const ADMIN_HELP: Record<string, HelpNoteProps> = {
  content: {
    id: 'content',
    title: 'Bài học: nạp giáo án và xuất bản',
    items: [
      'Bấm “Tải giáo án lên (AI)” và chọn file Word/PDF: AI tách thành các bài (nội dung, từ vựng, câu hỏi). Bài mới luôn ở trạng thái Nháp.',
      'Chỉ bài Đã xuất bản mới được AI xếp vào lộ trình của học viên. Xem lại bài rồi chọn nhiều bài để Xuất bản cùng lúc.',
      'Xuất bản bài mới sẽ gửi đề xuất cho học viên đang học, không tự chèn vào lộ trình của họ.',
      'Cột “Nguồn” cho biết bài đến từ giáo án nào. Bấm tên bài để sửa nội dung, từ vựng, cấu hình bài kiểm tra cuối bài.',
    ],
    links: [
      { href: '/admin/content?status=draft', label: 'Xem bài nháp cần duyệt' },
      { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi' },
      { href: '/admin/quiz-settings', label: 'Cài đặt kiểm tra' },
    ],
  },
  lesson: {
    id: 'lesson-edit',
    title: 'Sửa một bài học',
    items: [
      'Chọn “Trình độ phù hợp” để AI xếp bài đúng người; “Chủ đề” và từ vựng giúp chọn câu hỏi sát bài.',
      'Mục câu hỏi bên dưới chỉ là các câu gắn riêng với bài này. Bài kiểm tra còn lấy thêm câu từ ngân hàng; bấm “Xem trước bộ câu học viên sẽ thấy” để kiểm tra.',
      'Muốn có sẵn câu hỏi trước khi học viên vào học: bấm “Tạo sẵn câu hỏi bằng AI” rồi xem lại trong ngân hàng.',
      'Nhớ bấm “Xuất bản bài này” khi đã duyệt xong.',
    ],
    links: [
      { href: '/admin/content', label: 'Về danh sách bài học' },
      { href: '/admin/question-bank?source=ai', label: 'Câu hỏi AI tạo cần duyệt' },
      { href: '/admin/quiz-sessions', label: 'Lịch sử bốc câu' },
    ],
  },
  questionBank: {
    id: 'question-bank',
    title: 'Ngân hàng câu hỏi: nguồn của mọi bài kiểm tra',
    items: [
      'Mọi bài kiểm tra (cuối bài 8 câu, cuối chặng 18 câu, cuối khóa 30 câu) bốc câu từ đây theo cấp độ, chủ đề, kỹ năng và ưu tiên câu học viên chưa gặp.',
      'Nạp bằng cách thêm tay hoặc tải file Word/PDF (AI tự gắn cấp độ A1–C1, kỹ năng, chủ đề). Không đủ câu phù hợp thì AI tự sinh thêm (nguồn “AI tạo”): nên xem lại các câu này.',
      'Câu có vấn đề: chọn rồi “Tạm ẩn” (không còn được bốc nhưng vẫn giữ lại). Mở rộng một câu để xem nó đã được dùng ở đâu.',
    ],
    links: [
      { href: '/admin/question-bank?source=ai', label: 'Câu do AI tạo' },
      { href: '/admin/question-bank?active=no', label: 'Câu đang tạm ẩn' },
      { href: '/admin/quiz-sessions', label: 'Lịch sử bốc câu' },
      { href: '/admin/quiz-settings', label: 'Số câu mỗi bài kiểm tra' },
    ],
  },
  quizSessions: {
    id: 'quiz-sessions',
    title: 'Xem học viên đã làm những câu nào',
    items: [
      'Mỗi dòng là một lượt kiểm tra (cuối bài / chặng / khóa). Bấm vào dòng để xem đúng bộ câu đã bốc, nguồn từng câu và điểm từng câu.',
      'Thấy câu sai hoặc quá khó? Dùng link “Sửa / ẩn trong ngân hàng” ngay cạnh câu đó: sửa một lần là áp dụng cho mọi học viên.',
    ],
    links: [
      { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi' },
      { href: '/admin/question-bank?sort=accuracy', label: 'Câu có tỷ lệ đúng thấp' },
    ],
  },
  quizSettings: {
    id: 'quiz-settings',
    title: 'Quy tắc chung cho mọi bài kiểm tra',
    items: [
      'Chỉnh một lần là áp dụng cho toàn bộ học viên và mọi lộ trình, không cần chỉnh từng người.',
      'Muốn một bài cụ thể khác mặc định (số câu riêng, chỉ dùng câu của bài): mở bài đó trong mục Bài học → “Bài Kiểm Tra Cuối Bài”.',
      'Đổi điểm đạt giữa chừng sẽ khiến học viên cũ và mới được đánh giá theo hai chuẩn; nên giữ ổn định.',
    ],
    links: [
      { href: '/admin/content', label: 'Mở danh sách bài học' },
      { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi' },
    ],
  },
  tests: {
    id: 'tests',
    title: 'Đề test: đầu vào và đề tổng kết',
    items: [
      'Đề đầu vào: học viên mới làm để xếp trình độ và tạo lộ trình. Chỉ một đề đầu vào được kích hoạt tại một thời điểm.',
      'Đề tổng kết theo level là tùy chọn. Mặc định bài cuối khóa bốc câu từ ngân hàng; đề tổng kết chỉ thay thế khi bạn kích hoạt cho level đó.',
      'Tạo đề: nhập tay, hoặc tải file Word/PDF để AI tách phần thi và câu hỏi (đề mới ở trạng thái nháp, xem lại rồi kích hoạt).',
    ],
    links: [
      { href: '/admin/question-bank', label: 'Ngân hàng câu hỏi' },
      { href: '/admin/quiz-settings', label: 'Cài đặt kiểm tra' },
    ],
  },
  testDetail: {
    id: 'test-detail',
    title: 'Sửa một đề test',
    items: [
      'Thêm phần thi theo kỹ năng, rồi mở phần thi để thêm / sửa / xóa từng câu (hỗ trợ đoạn văn, transcript bài nghe và file audio).',
      'Chọn “Loại đề”: đầu vào hoặc tổng kết theo level. Đề chỉ có hiệu lực sau khi bạn bấm kích hoạt.',
    ],
    links: [{ href: '/admin/tests', label: 'Về danh sách đề test' }],
  },
  users: {
    id: 'users',
    title: 'Quản lý người dùng',
    items: [
      'Biểu tượng lộ trình: xem và chỉnh lộ trình riêng của từng học viên (thêm bài, đổi chặng, nhờ AI tạo lại).',
      'Biểu tượng chìa khóa: đặt lại mật khẩu (mật khẩu tạm chỉ hiện một lần, gửi cho người dùng). Biểu tượng cấm: khóa / mở khóa tài khoản.',
      'Tạo tài khoản: mật khẩu tạm được sinh ngẫu nhiên và hiện đúng một lần sau khi tạo.',
    ],
    links: [
      { href: '/admin/reports', label: 'Thống kê theo nhóm đối tượng' },
      { href: '/admin/quiz-sessions', label: 'Lịch sử làm bài' },
    ],
  },
  userRoadmap: {
    id: 'user-roadmap',
    title: 'Lộ trình riêng của học viên này',
    items: [
      'Chặng thuộc riêng học viên này: đổi tên, thêm chặng, chuyển bài giữa các chặng ngay trong bảng.',
      '“AI tạo lại (giữ bài đã xong)” chỉ làm mới phần chưa học; “Tạo lộ trình mới” lưu trữ lộ trình cũ.',
      'Bài bạn thêm cho học viên luôn mở sẵn, không phải chờ hoàn thành các bài trước.',
    ],
    links: [
      { href: '/admin/users', label: 'Về danh sách người dùng' },
      { href: '/admin/content', label: 'Kho bài học' },
    ],
  },
  reports: {
    id: 'reports',
    title: 'Đọc báo cáo',
    items: [
      'Mục “Người dùng theo nhóm đối tượng” so sánh sinh viên theo khối ngành với người đi làm: số lượng, XP, tỷ lệ làm test đầu vào và phân bố trình độ.',
      'Dữ liệu dùng cho nghiên cứu chỉ nên xem ở dạng tổng hợp theo nhóm, đúng cam kết ẩn danh với học viên.',
    ],
    links: [
      { href: '/admin/users', label: 'Người dùng' },
      { href: '/admin/quiz-sessions', label: 'Lịch sử bốc câu' },
    ],
  },
  landing: {
    id: 'landing',
    title: 'Nội dung trang chủ',
    items: [
      'Chỉnh tiêu đề, mô tả, các ý “Vì sao chọn” và logo. Thay đổi hiển thị ngay trên trang chủ công khai.',
      'Mỗi ý trong “Vì sao chọn” viết dạng “Tiêu đề: nội dung” để phần tiêu đề được in đậm.',
    ],
    links: [{ href: '/', label: 'Xem trang chủ' }],
  },
};
