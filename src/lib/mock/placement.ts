import type { PlacementTest } from '@/types';

// Đề kiểm tra đầu vào mẫu: tiếng Anh công việc dùng chung cho mọi ngành.
// Admin có thể tạo/nhập đề riêng (theo ngành) rồi kích hoạt thay thế đề này.
const MEETING_DIALOGUE = `Anna: Hi Tom, did you get my message about tomorrow's meeting?
Tom: Yes, but I have a problem. I have a dentist appointment in the morning.
Anna: No problem. We can start at 2 p.m. instead of 10 a.m. Is that good for you?
Tom: Perfect. Should I bring the sales report?
Anna: Yes, please. And please print six copies for the team.
Tom: Sure. I'll also send the file to everyone by email tonight.`;

const ANNOUNCEMENT = `Good morning, everyone. This is an announcement from the Human Resources department. The annual staff training will take place next Thursday, not Wednesday as planned earlier, because the trainer is travelling. The session starts at 9 a.m. in the main conference room and will last about three hours. Lunch will be provided afterwards. Please confirm your attendance with Ms. Linh by this Friday. Thank you.`;

export const mockPlacementTest: PlacementTest = {
  id: 'placement_001',
  title: 'Bài Kiểm Tra Đầu Vào – English Anxiety Free',
  description: 'Bài test này giúp chúng tôi đánh giá trình độ tiếng Anh của bạn và xây dựng lộ trình học phù hợp nhất.',
  duration_minutes: 45,
  sections: [
    {
      id: 'section_vocab',
      skill: 'vocabulary',
      title: 'Từ vựng',
      instructions: 'Chọn đáp án đúng nhất cho mỗi câu hỏi về từ vựng thường dùng trong công việc.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_v1', skill: 'vocabulary', topic: 'office', level: 'A2', type: 'multiple_choice',
          question: 'We need to ______ the meeting because the manager is sick. (move it to a later time)',
          options: ['postpone', 'attend', 'approve', 'forward'],
          answer: 'postpone',
          explanation: '"Postpone" nghĩa là hoãn sang thời điểm muộn hơn.',
        },
        {
          id: 'pt_v2', skill: 'vocabulary', topic: 'projects', level: 'B1', type: 'multiple_choice',
          question: 'What is a "deadline"?',
          options: [
            'The latest time by which something must be finished',
            'A person who leads a project',
            'The money available for a project',
            'A list of topics for a meeting',
          ],
          answer: 'The latest time by which something must be finished',
          explanation: 'Deadline là hạn chót phải hoàn thành công việc.',
        },
        {
          id: 'pt_v3', skill: 'vocabulary', topic: 'email', level: 'A2', type: 'multiple_choice',
          question: 'Please find the ______ with this email. It contains the full price list.',
          options: ['attachment', 'department', 'schedule', 'colleague'],
          answer: 'attachment',
          explanation: 'Attachment là tệp đính kèm theo email.',
        },
        {
          id: 'pt_v4', skill: 'vocabulary', topic: 'customer', level: 'B1', type: 'multiple_choice',
          question: 'A customer wants their money back for a faulty product. They ask for a ______.',
          options: ['refund', 'agenda', 'warranty', 'milestone'],
          answer: 'refund',
          explanation: 'Refund là khoản tiền được hoàn trả cho khách hàng.',
        },
        {
          id: 'pt_v5', skill: 'vocabulary', topic: 'projects', level: 'B2', type: 'multiple_choice',
          question: 'The team has just completed the first ______ of the project, so we can start the next phase.',
          options: ['milestone', 'reception', 'inquiry', 'minutes'],
          answer: 'milestone',
          explanation: 'Milestone là cột mốc quan trọng trong dự án.',
        },
      ],
    },
    {
      id: 'section_reading',
      skill: 'reading',
      title: 'Đọc hiểu',
      instructions: 'Đọc email và trả lời các câu hỏi.',
      time_limit_minutes: 12,
      questions: [
        {
          id: 'pt_r1', skill: 'reading', topic: 'email', level: 'B1', type: 'multiple_choice',
          passage: `From: sarah.kim@brightco.com
To: team@brightco.com
Subject: Office closed on Friday

Dear all,

Please note that the office will be closed this Friday, 14 June, because of a power maintenance. All staff should work from home on that day. Please make sure your laptop is fully charged and that you can connect to the company VPN.

Urgent customer requests will be handled by Mr. Hung, who will be in the office from 9 a.m. to noon. If you have any questions, please contact me before Thursday afternoon.

Best regards,
Sarah Kim
Office Manager`,
          question: 'Why will the office be closed on Friday?',
          options: ['Because of a public holiday', 'Because of power maintenance', 'Because of a staff party', 'Because of a customer visit'],
          answer: 'Because of power maintenance',
          explanation: 'Email nêu rõ: "because of a power maintenance".',
        },
        {
          id: 'pt_r2', skill: 'reading', topic: 'email', level: 'B1', type: 'multiple_choice',
          passage: `From: sarah.kim@brightco.com
To: team@brightco.com
Subject: Office closed on Friday

Dear all,

Please note that the office will be closed this Friday, 14 June, because of a power maintenance. All staff should work from home on that day. Please make sure your laptop is fully charged and that you can connect to the company VPN.

Urgent customer requests will be handled by Mr. Hung, who will be in the office from 9 a.m. to noon. If you have any questions, please contact me before Thursday afternoon.

Best regards,
Sarah Kim
Office Manager`,
          question: 'What should staff do on Friday?',
          options: ['Come to the office at 9 a.m.', 'Work from home', 'Take a day off', 'Visit customers'],
          answer: 'Work from home',
          explanation: 'Email viết "All staff should work from home on that day".',
        },
      ],
    },
    {
      id: 'section_listening',
      skill: 'listening',
      title: 'Nghe hiểu',
      instructions: 'Bấm nút để nghe, bạn có thể nghe lại nhiều lần. Sau đó trả lời câu hỏi.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_l1', skill: 'listening', topic: 'office', level: 'A2', type: 'multiple_choice',
          passage: MEETING_DIALOGUE,
          question: 'What time will the meeting start tomorrow?',
          options: ['10 a.m.', '2 p.m.', '4 p.m.', '9 a.m.'],
          answer: '2 p.m.',
          explanation: 'Anna nói: "We can start at 2 p.m. instead of 10 a.m."',
        },
        {
          id: 'pt_l2', skill: 'listening', topic: 'office', level: 'B1', type: 'multiple_choice',
          passage: ANNOUNCEMENT,
          question: 'Why was the training moved to Thursday?',
          options: ['The room is not available', 'The trainer is travelling', 'It is a public holiday', 'Staff asked for a change'],
          answer: 'The trainer is travelling',
          explanation: 'Thông báo nói "because the trainer is travelling".',
        },
      ],
    },
    {
      id: 'section_writing',
      skill: 'writing',
      title: 'Viết',
      instructions: 'Viết email bằng tiếng Anh (khoảng 80 - 120 từ). AI sẽ chấm nội dung, ngữ pháp và độ phù hợp.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_w1', skill: 'writing', topic: 'email', level: 'B1', type: 'essay',
          question: 'Your manager asked you to finish a report by Friday, but you need two more days because some data is missing. Write an email to your manager: explain the situation, suggest a new deadline, and say what you will do in the meantime.',
          answer: 'Dear Mr. Lee, I am writing about the monthly report that is due on Friday. Unfortunately, some data from the finance team is still missing, so I need two more days to complete it. Could we move the deadline to next Tuesday? In the meantime, I will finish the other sections and send you a draft by Friday. I apologize for the inconvenience. Best regards, Lan',
          explanation: 'Bài tốt có lời chào, nêu vấn đề, đề xuất hạn chót mới, kế hoạch trong thời gian chờ, xin lỗi lịch sự và lời kết.',
        },
      ],
    },
    {
      id: 'section_speaking',
      skill: 'speaking',
      title: 'Nói',
      instructions: 'Bấm micro và trả lời bằng tiếng Anh trong khoảng 30 - 60 giây. Phần này là tùy chọn.',
      time_limit_minutes: 5,
      questions: [
        {
          id: 'pt_s1', skill: 'speaking', topic: 'introductions', level: 'A2', type: 'speaking',
          question: 'Introduce yourself: say your name, what you do (or study), and describe your typical day at work or school.',
          answer: 'Hello, my name is Lan. I work as a marketing assistant. My day usually starts at 8 a.m. I answer emails, join team meetings, and prepare content for social media. In the afternoon I meet customers or write reports.',
          explanation: 'Câu trả lời tốt có giới thiệu bản thân, mô tả công việc/học tập và một ngày điển hình bằng câu rõ ràng, mạch lạc.',
        },
      ],
    },
  ],
};
