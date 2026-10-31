'use client';

import React, { useEffect, useState } from 'react';
import {
  Volume2, Search, RotateCw, CheckCircle2,
  AlertCircle, HelpCircle, Plus, Trash2, X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  apiGetVocabSets, apiUpdateCardDifficulty, apiCreateVocabSet,
  apiDeleteVocabSet, apiAddVocabCard, apiDeleteVocabCard,
} from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import type { VocabCard, VocabSet } from '@/types';

export default function VocabularyPage() {
  const { addToast } = useUIStore();
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSetId, setActiveSetId] = useState<string | null>(null);

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [showCreateSet, setShowCreateSet] = useState(false);
  const [newSet, setNewSet] = useState({ title: '', title_vi: '', description: '', icon: '📝' });

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ term: '', definition_vi: '', definition: '', pronunciation: '', example: '', example_vi: '' });

  const fetchSets = () => {
    apiGetVocabSets()
      .then((data) => {
        setSets(data);
        if (!activeSetId && data.length > 0) setActiveSetId(data[0].id);
      })
      .finally(() => setLoading(false));
  };

  const loadSets = () => {
    setLoading(true);
    fetchSets();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetchSets, []);

  const currentSet = sets.find((s) => s.id === activeSetId) || sets[0];
  const activeCard: VocabCard | undefined = currentSet?.cards[cardIndex] || currentSet?.cards[0];

  const speakTerm = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      addToast({ title: 'Phát âm', description: text, variant: 'default' });
    }
  };

  const handleRating = async (difficulty: 'easy' | 'hard' | 'unknown') => {
    if (!currentSet || !activeCard) return;
    setIsFlipped(false);
    try {
      await apiUpdateCardDifficulty(activeCard.id, difficulty);
      const labels = {
        easy: 'Đã nhớ vững (Ôn lại sau 7 ngày)',
        unknown: 'Đang ôn (Ôn lại sau 3 ngày)',
        hard: 'Khó nhớ (Ôn lại ngày mai)',
      };
      addToast({
        title: 'Cập nhật Spaced Repetition',
        description: `${activeCard.term}: ${labels[difficulty]}`,
        variant: difficulty === 'easy' ? 'success' : 'default',
      });

      if (cardIndex < currentSet.cards.length - 1) {
        setCardIndex(cardIndex + 1);
      } else {
        setCardIndex(0);
        addToast({
          title: 'Hoàn thành bộ thẻ!',
          description: `Bạn đã ôn hết ${currentSet.cards.length} thẻ trong bộ ${currentSet.title}.`,
          variant: 'success',
        });
      }
    } catch {
      // demo
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSet.title) return;
    try {
      const created = await apiCreateVocabSet(newSet);
      setSets((prev) => [...prev, created]);
      setActiveSetId(created.id);
      setCardIndex(0);
      setNewSet({ title: '', title_vi: '', description: '', icon: '📝' });
      setShowCreateSet(false);
      addToast({ title: 'Đã tạo bộ từ mới', description: created.title, variant: 'success' });
    } catch (err) {
      addToast({ title: 'Lỗi', description: (err as Error).message, variant: 'error' });
    }
  };

  const handleDeleteSet = async (setId: string, title: string) => {
    if (!confirm(`Xóa bộ từ "${title}"? Toàn bộ thẻ trong bộ này cũng sẽ bị xóa.`)) return;
    try {
      await apiDeleteVocabSet(setId);
      const remaining = sets.filter((s) => s.id !== setId);
      setSets(remaining);
      if (activeSetId === setId) {
        setActiveSetId(remaining[0]?.id ?? null);
        setCardIndex(0);
      }
    } catch (err) {
      addToast({ title: 'Lỗi', description: (err as Error).message, variant: 'error' });
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSet || !newCard.term || !newCard.definition_vi) return;
    try {
      const created = await apiAddVocabCard(currentSet.id, newCard);
      setSets((prev) =>
        prev.map((s) => (s.id === currentSet.id ? { ...s, cards: [...s.cards, created], card_count: s.card_count + 1 } : s))
      );
      setNewCard({ term: '', definition_vi: '', definition: '', pronunciation: '', example: '', example_vi: '' });
      setShowAddCard(false);
    } catch (err) {
      addToast({ title: 'Lỗi', description: (err as Error).message, variant: 'error' });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentSet) return;
    await apiDeleteVocabCard(currentSet.id, cardId);
    setSets((prev) =>
      prev.map((s) =>
        s.id === currentSet.id
          ? { ...s, cards: s.cards.filter((c) => c.id !== cardId), card_count: s.card_count - 1 }
          : s
      )
    );
    setCardIndex(0);
  };

  const allCards = sets.flatMap((s) => s.cards);
  const filteredCards = allCards.filter((c) => {
    const matchSearch =
      c.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.definition_vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  if (loading) {
    return (
      <AppLayout title="Kho Từ Vựng & Flashcard">
        <p className="text-center text-sm text-text-muted py-20">Đang tải...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kho Từ Vựng & Flashcard">
      <div className="space-y-8">
        {/* FLASHCARD INTERACTIVE HERO */}
        {currentSet && activeCard ? (
          <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-cream uppercase tracking-wider">
                  {currentSet.icon} Bộ thẻ: {currentSet.title}
                </span>
                <h2 className="font-display font-bold text-2xl text-white mt-1">
                  Luyện Thẻ Ghi Nhớ (Spaced Repetition)
                </h2>
              </div>
              <div className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-white/90">
                Thẻ {cardIndex + 1} / {currentSet.cards.length}
              </div>
            </div>

            {/* 3D Flip Card Container */}
            <div className="perspective-1000 max-w-lg mx-auto h-72 sm:h-80 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <div
                className={cn(
                  'flashcard-inner relative w-full h-full rounded-3xl shadow-soft-lg transition-transform duration-500',
                  isFlipped && 'flipped'
                )}
              >
                {/* FRONT OF CARD */}
                <div className="flashcard-front absolute inset-0 bg-white text-text-primary rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-soft border border-[var(--color-border)]">
                  <div className="w-full flex justify-between items-center text-xs text-text-muted">
                    <span className="font-bold uppercase tracking-wider text-primary-600">
                      {activeCard.level}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <RotateCw className="w-3 h-3" /> Bấm để lật thẻ
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-3xl sm:text-4xl text-primary-900">
                      {activeCard.term}
                    </h3>
                    {activeCard.pronunciation && (
                      <p className="font-mono text-sm text-text-secondary">
                        {activeCard.pronunciation}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakTerm(activeCard.term);
                      }}
                      className="p-2.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors inline-flex items-center justify-center shadow-sm"
                      aria-label="Phát âm"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-text-muted">
                    Bấm thẻ để xem định nghĩa & ví dụ thực tế
                  </p>
                </div>

                {/* BACK OF CARD */}
                <div className="flashcard-back absolute inset-0 bg-[#FFF4CC] dark:bg-gray-800 text-text-primary dark:text-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-soft border border-cream-dark/60">
                  <div className="flex justify-between items-center text-xs text-text-muted">
                    <span className="font-bold text-primary-800 dark:text-primary-300">
                      {activeCard.term}
                    </span>
                    <span className="text-[11px] flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Lật lại
                    </span>
                  </div>

                  <div className="space-y-3 text-left overflow-y-auto max-h-48 py-1">
                    <div>
                      <h4 className="text-xs font-bold text-primary-900 dark:text-cream uppercase">Định nghĩa:</h4>
                      <p className="text-xs sm:text-sm font-semibold text-text-primary dark:text-white leading-relaxed mt-0.5">
                        {activeCard.definition_vi}
                      </p>
                      {activeCard.definition && (
                        <p className="text-xs text-text-secondary dark:text-gray-300 italic mt-0.5 leading-relaxed">
                          {activeCard.definition}
                        </p>
                      )}
                    </div>

                    {activeCard.example && (
                      <div className="pt-2 border-t border-cream-dark/40 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-primary-900 dark:text-cream uppercase">Ví dụ thực tế:</h4>
                        <p className="text-xs text-text-primary dark:text-gray-200 mt-0.5">
                          &quot;{activeCard.example}&quot;
                        </p>
                        {activeCard.example_vi && (
                          <p className="text-[11px] text-text-muted mt-0.5 italic">
                            ({activeCard.example_vi})
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-text-muted text-center">
                    Đánh giá mức độ nhớ bên dưới để hẹn lịch ôn lại
                  </div>
                </div>
              </div>
            </div>

            {/* 3 SRS ACTION BUTTONS */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleRating('hard')}
                className="px-5 py-2.5 rounded-2xl bg-error hover:bg-error-dark text-white text-xs font-semibold shadow-soft transition-all flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Chưa nhớ (Ôn lại ngày mai)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRating('unknown')}
                className="px-5 py-2.5 rounded-2xl bg-warning-dark hover:bg-warning text-white text-xs font-semibold shadow-soft transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Khó (Ôn lại sau 3 ngày)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRating('easy')}
                className="px-6 py-2.5 rounded-2xl bg-success hover:bg-success-dark text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã nhớ (Ôn lại sau 7 ngày)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-3xl p-10 text-white shadow-soft-lg text-center space-y-3">
            <h2 className="font-display font-bold text-xl">Bộ từ này chưa có thẻ nào</h2>
            <p className="text-sm text-white/80">Thêm từ đầu tiên để bắt đầu luyện tập.</p>
          </div>
        )}

        {/* SET SELECTOR */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl text-text-primary dark:text-white">
                Các Bộ Từ Vựng
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-400">
                Chọn bộ từ để học flashcard, hoặc tạo bộ từ của riêng bạn
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm từ vựng..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl text-xs bg-white dark:bg-gray-900 border border-[var(--color-border)] focus:border-primary-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCreateSet(true)}
                className="px-3 py-2 rounded-2xl bg-primary-600 hover:bg-primary-hover text-white text-xs font-semibold shadow-soft transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Tạo bộ từ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {sets.map((set) => {
              const isSelected = activeSetId === set.id;
              return (
                <div key={set.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSetId(set.id);
                      setCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={cn(
                      'w-full p-4 rounded-2xl border text-left transition-all flex flex-col justify-between',
                      isSelected
                        ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm ring-1 ring-primary-600'
                        : 'border-[var(--color-border)] bg-white dark:bg-gray-900 hover:border-primary-300'
                    )}
                  >
                    <span className="text-2xl mb-1">{set.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary dark:text-white leading-snug">
                        {set.title}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {set.card_count} thuật ngữ{set.is_own && ' · Của tôi'}
                      </p>
                    </div>
                  </button>
                  {set.is_own && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(set.id, set.title)}
                      aria-label="Xóa bộ từ"
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/90 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VOCABULARY LIST IN ACTIVE SET */}
        {currentSet && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h4 className="font-display font-bold text-base text-primary-900 dark:text-white">
                Danh Sách Thuật Ngữ ({searchQuery ? filteredCards.length : currentSet.cards.length} từ)
              </h4>
              {currentSet.is_own && (
                <button
                  type="button"
                  onClick={() => setShowAddCard(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm từ
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(searchQuery ? filteredCards : currentSet.cards).map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-background-secondary/30 dark:bg-gray-800/40 border border-[var(--color-border)] space-y-2 hover:border-primary-300 transition-all relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary-800 dark:text-primary-300">
                        {card.term}
                      </span>
                      {card.pronunciation && (
                        <span className="text-xs font-mono text-text-muted">
                          {card.pronunciation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakTerm(card.term)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                        aria-label="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      {currentSet.is_own && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 rounded-lg hover:bg-error-light text-text-muted hover:text-error transition-colors"
                          aria-label="Xóa từ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-text-primary dark:text-white">
                    {card.definition_vi}
                  </p>

                  {card.definition && (
                    <p className="text-xs text-text-secondary dark:text-gray-300 italic">
                      {card.definition}
                    </p>
                  )}

                  {card.example && (
                    <div className="pt-1 text-[11px] text-text-muted">
                      <strong>Ví dụ:</strong> {card.example}
                    </div>
                  )}
                </div>
              ))}
              {(searchQuery ? filteredCards : currentSet.cards).length === 0 && (
                <p className="text-xs text-text-muted col-span-2 text-center py-6">
                  Chưa có từ nào trong bộ này.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE SET MODAL */}
      {showCreateSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-primary-900">Tạo Bộ Từ Của Tôi</h3>
              <button onClick={() => setShowCreateSet(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tên bộ từ</label>
                <input
                  required
                  value={newSet.title}
                  onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                  placeholder="VD: Từ vựng ôn thi cuối kỳ"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Mô tả (tùy chọn)</label>
                <input
                  value={newSet.description}
                  onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Tạo bộ từ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CARD MODAL */}
      {showAddCard && currentSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-lg border border-[var(--color-border)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-primary-900">Thêm Từ Vào &quot;{currentSet.title}&quot;</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1 rounded-xl text-text-muted hover:bg-background-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Từ / Cụm từ</label>
                <input
                  required
                  value={newCard.term}
                  onChange={(e) => setNewCard({ ...newCard, term: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Nghĩa tiếng Việt</label>
                <input
                  required
                  value={newCard.definition_vi}
                  onChange={(e) => setNewCard({ ...newCard, definition_vi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Định nghĩa tiếng Anh (tùy chọn)</label>
                <input
                  value={newCard.definition}
                  onChange={(e) => setNewCard({ ...newCard, definition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Phát âm IPA (tùy chọn)</label>
                <input
                  value={newCard.pronunciation}
                  onChange={(e) => setNewCard({ ...newCard, pronunciation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Ví dụ (tùy chọn)</label>
                <input
                  value={newCard.example}
                  onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-background-secondary/50 border border-[var(--color-border)] focus:outline-none focus:border-primary-500"
                />
              </div>
              <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-hover text-white text-sm font-semibold shadow-soft transition-all">
                Thêm từ
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
