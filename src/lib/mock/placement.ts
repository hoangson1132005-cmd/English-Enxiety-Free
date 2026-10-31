import type { PlacementTest } from '@/types';

export const mockPlacementTest: PlacementTest = {
  id: 'placement_001',
  title: 'Bài Kiểm Tra Đầu Vào – English Anxiety Free English for Logistics',
  description: 'Bài test này giúp chúng tôi đánh giá trình độ tiếng Anh logistics của bạn và xây dựng lộ trình học phù hợp nhất.',
  duration_minutes: 45,
  sections: [
    {
      id: 'section_vocab',
      skill: 'vocabulary',
      title: 'Từ vựng Logistics',
      instructions: 'Chọn đáp án đúng nhất cho mỗi câu hỏi về từ vựng và khái niệm logistics.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_v1',
          skill: 'vocabulary',
          topic: 'incoterms',
          level: 'B1',
          type: 'multiple_choice',
          question: 'Under FOB (Free On Board) terms, when does the risk transfer from the seller to the buyer?',
          options: [
            'When goods are loaded onto the vessel at the named port of shipment',
            'When goods arrive at the destination port',
            'When the seller delivers goods to the freight forwarder',
            'When the buyer makes payment',
          ],
          answer: 'When goods are loaded onto the vessel at the named port of shipment',
          explanation: 'Under FOB, risk transfers from seller to buyer when goods are loaded on board the vessel at the named port of shipment.',
        },
        {
          id: 'pt_v2',
          skill: 'vocabulary',
          topic: 'incoterms',
          level: 'B1',
          type: 'multiple_choice',
          question: 'What does "CIF" stand for in international trade?',
          options: [
            'Cost, Insurance and Freight',
            'Cargo, Import and Fee',
            'Cleared, Insured and Free',
            'Cost, Import and Forward',
          ],
          answer: 'Cost, Insurance and Freight',
          explanation: 'CIF stands for Cost, Insurance and Freight. The seller pays for transportation and insurance to the destination port.',
        },
        {
          id: 'pt_v3',
          skill: 'vocabulary',
          topic: 'documents',
          level: 'A2',
          type: 'multiple_choice',
          question: 'A Bill of Lading (B/L) is best described as:',
          options: [
            'A document of title, receipt, and contract of carriage',
            'A customs declaration form',
            'An insurance policy for cargo',
            'A freight rate quotation',
          ],
          answer: 'A document of title, receipt, and contract of carriage',
          explanation: 'A Bill of Lading serves three functions: document of title, receipt for goods, and evidence of contract of carriage.',
        },
        {
          id: 'pt_v4',
          skill: 'vocabulary',
          topic: 'freight',
          level: 'B1',
          type: 'multiple_choice',
          question: 'What is "demurrage" in shipping?',
          options: [
            'Charges for holding containers beyond the free time allowed',
            'The cost of loading cargo onto a vessel',
            'A discount on freight rates for regular customers',
            'Insurance coverage for delayed shipments',
          ],
          answer: 'Charges for holding containers beyond the free time allowed',
          explanation: 'Demurrage is a penalty charge for keeping containers at the port terminal beyond the free time period allocated.',
        },
        {
          id: 'pt_v5',
          skill: 'vocabulary',
          topic: 'customs',
          level: 'B2',
          type: 'multiple_choice',
          question: 'What is an HS Code used for?',
          options: [
            'Classifying goods internationally for customs and trade statistics',
            'Tracking the location of containers',
            'Calculating sea freight rates',
            'Identifying shipping companies',
          ],
          answer: 'Classifying goods internationally for customs and trade statistics',
          explanation: 'HS (Harmonized System) codes are internationally standardized codes for classifying traded products, used by customs authorities to determine applicable tariffs.',
        },
      ],
    },
    {
      id: 'section_reading',
      skill: 'reading',
      title: 'Đọc hiểu',
      instructions: 'Đọc đoạn văn và trả lời các câu hỏi bên dưới.',
      time_limit_minutes: 12,
      questions: [
        {
          id: 'pt_r1',
          skill: 'reading',
          topic: 'documents',
          level: 'B1',
          type: 'multiple_choice',
          passage: `From: ops@seafreight.com
To: import@uthcompany.vn
Subject: Shipment Update - MKG-SFG-2024-0156

Dear Ms. Phuong,

We would like to update you on your shipment status:

Container No.: MSKU7654321
Vessel: COSCO PRIDE / Voyage 089E  
Port of Loading: Busan, South Korea (KRPUS)
Port of Discharge: Hai Phong, Vietnam (VNHPH)
ETD Busan: October 28, 2024
ETA Hai Phong: November 3, 2024

The cargo has been loaded on board and the original Bill of Lading (3/3 originals) will be couriered to your office by October 30, 2024.

Customs clearance documents required:
1. Commercial Invoice
2. Packing List  
3. Bill of Lading
4. Import License (if applicable)

Please arrange customs clearance in advance to avoid any delays or additional storage charges at the port.

Best regards,
Operations Team`,
          question: 'According to the email, when will the Bill of Lading be sent?',
          options: [
            'By October 30, 2024',
            'On October 28, 2024',
            'On November 3, 2024',
            'The email does not specify',
          ],
          answer: 'By October 30, 2024',
          explanation: 'The email states: "the original Bill of Lading (3/3 originals) will be couriered to your office by October 30, 2024."',
        },
        {
          id: 'pt_r2',
          skill: 'reading',
          topic: 'documents',
          level: 'B1',
          type: 'multiple_choice',
          passage: `From: ops@seafreight.com
To: import@uthcompany.vn
Subject: Shipment Update - MKG-SFG-2024-0156

Dear Ms. Phuong,

We would like to update you on your shipment status:

Container No.: MSKU7654321
Vessel: COSCO PRIDE / Voyage 089E  
Port of Loading: Busan, South Korea (KRPUS)
Port of Discharge: Hai Phong, Vietnam (VNHPH)
ETD Busan: October 28, 2024
ETA Hai Phong: November 3, 2024

The cargo has been loaded on board and the original Bill of Lading (3/3 originals) will be couriered to your office by October 30, 2024.

Customs clearance documents required:
1. Commercial Invoice
2. Packing List  
3. Bill of Lading
4. Import License (if applicable)

Please arrange customs clearance in advance to avoid any delays or additional storage charges at the port.

Best regards,
Operations Team`,
          question: 'How many original Bills of Lading were issued?',
          options: [
            '3 originals',
            '1 original',
            '2 originals',
            'Not mentioned',
          ],
          answer: '3 originals',
          explanation: 'The email clearly states "3/3 originals" will be couriered, meaning all 3 originals are being sent.',
        },
      ],
    },
    {
      id: 'section_listening',
      skill: 'listening',
      title: 'Nghe hiểu',
      instructions: 'Nghe đoạn hội thoại và trả lời câu hỏi. Bạn có thể nghe lại tối đa 2 lần.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_l1',
          skill: 'listening',
          topic: 'booking',
          level: 'B1',
          type: 'multiple_choice',
          audio_url: '/audio/placement_listen_01.mp3',
          question: 'Listen to the conversation. What type of container does the customer need?',
          options: [
            '1 x 40HC (High Cube)',
            '2 x 20GP (General Purpose)',
            '1 x 20GP (General Purpose)',
            '1 x 40GP (General Purpose)',
          ],
          answer: '1 x 40HC (High Cube)',
          explanation: 'In the audio, the customer specifies they need one 40-foot high cube container for their furniture shipment.',
        },
        {
          id: 'pt_l2',
          skill: 'listening',
          topic: 'booking',
          level: 'B1',
          type: 'multiple_choice',
          audio_url: '/audio/placement_listen_01.mp3',
          question: 'What is the agreed Incoterm mentioned in the conversation?',
          options: [
            'FOB Ho Chi Minh City',
            'CIF Singapore',
            'EXW Factory',
            'DAP Singapore',
          ],
          answer: 'FOB Ho Chi Minh City',
          explanation: 'The freight forwarder confirms the shipment will be on FOB terms at Ho Chi Minh City port.',
        },
      ],
    },
    {
      id: 'section_writing',
      skill: 'writing',
      title: 'Viết',
      instructions: 'Đọc tình huống và viết một đoạn email ngắn bằng tiếng Anh.',
      time_limit_minutes: 10,
      questions: [
        {
          id: 'pt_w1',
          skill: 'writing',
          topic: 'booking',
          level: 'B1',
          type: 'essay',
          question: `Situation: You work as a logistics staff at Mekong Import-Export Company. Your manager has asked you to send an email to your freight forwarder (Pacific Logistics Co.) requesting a booking confirmation for the following shipment:
          
• Cargo: 500 cartons of ceramic tiles
• Container: 1 x 20GP
• POL: Ho Chi Minh City, Vietnam  
• POD: Los Angeles, USA
• Requested ETD: First week of December 2024
• Terms: FOB HCMC

Write an email (80–120 words) requesting this booking.`,
          answer: 'Sample answer provided in the explanation.',
          explanation: `Good answer example:

Subject: Booking Request - 1 x 20GP / HCMC to Los Angeles / December 2024

Dear Pacific Logistics Team,

I hope this email finds you well. I am writing to request a booking for the following shipment:

- Cargo: 500 cartons of ceramic tiles
- Container: 1 x 20GP
- Port of Loading: Ho Chi Minh City, Vietnam
- Port of Discharge: Los Angeles, USA  
- Requested ETD: First week of December 2024
- Incoterms: FOB HCMC

Could you please advise on vessel availability and the cut-off dates for documentation and cargo?

Thank you for your assistance. I look forward to your reply.

Best regards,
[Your Name]`,
          word_limit: 120,
        },
      ],
    },
    {
      id: 'section_speaking',
      skill: 'speaking',
      title: 'Nói (Tùy chọn)',
      instructions: 'Đọc câu hỏi và thu âm câu trả lời của bạn. Bạn có thể bỏ qua phần này.',
      time_limit_minutes: 5,
      questions: [
        {
          id: 'pt_s1',
          skill: 'speaking',
          topic: 'incoterms',
          level: 'B1',
          type: 'speaking',
          question: 'Please describe the main difference between FOB and CIF Incoterms. You have 60 seconds to answer.',
          answer: 'FOB: seller responsible until goods on board vessel. CIF: seller also pays freight and insurance to destination.',
          explanation: 'Key points to mention: risk transfer point (same for both - when goods on board), who pays freight (buyer in FOB, seller in CIF), who arranges insurance (buyer in FOB, seller in CIF).',
        },
      ],
    },
  ],
};
