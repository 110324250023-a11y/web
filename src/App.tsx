/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { HeroBookData, BookInteractionState } from './types/books';
import { HERO_BOOKS } from './data/heroBooks';
import { BookshelfCanvas } from './components/BookshelfCanvas';
import { BookshelfUI } from './components/BookshelfUI';
import { BookInfoPanel } from './components/BookInfoPanel';

export default function App() {
  const [interactionState, setInteractionState] = useState<BookInteractionState>('idle');
  const [hoveredBook, setHoveredBook] = useState<HeroBookData | null>(null);
  const [activeBook, setActiveBook] = useState<HeroBookData | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState<boolean>(false);

  // Random book selection
  const handleSelectRandom = useCallback(() => {
    if (interactionState === 'pulling' || interactionState === 'held') return;
    const randomIndex = Math.floor(Math.random() * HERO_BOOKS.length);
    const chosen = HERO_BOOKS[randomIndex];
    setSelectedBookId(chosen.id);
    setActiveBook(chosen);
  }, [interactionState]);

  // Specific book selection
  const handleSelectBook = useCallback((bookId: string) => {
    const book = HERO_BOOKS.find((b) => b.id === bookId);
    if (book) {
      setSelectedBookId(book.id);
      setActiveBook(book);
    }
  }, []);

  // Return book to shelf
  const handleReturn = useCallback(() => {
    setInteractionState('returning');
  }, []);

  // Canvas callbacks
  const handleHoverChange = useCallback((book: HeroBookData | null) => {
    setHoveredBook(book);
  }, []);

  const handleStateChange = useCallback(
    (state: BookInteractionState, book: HeroBookData | null) => {
      setInteractionState(state);
      if (book) {
        setActiveBook(book);
      }
      if (state === 'idle') {
        setSelectedBookId(null);
        setActiveBook(null);
      }
    },
    []
  );

  const handleCanvasReady = useCallback(() => {
    setIsCanvasReady(true);
  }, []);

  // Global Keyboard shortcuts (Esc = return, R = random book)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (interactionState === 'held' || interactionState === 'pulling') {
          handleReturn();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (interactionState === 'idle') {
          handleSelectRandom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionState, handleReturn, handleSelectRandom]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#120f0c] select-none">
      {/* 1. POSTER-FIRST IMAGE (Section 11) */}
      {/* Inline poster visible immediately on first frame; fades out in 600ms once WebGL canvas is ready */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-out ${
          isCanvasReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src="/assets/aistudio/image_5846ddea.png"
          alt="The Bookshelf warm reading room baseline poster"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* 2. REAL-TIME 3D WEBGL CANVAS */}
      <BookshelfCanvas
        onHoverChange={handleHoverChange}
        onStateChange={handleStateChange}
        onCanvasReady={handleCanvasReady}
        selectedBookId={selectedBookId}
        interactionState={interactionState}
        onReturnRequest={handleReturn}
      />

      {/* 3. 2D UI SHELL (Taste Skill / Anti-Slop) */}
      <BookshelfUI
        interactionState={interactionState}
        hoveredBook={hoveredBook}
        activeBook={activeBook}
        onSelectBook={handleSelectBook}
        onSelectRandom={handleSelectRandom}
        onReturn={handleReturn}
        isReady={isCanvasReady}
      />

      {/* 4. HELD BOOK EDITORIAL INFO PANEL */}
      <BookInfoPanel
        book={activeBook}
        isVisible={interactionState === 'held'}
        onReturn={handleReturn}
        onSelectRandom={handleSelectRandom}
      />
    </div>
  );
}
