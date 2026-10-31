'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { apiSendMessage, apiGetChatHistory } from '@/lib/api';
import { Bot, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const quickPrompts = [
  'Giải thích sự khác nhau giữa "affect" và "effect"',
  'Cách viết email xin lùi hạn chót lịch sự',
  'Sửa giúp mình câu email này',
  'Hôm nay mình nên ôn gì?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Chào bạn! Mình là AI Tutor của English Anxiety Free. Bạn cần giải thích thuật ngữ, chữa email chứng từ hay gợi ý bài học hôm nay?',
  timestamp: new Date().toISOString(),
};

let idCounter = 0;
function newMessageId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function FloatingAITutor() {
  const { tutorOpen, setTutorOpen } = useUIStore();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const loadedHistory = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tutorOpen && !loadedHistory.current) {
      loadedHistory.current = true;
      apiGetChatHistory()
        .then((history) => {
          if (history.length > 0) setMessages(history);
        })
        .catch(() => {});
    }
  }, [tutorOpen]);

  useEffect(() => {
    if (tutorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, tutorOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: newMessageId('usr'),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsSending(true);

    try {
      const res = await apiSendMessage(text);
      const aiMsg: ChatMessage = {
        id: newMessageId('ai'),
        role: 'assistant',
        content: res.content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: 'Xin lỗi, AI Tutor tạm thời mất kết nối. Vui lòng thử lại sau giây lát!',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {tutorOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-soft-lg border border-[var(--color-border)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-6 h-6 text-cream" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">AI Tutor</h3>
                  <span className="text-[10px] bg-accent/30 text-accent-light px-2 py-0.5 rounded-full font-medium">AI Tutor</span>
                </div>
                <p className="text-xs text-white/80">Trợ lý học thuật 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setTutorOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Đóng AI Tutor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="bg-primary-50/50 dark:bg-gray-800/40 p-2.5 border-b border-[var(--color-border)] flex gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isSending}
                className="text-[11px] whitespace-nowrap bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40 rounded-full px-3 py-1 hover:bg-primary-50 transition-colors flex items-center gap-1 shadow-sm flex-shrink-0"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  )}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-background-secondary dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-[var(--color-border)]'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 items-center text-text-muted text-xs p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-500" />
                <span>AI Tutor đang suy nghĩ và tổng hợp kiến thức...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Hỏi về từ vựng, ngữ pháp, email..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="flex-1 px-4 py-2 text-sm rounded-2xl bg-background-secondary dark:bg-gray-800 border border-[var(--color-border)] focus:outline-none focus:border-primary-500 text-text-primary dark:text-gray-100 placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2.5 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft flex-shrink-0"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
