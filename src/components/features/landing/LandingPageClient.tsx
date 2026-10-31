'use client';

import React from 'react';
import { useAdminShortcut } from '@/components/features/auth/useAdminShortcut';
import Link from 'next/link';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { SakuraPetals } from '@/components/features/landing/SakuraPetals';
import { Reveal } from '@/components/ui/Reveal';
import {
  GraduationCap, ArrowRight, CheckCircle2,
  BookOpen, Volume2, PenTool, Mic, BarChart3,
  Compass, Award
} from 'lucide-react';

export interface LandingContent {
  heroBadgeText: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  whyChooseTitle: string;
  whyChooseBullet1: string;
  whyChooseBullet2: string;
  whyChooseBullet3: string;
  footerTagline: string;
  logoImageBase64: string | null;
  logoMimeType: string | null;
}

function splitBullet(text: string): [string, string] {
  const idx = text.indexOf(':');
  if (idx === -1) return ['', text];
  return [text.slice(0, idx), text.slice(idx + 1).trim()];
}

function Logo({ content, className }: { content: LandingContent; className: string }) {
  if (content.logoImageBase64 && content.logoMimeType) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:${content.logoMimeType};base64,${content.logoImageBase64}`}
        alt="Logo"
        className={`${className} object-contain bg-white`}
      />
    );
  }
  return (
    <div className={`${className} bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white`}>
      <GraduationCap className="w-6 h-6" />
    </div>
  );
}

export function LandingPageClient({ content }: { content: LandingContent }) {
  const onLogoClick = useAdminShortcut();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const reduceMotion = useReducedMotion();
  const bullets = [content.whyChooseBullet1, content.whyChooseBullet2, content.whyChooseBullet3].map(splitBullet);

  return (
    <div className="min-h-screen bg-[#FBFDFC] dark:bg-gray-950 text-text-primary dark:text-gray-100 flex flex-col selection:bg-primary-100 selection:text-primary-800">
      <SakuraPetals />
      {!reduceMotion && <motion.div className="scroll-progress" style={{ scaleX: progress }} />}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[#E3F2EF] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" onClick={onLogoClick} className="flex items-center gap-3">
            <Logo content={content} className="w-10 h-10 rounded-2xl shadow-soft" />
            <div>
              <span className="font-serif font-bold text-xl text-primary-800 dark:text-primary-300 tracking-tight">
                English Anxiety Free
              </span>
              <span className="text-xs text-text-secondary dark:text-gray-400 block font-sans -mt-1">
                for Your Career
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-xl transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary-600 hover:bg-primary-hover text-white px-5 py-2.5 rounded-2xl shadow-soft hover:shadow-card-hover transition-all flex items-center gap-2"
            >
              <span>Bắt đầu miễn phí</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 bg-gradient-to-b from-[#E3F2EF]/60 via-[#FFF4CC]/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-primary-200/60 dark:border-primary-800/50 shadow-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-primary-800 dark:text-primary-300">
              {content.heroBadgeText}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-primary-900 dark:text-white max-w-4xl mx-auto leading-tight md:leading-tight"
          >
            Làm chủ Tiếng Anh Chuyên ngành{' '}
            <span className="text-primary-600 dark:text-primary-400">
              {content.heroTitleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-text-secondary dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl font-semibold shadow-soft-lg hover:shadow-card-hover transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>Làm bài Test đầu vào ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Quick highlight metrics */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Học theo ngành của bạn', val: 'Mọi ngành nghề', desc: 'Nội dung do giáo viên nạp' },
              { label: 'Bộ câu hỏi chuẩn hóa', val: '4 Kỹ năng', desc: 'Nghe, Đọc, Viết, Nói' },
              { label: 'Quy đổi quốc tế', val: 'CEFR / TOEIC', desc: 'Ước lượng trình độ tức thì' },
              { label: 'Hỗ trợ sinh viên', val: 'AI Tutor 24/7', desc: 'Chữa email & giải thích' },
            ].map((stat, i) => (
              <Reveal key={i} delay={0.45 + i * 0.1} y={20}>
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-100 dark:border-gray-700 text-left shadow-soft hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                  <div className="font-serif font-bold text-xl text-primary-700 dark:text-primary-300">{stat.val}</div>
                  <div className="text-xs font-semibold text-text-primary dark:text-gray-200 mt-0.5">{stat.label}</div>
                  <div className="text-[11px] text-text-muted mt-1">{stat.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Kỹ năng Chuyên ngành */}
      <section className="py-20 bg-white dark:bg-gray-900 border-y border-[#E3F2EF] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-primary-900 dark:text-white">
              Rèn luyện toàn diện 4 Kỹ năng thực chiến
            </h2>
            <p className="mt-4 text-text-secondary dark:text-gray-300 text-sm sm:text-base">
              Không học lan man. Mọi bài học xoay quanh tình huống thực tế trong công việc và lĩnh vực của bạn, được chọn riêng cho trình độ và mục tiêu của từng người.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Volume2,
                skill: 'Listening',
                title: 'Nghe hội thoại thực tế',
                desc: 'Luyện nghe cuộc gọi, thông báo, cuộc họp và hội thoại công việc với tốc độ chậm, thường và nhanh.',
                color: 'from-teal-500 to-primary-600',
              },
              {
                icon: BookOpen,
                skill: 'Reading',
                title: 'Đọc hiểu tài liệu chuyên môn',
                desc: 'Đọc email, báo cáo, hợp đồng, hướng dẫn và tài liệu thuộc lĩnh vực của bạn, tra từ ngay khi đọc.',
                color: 'from-primary-600 to-primary-700',
              },
              {
                icon: PenTool,
                skill: 'Writing',
                title: 'Soạn thảo Email Nghiệp vụ',
                desc: 'Thực hành viết email, báo cáo, phản hồi khách hàng. AI chấm bài, chỉ lỗi và gợi ý bản viết tốt hơn.',
                color: 'from-primary-700 to-primary-800',
              },
              {
                icon: Mic,
                skill: 'Speaking',
                title: 'Thuyết trình & Đàm phán',
                desc: 'Luyện nói qua công nghệ AI nhận diện giọng nói, trau chuốt phát âm thuật ngữ và ngữ điệu tự tin.',
                color: 'from-primary-600 to-accent-dark',
              },
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.12} className="h-full">
              <div
                className="h-full p-6 rounded-3xl bg-[#FBFDFC] dark:bg-gray-800/50 border border-primary-100 dark:border-gray-700 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-soft group-hover:scale-105 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  {item.skill}
                </span>
                <h3 className="font-serif font-bold text-lg text-text-primary dark:text-white mt-1 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary dark:text-gray-300 leading-relaxed flex-1">
                  {item.desc}
                </p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quy trình 3 bước */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[#E3F2EF]/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Phương pháp học tập</span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-primary-900 dark:text-white mt-2">
              Chỉ 3 Bước để Bứt Phá Trình Độ
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Bài Test Đầu Vào Chuyên Sâu',
                desc: 'Đánh giá 4 kỹ năng và vốn từ vựng. Nhận ngay báo cáo phân tích điểm mạnh - điểm yếu và quy đổi CEFR/TOEIC.',
                icon: BarChart3,
              },
              {
                step: '02',
                title: 'Lộ Trình Cá Nhân Hóa Tự Động',
                desc: 'AI chọn và sắp xếp bài học 12 tuần riêng cho bạn dựa trên trình độ, ngành nghề và mục tiêu: đi làm, thực tập hay thi chứng chỉ.',
                icon: Compass,
              },
              {
                step: '03',
                title: 'Luyện 15-20 Phút Mỗi Ngày',
                desc: 'Học mọi lúc mọi nơi trên điện thoại hoặc máy tính. Flashcard lặp lại ngắt quãng (SRS) và AI Tutor luôn sẵn sàng giải đáp thắc mắc.',
                icon: Award,
              },
            ].map((st, i) => (
              <Reveal key={i} delay={i * 0.15} className="h-full">
              <div
                className="relative h-full p-8 rounded-3xl bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="text-4xl font-serif font-bold text-primary-200 dark:text-primary-900 mb-4">
                  {st.step}
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 flex items-center justify-center mb-4">
                  <st.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-xl text-text-primary dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vì sao chọn English Anxiety Free */}
      <section className="py-20 bg-white dark:bg-gray-900 border-t border-[#E3F2EF] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal y={40}>
          <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-soft-lg">
            <div className="max-w-3xl relative z-10">
              <span className="text-xs font-bold text-cream uppercase tracking-widest">Cam kết chất lượng</span>
              <h2 className="font-serif font-bold text-2xl sm:text-4xl mt-2 mb-6 leading-tight">
                {content.whyChooseTitle}
              </h2>

              <div className="space-y-4 text-white/90 text-sm sm:text-base leading-relaxed">
                {bullets.map(([label, rest], idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p>
                      {label && <strong>{label}:</strong>} {rest}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3.5 bg-cream hover:bg-cream-dark text-primary-900 font-bold rounded-2xl shadow-soft transition-all text-sm"
                >
                  Đăng ký tài khoản miễn phí
                </Link>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-50 dark:bg-gray-950 border-t border-[var(--color-border)] py-12 text-xs text-text-secondary dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {content.logoImageBase64 && content.logoMimeType ? (
              <Logo content={content} className="w-8 h-8 rounded-xl" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
            )}
            <div>
              <div className="font-serif font-bold text-text-primary dark:text-white text-sm">
                English Anxiety Free
              </div>
              <div>{content.footerTagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-primary-600">Đăng nhập</Link>
            <Link href="/register" className="hover:text-primary-600">Đăng ký</Link>
          </div>

          <div className="text-center sm:text-right text-[11px] text-text-muted">
            Dữ liệu học tập của bạn được bảo mật và không chia sẻ cho bên thứ ba.
          </div>
        </div>
      </footer>
    </div>
  );
}
