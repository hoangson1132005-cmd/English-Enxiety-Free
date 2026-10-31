'use client';

import { Markdown } from '@/components/ui/Markdown';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, User, RefreshCw, Trash2,
  Copy, Check, BookOpen, PenTool, Lightbulb
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiSendMessage, apiGetChatHistory } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

let idCounter = 0;
function newMessageId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export default function AITutorPage() {
  const { addToast } = useUIStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial chat history
    const loadHistory = async () => {
      try {
        const hist = await apiGetChatHistory();
        setMessages(
          hist.length > 0
            ? hist
            : [
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: 'Chào bạn! Mình là AI Tutor của English Anxiety Free. Bạn cần hỗ trợ gì về tiếng Anh hôm nay?',
                  timestamp: new Date().toISOString(),
                },
              ]
        );
      } catch {
        // fallback
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || input;
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: newMessageId('usr'),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!contentToSend) setInput('');
    setIsSending(true);

    try {
      const res = await apiSendMessage(text);
      const assistantMessage: ChatMessage = {
        id: newMessageId('ai'),
        role: 'assistant',
        content: res.content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      addToast({
        title: 'Lỗi',
        description: 'Không thể kết nối với AI Tutor. Vui lòng thử lại.',
        variant: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_new',
        role: 'assistant',
        content: 'Cuộc hội thoại đã được làm mới. Bạn cần hỗ trợ gì về tiếng Anh?',
        timestamp: new Date().toISOString(),
      },
    ]);
    addToast({ title: 'Đã làm mới đoạn chat', variant: 'default' });
  };

  return (
    <AppLayout title="AI Tutor - Trợ Lý Học Tiếng Anh">
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-[var(--color-border)] shadow-soft overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-6 h-6 text-cream" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg">AI Tutor</h2>
                <span className="text-[10px] bg-accent/30 text-accent-light px-2 py-0.5 rounded-full font-medium">
                  Trợ lý theo ngành của bạn
                </span>
              </div>
              <p className="text-xs text-white/80">
                Sẵn sàng giải đáp thuật ngữ, chấm email và định hướng bài học
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Làm mới cuộc trò chuyện"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-primary-50/40 dark:bg-gray-800/40 border-b border-[var(--color-border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1 flex-shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-accent" /> Gợi ý:
          </span>
          {[
            'Giải thích sự khác nhau giữa "affect" và "effect"',
            'Cách mở đầu và kết thúc một email công việc',
            'Sửa email tiếng Anh giúp mình',
            'Hôm nay mình nên ôn gì?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSend(prompt)}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-primary-200/60 dark:border-gray-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 transition-colors shadow-sm flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 max-w-[85%] sm:max-w-[78%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                )}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={cn(
                  'p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-soft min-w-0 max-w-full',
                  msg.role === 'user' && 'whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-background-secondary/60 dark:bg-gray-800 text-text-primary dark:text-gray-200 rounded-tl-none border border-[var(--color-border)]'
                )}
              >
                {msg.role === 'user' ? msg.content : <Markdown>{msg.content}</Markdown>}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-text-muted p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-600" />
              <span>AI Tutor đang suy nghĩ và tổng hợp kiến thức...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Hỏi về từ vựng, ngữ pháp, kiểm tra email..."
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-background-secondary/50 dark:bg-gray-800 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none text-text-primary dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 bg-primary-600 hover:bg-primary-hover text-white rounded-2xl shadow-soft transition-all disabled:opacity-40 flex-shrink-0"
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
