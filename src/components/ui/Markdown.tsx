'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Hiển thị Markdown (in đậm, danh sách, bảng, code...) thay vì để lộ các ký hiệu ** và |. Không cho phép HTML thô nên an toàn.
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-2">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-primary-900 dark:text-white">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h3 className="font-bold text-base mt-4 mb-2">{children}</h3>,
          h2: ({ children }) => <h3 className="font-bold text-base mt-4 mb-2">{children}</h3>,
          h3: ({ children }) => <h4 className="font-bold mt-3 mb-1.5">{children}</h4>,
          h4: ({ children }) => <h4 className="font-semibold mt-3 mb-1.5">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary-300 pl-3 my-2 text-text-secondary italic">{children}</blockquote>,
          hr: () => <hr className="my-3 border-[var(--color-border)]" />,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline">{children}</a>
          ),
          code: ({ children, className: cls }) =>
            cls ? (
              <code className="block text-[11px] sm:text-xs">{children}</code>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-300 text-[0.85em]">{children}</code>
            ),
          pre: ({ children }) => <pre className="my-2 p-3 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto">{children}</pre>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-left border-collapse text-[0.95em]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-primary-50/70 dark:bg-gray-800">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 font-semibold border-b border-[var(--color-border)] whitespace-nowrap">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-b border-[var(--color-border)] align-top">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
