// Nội dung bài học mẫu (giảng dạy + câu hỏi ôn cuối bài): tiếng Anh công việc dùng chung cho mọi ngành.
// Dùng khi seed để /learn/[lessonId] có nội dung thay vì rỗng. Nội dung theo ngành cụ thể do admin upload.

interface SeedQuestion {
  skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary';
  topic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching' | 'essay' | 'speaking';
  question: string;
  options?: string[];
  passage?: string;
  answer: string | string[];
  explanation: string;
}

interface SeedLessonContent {
  content: string;
  questions: SeedQuestion[];
}

export const LESSON_CONTENT: Record<string, SeedLessonContent> = {
  lesson_1_1: {
    content: `## Giới thiệu bản thân & đồng nghiệp

Khi gặp đồng nghiệp hoặc đối tác mới, bạn thường cần giới thiệu **tên, vị trí, phòng ban** và công việc bạn phụ trách. Dưới đây là các mẫu câu thông dụng nhất.

**1. Giới thiệu bản thân**
- "Hi, I'm Lan. I work in the **marketing department**."
- "I'm responsible for **customer support**."
- "I have three years of **experience** in sales."

**2. Giới thiệu người khác**
- "Let me introduce you to my **colleague**, Minh."
- "This is Mr. Park, our **manager**."

**3. Đáp lại lời giới thiệu**
- "**Pleased to meet you.**" / "Nice to meet you."
- "I've heard a lot about your team."

**Ghi nhớ nhanh:**
| Tiếng Anh | Nghĩa |
|---|---|
| colleague | đồng nghiệp |
| department | phòng/ban |
| position | vị trí, chức vụ |
| responsible for | chịu trách nhiệm về |
| team | đội nhóm |`,
    questions: [
      {
        skill: 'vocabulary', topic: 'introductions', level: 'A2', type: 'multiple_choice',
        question: 'Which sentence introduces a colleague politely?',
        options: ['Let me introduce you to my colleague, Minh.', 'This one is Minh, he work here.', 'Meet Minh now.', 'Minh is introduce.'],
        answer: 'Let me introduce you to my colleague, Minh.',
        explanation: '"Let me introduce you to..." là mẫu câu lịch sự, đúng ngữ pháp để giới thiệu một người.',
      },
      {
        skill: 'vocabulary', topic: 'introductions', level: 'A2', type: 'fill_blank',
        question: 'I am ______ for customer support. (Chịu trách nhiệm về)',
        answer: ['responsible', 'Responsible'],
        explanation: '"responsible for" nghĩa là chịu trách nhiệm về một việc nào đó.',
      },
      {
        skill: 'vocabulary', topic: 'introductions', level: 'A2', type: 'true_false',
        question: '"Department" means a section of a company with a specific function.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'Department là phòng/ban trong công ty, ví dụ marketing department, finance department.',
      },
    ],
  },
  lesson_1_2: {
    content: `## Nghe: Cuộc gọi đặt lịch hẹn

Trong bài nghe này, bạn sẽ nghe một cuộc gọi ngắn để đặt và đổi lịch hẹn. Hãy chú ý các thông tin: **ai gọi, muốn gì, ngày giờ nào**.

**Mẹo nghe hiểu:**
1. Đọc câu hỏi trước khi nghe để biết cần chú ý thông tin nào.
2. Ghi lại **con số, ngày, giờ** — đây thường là đáp án.
3. Nghe lại 2 đến 3 lần với tốc độ chậm (0.75x), sau đó thử tốc độ thường.

**Cụm từ thường gặp trong lịch hẹn:**
- "I'd like to **make an appointment**."
- "Could we **reschedule** for Thursday?"
- "Are you **available** at 10 a.m.?"
- "Let me **check my schedule**."`,
    questions: [
      {
        skill: 'listening', topic: 'office', level: 'A2', type: 'multiple_choice',
        passage: `Receptionist: Good morning, Greenfield Clinic. How can I help you?
Caller: Hi, this is Anna Tran. I have an appointment on Tuesday at 2 p.m., but I need to change it.
Receptionist: Of course. Are you available on Wednesday?
Caller: Wednesday morning would be perfect, maybe around 10.
Receptionist: Let me check. Yes, 10 a.m. is available. I'll move your appointment to Wednesday at 10.
Caller: Great, thank you.`,
        question: 'Why does Anna call the clinic?',
        options: ['To cancel her job', 'To change her appointment', 'To ask for a refund', 'To get directions'],
        answer: 'To change her appointment',
        explanation: 'Anna nói "I have an appointment on Tuesday... but I need to change it" — cô ấy gọi để đổi lịch hẹn.',
      },
      {
        skill: 'listening', topic: 'office', level: 'A2', type: 'multiple_choice',
        passage: `Receptionist: Good morning, Greenfield Clinic. How can I help you?
Caller: Hi, this is Anna Tran. I have an appointment on Tuesday at 2 p.m., but I need to change it.
Receptionist: Of course. Are you available on Wednesday?
Caller: Wednesday morning would be perfect, maybe around 10.
Receptionist: Let me check. Yes, 10 a.m. is available. I'll move your appointment to Wednesday at 10.
Caller: Great, thank you.`,
        question: 'What is the new time of the appointment?',
        options: ['Tuesday at 2 p.m.', 'Wednesday at 10 a.m.', 'Wednesday at 2 p.m.', 'Thursday at 10 a.m.'],
        answer: 'Wednesday at 10 a.m.',
        explanation: 'Lịch hẹn được chuyển sang "Wednesday at 10".',
      },
      {
        skill: 'listening', topic: 'office', level: 'A2', type: 'true_false',
        passage: `Receptionist: Good morning, Greenfield Clinic. How can I help you?
Caller: Hi, this is Anna Tran. I have an appointment on Tuesday at 2 p.m., but I need to change it.
Receptionist: Of course. Are you available on Wednesday?
Caller: Wednesday morning would be perfect, maybe around 10.
Receptionist: Let me check. Yes, 10 a.m. is available. I'll move your appointment to Wednesday at 10.
Caller: Great, thank you.`,
        question: 'The receptionist says that 10 a.m. on Wednesday is not available.',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'Lễ tân nói "Yes, 10 a.m. is available" nên khung giờ này còn trống.',
      },
    ],
  },
  lesson_1_3: {
    content: `## Từ vựng: Văn phòng & lịch làm việc

Các từ dưới đây xuất hiện thường xuyên khi bạn sắp xếp công việc và tham gia họp.

**1. Lên lịch**
- **schedule** (n./v.): lịch trình / lên lịch. "My schedule is full on Tuesday."
- **appointment**: cuộc hẹn. "I have an appointment at 3 p.m."
- **postpone**: hoãn lại. "We postponed the meeting until Friday."
- **available**: rảnh, có mặt. "Are you available on Monday?"

**2. Cuộc họp**
- **attend**: tham dự.
- **agenda**: chương trình nghị sự (danh sách nội dung sẽ bàn).
- **minutes**: biên bản cuộc họp.

**Lưu ý:** "attend" đi thẳng với danh từ, không dùng "attend to" khi nói về tham dự họp. Nói "attend a meeting", không nói "attend to a meeting".`,
    questions: [
      {
        skill: 'vocabulary', topic: 'office', level: 'A2', type: 'multiple_choice',
        question: 'What does "postpone" mean?',
        options: ['To cancel forever', 'To move to a later time', 'To start early', 'To repeat'],
        answer: 'To move to a later time',
        explanation: 'Postpone = hoãn sang thời điểm muộn hơn, khác với cancel (hủy hẳn).',
      },
      {
        skill: 'vocabulary', topic: 'office', level: 'A2', type: 'fill_blank',
        question: 'Please check the ______ before the meeting. (chương trình nghị sự)',
        answer: ['agenda', 'Agenda'],
        explanation: 'Agenda là danh sách các nội dung sẽ được thảo luận trong cuộc họp.',
      },
      {
        skill: 'vocabulary', topic: 'office', level: 'A2', type: 'multiple_choice',
        question: 'Who usually writes the "minutes" of a meeting?',
        options: ['The person who records what was discussed', 'The security guard', 'The customer', 'The printer'],
        answer: 'The person who records what was discussed',
        explanation: 'Minutes là biên bản ghi lại nội dung đã bàn và quyết định của cuộc họp.',
      },
    ],
  },
  lesson_1_4: {
    content: `## Nghe: Thông báo thay đổi lịch

Bài nghe này là một thông báo nội bộ về việc đổi lịch họp và hạn chót. Hãy nghe để nắm **cái gì thay đổi**, **thay đổi thế nào** và **ai cần làm gì**.

**Từ khóa báo hiệu thay đổi:**
- "Due to..." (do, vì...)
- "has been moved to / postponed until..." (được dời sang / hoãn đến...)
- "Please note that..." (xin lưu ý rằng...)
- "instead of" (thay vì)

**Kỹ thuật:** nghe lần 1 để hiểu ý chính, lần 2 để ghi chi tiết ngày giờ.`,
    questions: [
      {
        skill: 'listening', topic: 'projects', level: 'B1', type: 'multiple_choice',
        passage: `Good afternoon, everyone. Please note that tomorrow's project meeting has been moved from 9 a.m. to 11 a.m. because the meeting room is being repaired. The deadline for the monthly report is still Friday, but please send your drafts to Ms. Hoa by Wednesday evening so she can review them. Thank you.`,
        question: 'Why has the meeting been moved?',
        options: ['The manager is on holiday', 'The meeting room is being repaired', 'The project was cancelled', 'Nobody is available'],
        answer: 'The meeting room is being repaired',
        explanation: 'Thông báo nói "because the meeting room is being repaired".',
      },
      {
        skill: 'listening', topic: 'projects', level: 'B1', type: 'multiple_choice',
        passage: `Good afternoon, everyone. Please note that tomorrow's project meeting has been moved from 9 a.m. to 11 a.m. because the meeting room is being repaired. The deadline for the monthly report is still Friday, but please send your drafts to Ms. Hoa by Wednesday evening so she can review them. Thank you.`,
        question: 'When should staff send their drafts to Ms. Hoa?',
        options: ['By Tuesday morning', 'By Wednesday evening', 'By Thursday noon', 'By Friday'],
        answer: 'By Wednesday evening',
        explanation: 'Thông báo yêu cầu gửi bản nháp cho Ms. Hoa "by Wednesday evening".',
      },
      {
        skill: 'listening', topic: 'projects', level: 'B1', type: 'true_false',
        passage: `Good afternoon, everyone. Please note that tomorrow's project meeting has been moved from 9 a.m. to 11 a.m. because the meeting room is being repaired. The deadline for the monthly report is still Friday, but please send your drafts to Ms. Hoa by Wednesday evening so she can review them. Thank you.`,
        question: 'The deadline for the monthly report has changed.',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'Thông báo nói hạn chót báo cáo "is still Friday" — không thay đổi.',
      },
    ],
  },
  lesson_1_5: {
    content: `## Từ vựng: Dự án & thời hạn

Khi trao đổi về công việc, bạn thường cần nói về **tiến độ, hạn chót và độ ưu tiên**.

**Từ vựng cốt lõi:**
- **deadline**: hạn chót. "We must meet the deadline."
- **deliverable**: sản phẩm/kết quả cần bàn giao.
- **milestone**: cột mốc quan trọng của dự án.
- **budget**: ngân sách.
- **progress**: tiến độ. "How is the progress on the report?"
- **priority**: việc ưu tiên.
- **approve**: phê duyệt.

**Mẫu câu hỏi thăm tiến độ:**
- "Are we on track to meet the deadline?"
- "Could you give me a quick **update**?"
- "This task is our top **priority**."`,
    questions: [
      {
        skill: 'vocabulary', topic: 'projects', level: 'B1', type: 'multiple_choice',
        question: 'What is a "deadline"?',
        options: ['The latest time something must be finished', 'A type of budget', 'A meeting room', 'A kind of report'],
        answer: 'The latest time something must be finished',
        explanation: 'Deadline là hạn chót phải hoàn thành công việc.',
      },
      {
        skill: 'vocabulary', topic: 'projects', level: 'B1', type: 'fill_blank',
        question: 'We reached an important ______ this week. (cột mốc)',
        answer: ['milestone', 'Milestone'],
        explanation: 'Milestone là một cột mốc quan trọng trong tiến trình dự án.',
      },
      {
        skill: 'vocabulary', topic: 'projects', level: 'B1', type: 'true_false',
        question: '"Approve" means to officially agree to something.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'Approve = phê duyệt, chính thức đồng ý.',
      },
    ],
  },
  lesson_1_6: {
    content: `## Ôn tập chặng 1: Từ vựng email & văn phòng

Bài ôn tập này tổng hợp từ vựng bạn đã gặp ở chặng 1 cùng các cụm từ email thông dụng.

**Cụm từ email cần nhớ:**
- **Please find the attachment.** — Vui lòng xem tệp đính kèm.
- **I am writing to confirm...** — Tôi viết để xác nhận...
- **Thank you for your inquiry.** — Cảm ơn bạn đã hỏi thông tin.
- **I will follow up with you.** — Tôi sẽ liên hệ lại với bạn.
- **I look forward to hearing from you.** — Mong sớm nhận được phản hồi.

**Kết thư:** Best regards / Kind regards / Sincerely.`,
    questions: [
      {
        skill: 'vocabulary', topic: 'email', level: 'A2', type: 'multiple_choice',
        question: 'Which phrase is the most suitable to end a formal email?',
        options: ['See ya!', 'Best regards,', 'Whatever.', 'Bye bye lol'],
        answer: 'Best regards,',
        explanation: '"Best regards" là cách kết thư lịch sự, phù hợp email công việc.',
      },
      {
        skill: 'vocabulary', topic: 'email', level: 'A2', type: 'fill_blank',
        question: 'Please find the ______ below. (tệp đính kèm)',
        answer: ['attachment', 'Attachment'],
        explanation: 'Attachment là tệp được gửi kèm email.',
      },
      {
        skill: 'vocabulary', topic: 'email', level: 'A2', type: 'multiple_choice',
        question: '"I look forward to hearing from you" means:',
        options: ['I am angry with you', 'I hope you will reply soon', 'I cannot hear you', 'I will call you tomorrow'],
        answer: 'I hope you will reply soon',
        explanation: 'Đây là cách kết thúc email lịch sự, thể hiện mong nhận được phản hồi.',
      },
    ],
  },
  lesson_2_1: {
    content: `## Đọc: Email công việc

Một email công việc thường có cấu trúc rõ ràng. Nắm cấu trúc giúp bạn đọc nhanh và tìm đúng thông tin.

**Cấu trúc email:**
1. **Subject** — chủ đề, cho biết nội dung chính.
2. **Greeting** — lời chào ("Dear Mr. Lee,").
3. **Purpose** — mục đích ("I am writing to...").
4. **Details** — chi tiết (ngày giờ, yêu cầu).
5. **Closing** — lời kết và hành động tiếp theo ("Please let me know...").

**Kỹ thuật đọc nhanh:** đọc Subject và câu đầu để biết mục đích, sau đó tìm **ngày, số, tên, yêu cầu hành động**.`,
    questions: [
      {
        skill: 'reading', topic: 'email', level: 'B1', type: 'multiple_choice',
        passage: `Subject: Request to reschedule project review

Dear Ms. Carter,

I am writing to ask if we could move our project review from Monday, 3 June, to Wednesday, 5 June, at the same time (2 p.m.). Our team needs two more days to finish the final test results.

I have attached the current status report for your reference. If Wednesday is not convenient, I am also available on Thursday morning.

Thank you for your understanding. I look forward to hearing from you.

Kind regards,
David Nguyen
Project Coordinator`,
        question: 'Why does David want to reschedule the review?',
        options: ['He is on holiday', 'His team needs more time to finish the test results', 'The report is lost', 'Ms. Carter is unavailable'],
        answer: 'His team needs more time to finish the test results',
        explanation: 'Email nêu rõ: "Our team needs two more days to finish the final test results."',
      },
      {
        skill: 'reading', topic: 'email', level: 'B1', type: 'multiple_choice',
        passage: `Subject: Request to reschedule project review

Dear Ms. Carter,

I am writing to ask if we could move our project review from Monday, 3 June, to Wednesday, 5 June, at the same time (2 p.m.). Our team needs two more days to finish the final test results.

I have attached the current status report for your reference. If Wednesday is not convenient, I am also available on Thursday morning.

Thank you for your understanding. I look forward to hearing from you.

Kind regards,
David Nguyen
Project Coordinator`,
        question: 'What alternative does David offer if Wednesday is not suitable?',
        options: ['Monday afternoon', 'Tuesday morning', 'Thursday morning', 'Friday at noon'],
        answer: 'Thursday morning',
        explanation: 'David viết "I am also available on Thursday morning".',
      },
    ],
  },
  lesson_2_2: {
    content: `## Viết: Email xác nhận cuộc họp

Một email xác nhận tốt cần **ngắn gọn, rõ ràng và đủ thông tin**: mục đích, thời gian, địa điểm, nội dung chính và yêu cầu phản hồi.

**Khung mẫu:**
> Subject: Confirmation of project meeting on [date]
>
> Dear [Name],
>
> I am writing to confirm our meeting on [day, date] at [time] in [place/online link]. We will discuss [topics].
>
> Please let me know if you need any changes.
>
> Best regards,
> [Your name]

**Mẹo:** dùng câu ngắn, mỗi đoạn một ý, và luôn có **một yêu cầu hành động** ở cuối (ví dụ: "Please confirm by Friday").`,
    questions: [
      {
        skill: 'writing', topic: 'email', level: 'A2', type: 'essay',
        question: 'Write a short email (50-80 words) to confirm a meeting with a colleague next Tuesday at 10 a.m. in Meeting Room 2. Mention the topic (the monthly report) and ask them to reply.',
        answer: 'Dear Minh, I am writing to confirm our meeting next Tuesday at 10 a.m. in Meeting Room 2. We will discuss the monthly report and the next steps. Please let me know if this time still works for you. Best regards, Lan',
        explanation: 'Bài viết tốt cần có lời chào, mục đích xác nhận, thời gian/địa điểm, chủ đề họp, yêu cầu phản hồi và lời kết lịch sự.',
      },
    ],
  },
  lesson_3_1: {
    content: `## Nói: Giới thiệu công việc của bạn

Trong cuộc họp hoặc khi gặp đối tác, bạn thường được hỏi "What do you do?". Hãy chuẩn bị câu trả lời **30 giây** gồm 3 phần.

**Công thức 3 phần:**
1. **Bạn là ai:** "I'm a project coordinator at Sunrise Company."
2. **Bạn làm gì:** "I'm responsible for planning tasks and tracking progress."
3. **Điểm nổi bật / mục tiêu:** "Right now, I'm working on a new customer app."

**Mẹo phát âm:**
- Nói chậm, rõ từng ý, ngắt nghỉ sau mỗi câu.
- Nhấn mạnh từ khóa: *coordinator*, *responsible*, *progress*.
- Nhìn vào người nghe và mỉm cười.

Hãy thu âm nhiều lần cho đến khi bạn cảm thấy tự tin.`,
    questions: [
      {
        skill: 'speaking', topic: 'introductions', level: 'A2', type: 'speaking',
        question: 'Introduce yourself in 3-4 sentences: say your name, your job (or major), what you are responsible for, and what you are working on now.',
        answer: 'Hello, my name is Lan. I am a marketing assistant at Sunrise Company. I am responsible for social media content and customer surveys. Right now, I am working on a new product campaign.',
        explanation: 'Câu trả lời tốt có tên, vị trí/ngành, trách nhiệm chính và việc đang làm; nói rõ ràng, mạch lạc, đủ ý.',
      },
    ],
  },
};
