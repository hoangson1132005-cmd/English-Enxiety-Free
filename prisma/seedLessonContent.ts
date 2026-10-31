// Nội dung bài học thật (giảng dạy + câu hỏi ôn cuối bài) cho 4 bài demo gốc,
// dùng khi seed để /learn/[lessonId] có nội dung thay vì rỗng.

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
    content: `## Incoterms Cơ Bản: FOB, CIF, EXW

**Incoterms** (International Commercial Terms) là bộ quy tắc thương mại quốc tế do ICC ban hành, quy định rõ **trách nhiệm, chi phí và rủi ro** giữa người mua (Buyer) và người bán (Seller) trong quá trình giao hàng. Ba điều kiện phổ biến nhất bạn sẽ gặp hàng ngày trong logistics:

**1. EXW (Ex Works) — Giao tại xưởng**
Seller chỉ cần để hàng sẵn sàng tại xưởng/nhà máy của mình. Buyer chịu toàn bộ chi phí và rủi ro từ đó: bốc hàng, vận chuyển nội địa, thủ tục xuất khẩu, cước tàu quốc tế...
→ Đây là điều kiện **tối thiểu trách nhiệm cho Seller**, tối đa trách nhiệm cho Buyer.

**2. FOB (Free On Board) — Giao hàng qua lan can tàu**
Seller chịu trách nhiệm và chi phí cho đến khi hàng được xếp lên tàu tại cảng xuất (Port of Loading). Từ đó, rủi ro và cước tàu chính (ocean freight) chuyển sang Buyer.
→ Rất phổ biến trong xuất khẩu đường biển FCL.

**3. CIF (Cost, Insurance, Freight) — Giá đã gồm cước và bảo hiểm**
Seller chịu chi phí hàng hóa, cước tàu quốc tế **và** bảo hiểm hàng hóa đến cảng đích (Port of Discharge). Tuy vậy, rủi ro vẫn chuyển sang Buyer ngay khi hàng qua lan can tàu ở cảng xuất (giống FOB) — chỉ có chi phí là Seller trả thêm.

**Ghi nhớ nhanh:**
| Điều kiện | Ai trả cước tàu? | Ai trả bảo hiểm? | Rủi ro chuyển khi nào? |
|---|---|---|---|
| EXW | Buyer | Buyer | Tại xưởng Seller |
| FOB | Buyer | Buyer (tự mua nếu cần) | Khi hàng qua lan can tàu tại cảng xuất |
| CIF | Seller | Seller | Khi hàng qua lan can tàu tại cảng xuất |`,
    questions: [
      {
        skill: 'vocabulary', topic: 'incoterms', level: 'A2', type: 'multiple_choice',
        question: 'Under EXW terms, who is responsible for export customs clearance?',
        options: ['The Seller', 'The Buyer', 'The shipping line', 'The customs broker only'],
        answer: 'The Buyer',
        explanation: 'EXW là điều kiện trách nhiệm tối thiểu cho Seller — Buyer phải tự lo mọi thủ tục và chi phí từ xưởng của Seller, bao gồm cả thông quan xuất khẩu.',
      },
      {
        skill: 'vocabulary', topic: 'incoterms', level: 'A2', type: 'true_false',
        question: 'Under CIF terms, the seller must pay for both ocean freight and marine insurance.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'CIF = Cost, Insurance, Freight — Seller trả cả cước tàu (Freight) và bảo hiểm (Insurance) đến cảng đích.',
      },
      {
        skill: 'vocabulary', topic: 'incoterms', level: 'B1', type: 'fill_blank',
        question: 'Under FOB terms, risk transfers to the buyer once the goods pass the ship\'s ___ at the port of loading. (one word)',
        answer: 'rail',
        explanation: 'Thuật ngữ truyền thống "ship\'s rail" (lan can tàu) là điểm chuyển giao rủi ro theo FOB — dù Incoterms 2020 hiện mô tả là "on board" cho dễ hiểu hơn.',
      },
    ],
  },

  lesson_1_3: {
    content: `## Từ Vựng: Bill of Lading (Vận Đơn)

**Bill of Lading (B/L)** là chứng từ quan trọng nhất trong vận tải biển. Để đọc hiểu một vận đơn, bạn cần nắm các thuật ngữ sau:

**Các bên liên quan:**
- **Shipper**: Người gửi hàng (thường là Seller/Exporter)
- **Consignee**: Người nhận hàng ghi trên B/L (có quyền nhận hàng tại cảng đích)
- **Notify Party**: Bên được thông báo khi hàng đến (thường là đại lý/broker của Consignee)

**Thông tin lô hàng:**
- **Port of Loading (POL)**: Cảng xếp hàng (cảng đi)
- **Port of Discharge (POD)**: Cảng dỡ hàng (cảng đến)
- **Gross Weight / Net Weight**: Trọng lượng cả bì / trọng lượng tịnh (không tính bao bì)
- **Measurement (CBM)**: Thể tích hàng hóa (mét khối)

**Phân loại B/L quan trọng:**
- **Original B/L (vận đơn gốc)**: Có giá trị sở hữu hàng hóa, cần nộp để nhận hàng.
- **Surrendered/Telex Release B/L**: B/L gốc đã được "giải phóng" tại cảng đi, Consignee chỉ cần bản copy để nhận hàng — nhanh hơn, phổ biến khi hai bên tin tưởng nhau.
- **Freight Prepaid**: Cước đã trả trước khi tàu chạy (thường đi kèm CIF/CFR).
- **Freight Collect**: Cước trả tại cảng đích (thường đi kèm FOB).`,
    questions: [
      {
        skill: 'vocabulary', topic: 'documents', level: 'B1', type: 'multiple_choice',
        question: 'Which party is authorized to claim the cargo at the destination port, as named on the Bill of Lading?',
        options: ['Shipper', 'Consignee', 'Notify Party', 'Carrier'],
        answer: 'Consignee',
        explanation: 'Consignee là người nhận hàng được ghi danh trên B/L — bên có quyền nhận hàng tại cảng đích (khi xuất trình B/L gốc, nếu không phải Surrendered B/L).',
      },
      {
        skill: 'vocabulary', topic: 'documents', level: 'B1', type: 'multiple_choice',
        question: 'What does "Gross Weight" refer to on a Bill of Lading?',
        options: ['Weight of cargo only, excluding packaging', 'Total weight including cargo and packaging', 'Volume of cargo in cubic meters', 'Weight of the empty container'],
        answer: 'Total weight including cargo and packaging',
        explanation: 'Gross Weight = trọng lượng cả bì, tức bao gồm cả hàng hóa và bao bì đóng gói, khác với Net Weight (chỉ tính hàng hóa).',
      },
      {
        skill: 'vocabulary', topic: 'documents', level: 'B1', type: 'true_false',
        question: 'A "Surrendered B/L" requires the consignee to present the original paper Bill of Lading to pick up the cargo.',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'Surrendered (Telex Release) B/L nghĩa là bản gốc đã được giải phóng tại cảng đi, nên Consignee chỉ cần bản copy, không cần B/L gốc để nhận hàng.',
      },
    ],
  },

  lesson_1_4: {
    content: `## Nghe: Thông Báo ETA Và Delay

Trong vận tải biển, lịch trình tàu thường thay đổi do thời tiết, tắc nghẽn cảng, hoặc lý do vận hành. Forwarder/hãng tàu sẽ gửi thông báo cập nhật **ETA** (Estimated Time of Arrival) cho khách hàng. Hãy đọc kỹ thông báo mẫu dưới đây như một bài luyện nghe/đọc hiểu.

**Từ vựng quan trọng:**
- **ETA (Estimated Time of Arrival)**: Thời gian dự kiến tàu đến
- **ETD (Estimated Time of Departure)**: Thời gian dự kiến tàu khởi hành
- **Delay / Vessel delay**: Sự chậm trễ của tàu
- **Congestion**: Tắc nghẽn (cảng, kênh đào...)
- **Rollover**: Hàng bị "rớt" khỏi chuyến tàu dự kiến, phải chuyển sang chuyến sau
- **Revised schedule**: Lịch trình đã được điều chỉnh

**Thông báo mẫu:**

Subject: URGENT — Schedule Update for Booking MSCU-7734 / Vessel EVER GIVEN

Dear Valued Customer,

We regret to inform you that vessel EVER GIVEN, originally scheduled to depart Cat Lai Port on November 18, has experienced a delay due to port congestion at the transshipment hub in Singapore.

Revised schedule:
- Original ETD: November 18
- New ETD: November 22 (4 days delay)
- Original ETA Rotterdam: December 20
- New ETA Rotterdam: December 25

Please note this delay does not affect the booking confirmation or container allocation. We apologize for any inconvenience and will keep you updated on further changes.

Best regards,
Customer Service Team — Global Shipping Lines`,
    questions: [
      {
        skill: 'listening', topic: 'shipping', level: 'B1', type: 'multiple_choice',
        question: 'What is the reason given for the vessel delay?',
        options: ['Bad weather at sea', 'Port congestion at the transshipment hub', 'Mechanical failure of the vessel', 'Missing shipping documents'],
        answer: 'Port congestion at the transshipment hub',
        explanation: 'Thông báo ghi rõ: "experienced a delay due to port congestion at the transshipment hub in Singapore."',
      },
      {
        skill: 'listening', topic: 'shipping', level: 'B1', type: 'multiple_choice',
        question: 'What is the new ETA at the destination port (Rotterdam)?',
        options: ['November 18', 'November 22', 'December 20', 'December 25'],
        answer: 'December 25',
        explanation: 'Lịch trình mới cho thấy New ETA Rotterdam được dời từ December 20 sang December 25.',
      },
      {
        skill: 'listening', topic: 'shipping', level: 'B1', type: 'true_false',
        question: 'The delay affects the customer\'s original booking confirmation and container allocation.',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'Thông báo nêu rõ: "this delay does not affect the booking confirmation or container allocation" — chỉ lịch trình tàu thay đổi, booking vẫn giữ nguyên.',
      },
    ],
  },

  lesson_1_5: {
    content: `## Từ Vựng: FCL vs LCL, Demurrage

**FCL (Full Container Load) — Hàng nguyên container**
Chủ hàng thuê nguyên một container để chở riêng hàng của mình, không ghép chung với hàng của người khác. Phù hợp với lô hàng lớn, cần an toàn và nhanh hơn vì không phải đóng/rút ghép hàng tại cảng.

**LCL (Less than Container Load) — Hàng ghép container**
Hàng hóa không đủ để lấp đầy một container, nên được ghép chung với hàng của nhiều chủ hàng khác trong cùng một container (do công ty consol/forwarder tổ chức). Chi phí rẻ hơn cho lô hàng nhỏ, nhưng thời gian xử lý tại cảng (đóng/rút hàng - CFS) lâu hơn.

**Demurrage vs Detention — Hai loại phí lưu container dễ nhầm:**
- **Demurrage**: Phí phát sinh khi container **còn nằm trong cảng/bãi** quá thời hạn miễn phí (free time) mà chưa được kéo ra ngoài.
- **Detention**: Phí phát sinh khi container **đã được kéo ra ngoài cảng** (về kho riêng) nhưng chưa trả container rỗng lại cho hãng tàu đúng hạn.

**Ghi nhớ nhanh:** Demurrage = phí "giam" container TRONG cảng. Detention = phí "giam" container NGOÀI cảng (tại kho khách hàng).`,
    questions: [
      {
        skill: 'vocabulary', topic: 'freight', level: 'B1', type: 'multiple_choice',
        question: 'Which shipment type is best suited for a small cargo load that does not fill an entire container?',
        options: ['FCL', 'LCL', 'Breakbulk', 'RORO'],
        answer: 'LCL',
        explanation: 'LCL (Less than Container Load) phù hợp cho lô hàng nhỏ, được ghép chung với hàng của nhiều chủ hàng khác trong một container.',
      },
      {
        skill: 'vocabulary', topic: 'freight', level: 'B1', type: 'multiple_choice',
        question: 'Demurrage charges apply when a container is:',
        options: ['Still inside the port/terminal beyond free time', 'Taken out of the port but not yet returned empty', 'Damaged during ocean transit', 'Lost at the transshipment port'],
        answer: 'Still inside the port/terminal beyond free time',
        explanation: 'Demurrage là phí phát sinh khi container còn nằm trong cảng/bãi quá thời hạn miễn phí (free time), khác với Detention (container đã ra ngoài cảng).',
      },
      {
        skill: 'vocabulary', topic: 'freight', level: 'B1', type: 'fill_blank',
        question: '___ charges apply when a container has been taken out of the port to the customer\'s warehouse but not returned empty on time. (one word)',
        answer: 'Detention',
        explanation: 'Detention = phí "giam" container ngoài cảng — phát sinh khi khách hàng giữ container quá lâu tại kho riêng mà chưa trả rỗng cho hãng tàu.',
      },
    ],
  },

  lesson_1_6: {
    content: `## Kiểm Tra Cuối Chặng 1: Nền Tảng Logistics Tiếng Anh

Chúc mừng bạn đã hoàn thành các bài học về **Incoterms, Bill of Lading, thông báo lịch trình tàu, và FCL/LCL/Demurrage**! Đây là bài kiểm tra tổng hợp để ôn lại toàn bộ kiến thức của Chặng 1 trước khi chuyển sang Chặng 2 (Chứng từ & Giao tiếp Email).

Hãy trả lời các câu hỏi dưới đây — đây là tổng hợp các tình huống và thuật ngữ quan trọng nhất mà bạn đã học.`,
    questions: [
      {
        skill: 'vocabulary', topic: 'incoterms', level: 'B1', type: 'multiple_choice',
        question: 'Which Incoterm places the LEAST responsibility on the seller?',
        options: ['EXW', 'FOB', 'CIF', 'DDP'],
        answer: 'EXW',
        explanation: 'EXW (Ex Works) là điều kiện trách nhiệm tối thiểu cho Seller — chỉ cần để hàng sẵn sàng tại xưởng.',
      },
      {
        skill: 'vocabulary', topic: 'incoterms', level: 'B1', type: 'true_false',
        question: 'Under CIF, the seller is responsible for paying marine insurance.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'CIF = Cost, Insurance, Freight — Seller phải trả bảo hiểm hàng hóa đến cảng đích.',
      },
      {
        skill: 'vocabulary', topic: 'documents', level: 'B1', type: 'multiple_choice',
        question: 'On a Bill of Lading, who is the party named as authorized to receive the cargo at destination?',
        options: ['Shipper', 'Consignee', 'Carrier', 'Notify Party'],
        answer: 'Consignee',
        explanation: 'Consignee là bên được ghi danh trên B/L có quyền nhận hàng tại cảng đích.',
      },
      {
        skill: 'listening', topic: 'shipping', level: 'B1', type: 'multiple_choice',
        question: 'If a vessel schedule update says "New ETA: December 25 (revised from December 20)", what happened?',
        options: ['The vessel arrived earlier than planned', 'The vessel is delayed by 5 days', 'The booking was cancelled', 'The cargo was rolled over to another vessel'],
        answer: 'The vessel is delayed by 5 days',
        explanation: 'ETA bị dời từ December 20 sang December 25, tức là trễ 5 ngày so với kế hoạch ban đầu.',
      },
      {
        skill: 'vocabulary', topic: 'freight', level: 'B1', type: 'multiple_choice',
        question: 'A customer keeps a container at their own warehouse for 3 extra days after the free time without returning it empty. What fee applies?',
        options: ['Demurrage', 'Detention', 'THC (Terminal Handling Charge)', 'CFS fee'],
        answer: 'Detention',
        explanation: 'Vì container đã được kéo ra khỏi cảng về kho riêng của khách hàng, phí trễ hạn áp dụng ở đây là Detention (không phải Demurrage, vốn chỉ áp dụng khi container còn trong cảng).',
      },
    ],
  },

  lesson_1_2: {
    content: `## Luyện Nghe: Cuộc Gọi Booking Container

Trong logistics, rất nhiều giao dịch đặt chỗ (booking) container được thực hiện qua điện thoại giữa **Shipper** (chủ hàng) và **Forwarder** (đại lý giao nhận). Hãy đọc kỹ đoạn hội thoại mẫu dưới đây như một bài luyện nghe/đọc hiểu — đây là tình huống bạn sẽ thường gặp khi làm việc thực tế.

**Từ vựng quan trọng:**
- **FCL booking**: đặt chỗ nguyên container (Full Container Load)
- **40HC**: container 40 feet cao (High Cube)
- **FOB (Free On Board)**: người mua chịu cước tàu chính từ cảng xếp hàng
- **ETD (Estimated Time of Departure)**: ngày dự kiến tàu khởi hành
- **Cut-off date**: hạn chót nộp chứng từ/vận đơn nháp trước khi tàu chạy

**Hội thoại mẫu:**

[Phone rings...]
Forwarder (Sarah): Good morning, Pacific Freight Lines, Sarah speaking. How may I assist you today?
Shipper (Minh): Hello Sarah, this is Minh from Mekong Furniture Exports. I would like to request an FCL booking for our upcoming shipment to Hamburg, Germany.
Sarah: Good morning Mr. Minh! Certainly. Could you provide the container specifications and cargo details?
Minh: Yes, we need one 40-foot high cube container (1 x 40HC). The commodity is wooden dining tables, total gross weight approximately 18,500 kilograms.
Sarah: Noted. And what are your requested departure dates and Incoterms?
Minh: The shipment is on FOB Ho Chi Minh City terms, so the buyer in Germany will cover the ocean freight. We are targeting an ETD around November 15 from Cat Lai Port.
Sarah: Perfect. We have vessel MSC AURORA departing November 15, with ETA Hamburg on December 22. The documentation cut-off date is November 10 at 5:00 PM.
Minh: That works well with our production schedule. Please send us the booking confirmation note via email.
Sarah: Will do immediately. Thank you Mr. Minh!`,
    questions: [
      {
        skill: 'listening', topic: 'booking', level: 'B1', type: 'multiple_choice',
        question: 'What type and quantity of containers is the shipper requesting?',
        options: ['1 x 20GP container', '2 x 40HC containers', '1 x 40HC container', '1 x 45HC container'],
        answer: '1 x 40HC container',
        explanation: 'Trong hội thoại, Minh nói: "we need one 40-foot high cube container" — tức 1 x 40HC.',
      },
      {
        skill: 'listening', topic: 'booking', level: 'B1', type: 'multiple_choice',
        question: 'Under the agreed FOB terms, who will be paying the ocean freight?',
        options: ['The buyer in Germany', 'The seller in Vietnam', 'The shipping line directly', 'Split 50/50 between both parties'],
        answer: 'The buyer in Germany',
        explanation: 'Theo điều kiện FOB, người mua (ở Đức) chỉ định hãng tàu và trả cước vận chuyển chính.',
      },
      {
        skill: 'listening', topic: 'shipping', level: 'B1', type: 'multiple_choice',
        question: 'What is the cut-off date for submitting the shipping documents?',
        options: ['November 8, 2024', 'November 10, 2024', 'November 15, 2024', 'December 22, 2024'],
        answer: 'November 10, 2024',
        explanation: 'Sarah xác nhận: "the documentation cut-off date is November 10 at 5:00 PM."',
      },
    ],
  },

  lesson_2_1: {
    content: `## Đọc Hiểu: Vận Đơn Đường Biển (Bill of Lading)

**Bill of Lading (B/L)** là chứng từ quan trọng nhất trong vận tải biển với 3 chức năng:
1. **Receipt (Biên lai)**: Xác nhận hãng tàu đã nhận hàng
2. **Contract of Carriage (Hợp đồng vận chuyển)**: Bằng chứng về thỏa thuận vận chuyển
3. **Document of Title (Chứng từ sở hữu)**: Người cầm B/L gốc có quyền nhận hàng

Dưới đây là một vận đơn mẫu. Hãy đọc kỹ các trường thông tin: Shipper, Consignee, Notify Party, Vessel/Voyage, Port of Loading/Discharge, và điều khoản cước phí (Freight & Charges) trước khi trả lời câu hỏi bên dưới.`,
    questions: [
      {
        skill: 'reading', topic: 'documents', level: 'B1', type: 'multiple_choice',
        question: 'Who is the consignee authorized to receive the cargo?',
        passage: `======================================================
OCEAN BILL OF LADING (NEGOTIABLE)
B/L No.: MSC-SGN-LAX-2024-8891
======================================================
SHIPPER:
MEKONG VINA EXPORT MANUFACTURING JSC
Lot C3, Hiep Phuoc Industrial Zone, Nha Be, HCMC, Vietnam

CONSIGNEE:
PACIFIC COAST HOME FURNISHINGS INC.
1200 Harbor Boulevard, Long Beach, CA 90802, USA

NOTIFY PARTY:
WESTERN LOGISTICS BROKERAGE LLC
Contact: customs@westernlogistics.com

VESSEL / VOYAGE:
MSC GULSUN / V.2401E

PORT OF LOADING:
Ho Chi Minh City Port (Cat Lai Terminal), Vietnam

PORT OF DISCHARGE:
Port of Los Angeles (Pier 400), California, USA

CONTAINER NO. & SEAL:
MSKU8472910 / SEAL: VN-CUSTOMS-991204
Type: 1 x 40HC (High Cube Container)

DESCRIPTION OF PACKAGES AND GOODS:
480 CARTONS OF CERAMIC TILES AND BATHROOM DECOR
Gross Weight: 19,200.00 KGS
Net Weight: 17,800.00 KGS
Measurement: 58.50 CBM

FREIGHT & CHARGES:
"FREIGHT PREPAID" - Under CIF Los Angeles Port Incoterms 2020

SPECIAL INSTRUCTIONS:
- Free time at destination: 7 calendar days after container discharge.
- Standard demurrage rate applicable: USD 180 per day thereafter.
======================================================`,
        options: ['MEKONG VINA EXPORT MANUFACTURING JSC', 'PACIFIC COAST HOME FURNISHINGS INC.', 'WESTERN LOGISTICS BROKERAGE LLC', 'Cat Lai Terminal Operations'],
        answer: 'PACIFIC COAST HOME FURNISHINGS INC.',
        explanation: 'Trên B/L, mục Consignee ghi rõ: PACIFIC COAST HOME FURNISHINGS INC. tại Long Beach, CA, USA.',
      },
      {
        skill: 'reading', topic: 'documents', level: 'B1', type: 'multiple_choice',
        question: 'What is the freight payment term indicated on the Bill of Lading?',
        options: ['Freight Collect (paid at destination)', 'Freight Prepaid (paid before shipment departure)', 'Freight split between shipper and consignee', 'Not mentioned on the document'],
        answer: 'Freight Prepaid (paid before shipment departure)',
        explanation: 'Mục Freight & Charges ghi "FREIGHT PREPAID" — cước đã được trả trước khi tàu khởi hành.',
      },
    ],
  },

  lesson_2_2: {
    content: `## Viết: Email Xác Nhận Booking Hãng Tàu

Một email nghiệp vụ logistics chuyên nghiệp cần có cấu trúc rõ ràng:
- **Subject line** nêu rõ: loại yêu cầu + tuyến đường + thời gian
- **Lời chào** trang trọng (Dear Ms./Mr. ...)
- **Nội dung chính**: nêu đầy đủ thông tin lô hàng (container, POL/POD, ETD, Incoterms)
- **Yêu cầu hành động cụ thể** (xác nhận, gửi chứng từ, báo giá...)
- **Kết thư** lịch sự (Best regards,...)

**Tình huống:** Bạn là nhân viên chứng từ (Documentation Executive) tại công ty xuất khẩu Mekong. Hãy viết một email (khoảng 60–100 từ) gửi cho nhân viên dịch vụ khách hàng của đại lý Forwarder (Ms. Sarah) để:
- Xác nhận đặt chỗ 1 container 40HC chở đồ gỗ nội thất đi Hamburg, ETD dự kiến 15/11/2024.
- Nhắc điều kiện Incoterms FOB (cước tàu do người mua trả — Freight Collect).
- Yêu cầu gửi bản nháp vận đơn (draft B/L) trước hạn chót (cut-off date).`,
    questions: [
      {
        skill: 'writing', topic: 'booking', level: 'B1', type: 'essay',
        question: 'Viết email (60–100 từ) xác nhận booking container 40HC đi Hamburg, nhắc điều kiện FOB, và yêu cầu gửi draft B/L trước cut-off date.',
        answer: 'Email cần nêu đủ: xác nhận booking (loại container, hàng hóa, tuyến), điều kiện FOB/Freight Collect, và yêu cầu gửi draft B/L.',
        explanation: `Gợi ý đáp án mẫu:

Subject: Booking Confirmation - 1 x 40HC / HCMC to Hamburg / ETD 15 Nov

Dear Ms. Sarah,

I am writing to formally confirm our booking for 1 x 40HC container of wooden furniture destined for Hamburg, Germany. Kindly ensure the vessel ETD remains scheduled for November 15, 2024. As agreed under FOB Ho Chi Minh City terms, please confirm the ocean freight will be marked as "Freight Collect" payable by the consignee in Hamburg.

Furthermore, please send us the draft Bill of Lading at your earliest convenience for verification prior to the documentation cut-off date.

Thank you for your prompt assistance.

Best regards,
Nguyen Van Minh — Logistics Executive, Mekong Furniture Exports`,
      },
    ],
  },

  lesson_3_1: {
    content: `## Nói: Giới Thiệu Lô Hàng Với Khách Hàng

Khi làm việc với khách hàng quốc tế, bạn thường cần giới thiệu ngắn gọn, rõ ràng về một lô hàng: loại hàng, số lượng, tuyến vận chuyển, và mốc thời gian quan trọng. Một phần giới thiệu tốt thường theo cấu trúc:

1. Chào hỏi + giới thiệu bản thân/công ty
2. Nêu loại hàng và khối lượng
3. Nêu tuyến đường (POL → POD) và phương thức (FCL/LCL)
4. Nêu Incoterms áp dụng và mốc ETD/ETA
5. Mời khách hàng đặt câu hỏi

**Luyện tập:** Hãy chuẩn bị một đoạn giới thiệu (nói hoặc viết ra như kịch bản nói) khoảng 45–60 giây giới thiệu lô hàng sau với khách hàng: 1 container 20GP, 500 thùng gốm sứ, từ TP.HCM đi Los Angeles, điều kiện CIF, ETD đầu tháng 12.`,
    questions: [
      {
        skill: 'speaking', topic: 'booking', level: 'B1', type: 'speaking',
        question: 'Giới thiệu lô hàng (1 x 20GP, gốm sứ, HCMC → Los Angeles, CIF, ETD đầu tháng 12) với khách hàng trong khoảng 45–60 giây.',
        answer: 'Cần nêu đủ: loại/số lượng hàng, tuyến đường, Incoterms, mốc thời gian, giọng điệu chuyên nghiệp.',
        explanation: 'Gợi ý: "Good morning, this is [Name] from Mekong Trading. I would like to introduce our upcoming shipment: 1 x 20GP container of ceramic products, departing Ho Chi Minh City for Los Angeles under CIF terms, with an estimated departure in early December..."',
      },
    ],
  },
};
