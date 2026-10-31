import type { VocabSet, VocabCard, CEFRLevel } from '@/types';

// Bộ từ vựng mẫu: tiếng Anh công việc dùng chung cho mọi ngành.
// Nội dung theo ngành cụ thể do giáo viên/admin thêm sau.
type Row = [term: string, ipa: string, definition: string, definitionVi: string, example: string, exampleVi: string];

function makeSet(
  id: string, title: string, titleVi: string, topic: string, description: string, icon: string, level: CEFRLevel, rows: Row[]
): VocabSet {
  const cards: VocabCard[] = rows.map(([term, ipa, definition, definitionVi, example, exampleVi]) => ({
    id: `vc_${id.replace('set_', '')}_${term.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    term,
    pronunciation: ipa,
    definition,
    definition_vi: definitionVi,
    example,
    example_vi: exampleVi,
    topic,
    level,
  }));
  return { id, title, title_vi: titleVi, topic, description, card_count: cards.length, icon, cards };
}

export const mockVocabSets: VocabSet[] = [
  makeSet('set_introductions', 'Introductions at Work', 'Giới thiệu bản thân & đồng nghiệp', 'introductions',
    'Từ vựng để giới thiệu bản thân, vai trò và đội nhóm của bạn', '🤝', 'A2', [
      ['colleague', '/ˈkɒliːɡ/', 'A person you work with.', 'Đồng nghiệp.', 'Let me introduce you to my colleague, Mai.', 'Để mình giới thiệu bạn với đồng nghiệp của mình, Mai.'],
      ['department', '/dɪˈpɑːtmənt/', 'A section of a company that has a specific function.', 'Phòng/ban trong công ty.', 'I work in the marketing department.', 'Tôi làm ở phòng marketing.'],
      ['position', '/pəˈzɪʃn/', 'The job or role that someone has in a company.', 'Vị trí, chức vụ.', 'She applied for the position of accountant.', 'Cô ấy ứng tuyển vị trí kế toán.'],
      ['responsible for', '/rɪˈspɒnsəbl fɔː/', 'Having the duty to deal with something.', 'Chịu trách nhiệm về.', 'I am responsible for customer support.', 'Tôi chịu trách nhiệm về hỗ trợ khách hàng.'],
      ['experience', '/ɪkˈspɪəriəns/', 'Knowledge or skill gained from doing a job.', 'Kinh nghiệm.', 'He has five years of experience in sales.', 'Anh ấy có năm năm kinh nghiệm bán hàng.'],
      ['team', '/tiːm/', 'A group of people who work together.', 'Đội nhóm.', 'Our team has eight members.', 'Nhóm của chúng tôi có tám thành viên.'],
      ['manager', '/ˈmænɪdʒə/', 'A person who is in charge of a team or department.', 'Quản lý.', 'My manager is very supportive.', 'Quản lý của tôi rất hỗ trợ.'],
      ['pleased to meet you', '/pliːzd tə miːt juː/', 'A polite phrase used when meeting someone for the first time.', 'Rất vui được gặp bạn.', 'Hello, I am Lan. Pleased to meet you.', 'Xin chào, tôi là Lan. Rất vui được gặp bạn.'],
    ]),
  makeSet('set_office', 'Office & Schedule', 'Văn phòng & lịch làm việc', 'office',
    'Từ vựng về lịch hẹn, cuộc họp và sinh hoạt văn phòng', '🏢', 'A2', [
      ['schedule', '/ˈʃedjuːl/', 'A plan of times when things will happen.', 'Lịch trình, lịch làm việc.', 'My schedule is full on Tuesday.', 'Lịch của tôi kín vào thứ Ba.'],
      ['appointment', '/əˈpɔɪntmənt/', 'An arrangement to meet someone at a particular time.', 'Cuộc hẹn.', 'I have an appointment with a client at 3 p.m.', 'Tôi có cuộc hẹn với khách hàng lúc 3 giờ chiều.'],
      ['postpone', '/pəʊstˈpəʊn/', 'To move an event to a later time.', 'Hoãn lại.', 'We had to postpone the meeting until Friday.', 'Chúng tôi phải hoãn cuộc họp đến thứ Sáu.'],
      ['attend', '/əˈtend/', 'To be present at an event.', 'Tham dự.', 'All managers must attend the training.', 'Tất cả quản lý phải tham dự buổi tập huấn.'],
      ['agenda', '/əˈdʒendə/', 'A list of items to be discussed at a meeting.', 'Chương trình nghị sự.', 'Please check the agenda before the meeting.', 'Vui lòng xem chương trình họp trước cuộc họp.'],
      ['minutes', '/ˈmɪnɪts/', 'A written record of what was said at a meeting.', 'Biên bản cuộc họp.', 'Could you take the minutes today?', 'Hôm nay bạn ghi biên bản được không?'],
      ['available', '/əˈveɪləbl/', 'Free to do something or to meet someone.', 'Rảnh, có mặt.', 'Are you available on Monday morning?', 'Sáng thứ Hai bạn có rảnh không?'],
      ['reception', '/rɪˈsepʃn/', 'The place in a building where visitors check in.', 'Quầy lễ tân.', 'Please leave the package at reception.', 'Vui lòng để gói hàng ở quầy lễ tân.'],
    ]),
  makeSet('set_projects', 'Projects & Deadlines', 'Dự án & thời hạn', 'projects',
    'Từ vựng để trao đổi về công việc, tiến độ và thời hạn', '📋', 'B1', [
      ['deadline', '/ˈdedlaɪn/', 'The latest time by which something must be finished.', 'Hạn chót.', 'We must meet the deadline on Friday.', 'Chúng ta phải kịp hạn chót vào thứ Sáu.'],
      ['deliverable', '/dɪˈlɪvərəbl/', 'A product or result that must be provided at the end of a project.', 'Sản phẩm bàn giao.', 'The first deliverable is a design draft.', 'Sản phẩm bàn giao đầu tiên là bản thiết kế nháp.'],
      ['milestone', '/ˈmaɪlstəʊn/', 'An important point or stage in a project.', 'Cột mốc.', 'We reached an important milestone this week.', 'Tuần này chúng ta đạt một cột mốc quan trọng.'],
      ['budget', '/ˈbʌdʒɪt/', 'The amount of money available for a purpose.', 'Ngân sách.', 'The project is within budget.', 'Dự án nằm trong ngân sách.'],
      ['progress', '/ˈprəʊɡres/', 'Development toward a goal.', 'Tiến độ, sự tiến triển.', 'How is the progress on the report?', 'Tiến độ của báo cáo thế nào rồi?'],
      ['priority', '/praɪˈɒrəti/', 'Something that is more important than other things.', 'Ưu tiên.', 'Safety is our top priority.', 'An toàn là ưu tiên hàng đầu của chúng tôi.'],
      ['approve', '/əˈpruːv/', 'To officially agree to something.', 'Phê duyệt.', 'The director approved the plan.', 'Giám đốc đã phê duyệt kế hoạch.'],
      ['update', '/ˈʌpdeɪt/', 'The latest information about something.', 'Thông tin cập nhật.', 'Please send me an update by noon.', 'Vui lòng gửi cho tôi bản cập nhật trước buổi trưa.'],
    ]),
  makeSet('set_email', 'Email Essentials', 'Từ vựng email công việc', 'email',
    'Cụm từ thường dùng khi viết và đọc email công việc', '✉️', 'A2', [
      ['attachment', '/əˈtætʃmənt/', 'A file sent together with an email.', 'Tệp đính kèm.', 'Please find the attachment below.', 'Vui lòng xem tệp đính kèm bên dưới.'],
      ['regards', '/rɪˈɡɑːdz/', 'A polite word used to end a letter or email.', 'Trân trọng (kết thư).', 'Best regards, Minh', 'Trân trọng, Minh'],
      ['inquiry', '/ɪnˈkwaɪəri/', 'A question asking for information.', 'Yêu cầu thông tin, câu hỏi.', 'Thank you for your inquiry.', 'Cảm ơn bạn đã gửi yêu cầu thông tin.'],
      ['confirm', '/kənˈfɜːm/', 'To say that something is definitely true or arranged.', 'Xác nhận.', 'I am writing to confirm our meeting.', 'Tôi viết để xác nhận cuộc họp của chúng ta.'],
      ['forward', '/ˈfɔːwəd/', 'To send an email you received to another person.', 'Chuyển tiếp.', 'I will forward the message to the team.', 'Tôi sẽ chuyển tiếp thư cho cả nhóm.'],
      ['urgent', '/ˈɜːdʒənt/', 'Needing immediate attention.', 'Khẩn cấp.', 'This is an urgent request.', 'Đây là một yêu cầu khẩn cấp.'],
      ['follow up', '/ˈfɒləʊ ʌp/', 'To contact someone again about something.', 'Theo dõi, liên hệ lại.', 'I am following up on my previous email.', 'Tôi liên hệ lại về email trước của tôi.'],
      ['look forward to', '/lʊk ˈfɔːwəd tuː/', 'To feel pleased about something that will happen.', 'Mong đợi.', 'I look forward to hearing from you.', 'Tôi mong sớm nhận được phản hồi của bạn.'],
    ]),
  makeSet('set_customer', 'Customer Service', 'Dịch vụ khách hàng', 'customer',
    'Từ vựng để xử lý yêu cầu và khiếu nại của khách hàng', '🎧', 'B1', [
      ['complaint', '/kəmˈpleɪnt/', 'A statement that something is wrong or not satisfactory.', 'Khiếu nại.', 'We received a complaint about the delay.', 'Chúng tôi nhận được khiếu nại về sự chậm trễ.'],
      ['refund', '/ˈriːfʌnd/', 'Money that is paid back to a customer.', 'Hoàn tiền.', 'You can request a full refund within 30 days.', 'Bạn có thể yêu cầu hoàn tiền đầy đủ trong 30 ngày.'],
      ['apologize', '/əˈpɒlədʒaɪz/', 'To say you are sorry.', 'Xin lỗi.', 'We apologize for the inconvenience.', 'Chúng tôi xin lỗi vì sự bất tiện.'],
      ['resolve', '/rɪˈzɒlv/', 'To find a solution to a problem.', 'Giải quyết.', 'We will resolve the issue today.', 'Chúng tôi sẽ giải quyết vấn đề trong hôm nay.'],
      ['warranty', '/ˈwɒrənti/', 'A written promise to repair or replace a product.', 'Bảo hành.', 'The laptop has a two-year warranty.', 'Chiếc laptop được bảo hành hai năm.'],
      ['feedback', '/ˈfiːdbæk/', 'Comments about how well something was done.', 'Phản hồi, góp ý.', 'Thank you for your feedback.', 'Cảm ơn bạn đã góp ý.'],
      ['assist', '/əˈsɪst/', 'To help someone.', 'Hỗ trợ.', 'How may I assist you today?', 'Tôi có thể hỗ trợ gì cho bạn hôm nay?'],
      ['escalate', '/ˈeskəleɪt/', 'To pass a problem to a more senior person.', 'Chuyển lên cấp cao hơn.', 'I will escalate this case to my supervisor.', 'Tôi sẽ chuyển trường hợp này lên cấp trên.'],
    ]),
];
