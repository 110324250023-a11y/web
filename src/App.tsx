/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { playPageTurnSound } from './types';
import { CozyRoomScene } from './components/RoomScene';
import { ImageLightbox, ExcelPreviewModal } from './components/Modals';
import { Chapter1 } from './components/Chapter1';
import { Chapter2 } from './components/Chapter2';
import { Chapter3Dashboard } from './components/Chapter3Dashboard';
import { Chapter4Defense } from './components/Chapter4Defense';

/* =========================================================================
   REALISTIC 3D BOOK READER OVERLAY (UNIFIED WHOLE-PAGE PER CHAPTER)
========================================================================= */
function RealisticBookReader({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);
  const [showExcel, setShowExcel] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  const totalChapters = 4;
  const chapterTitles = [
    'Chương I: Tổng Quan Báo Cáo & Đội Ngũ',
    'Chương II: Dữ Liệu Các Quý (Q4/23 – Q3/26)',
    'Chương III: Báo Cáo BI Dashboard Toàn Diện',
    'Chương IV: Phản Biện Cold Calling & AI Chat',
  ];

  const turnToChapter = (target: number) => {
    if (isFlipping || target === currentChapter || target < 1 || target > totalChapters) return;

    if (isSoundEnabled) playPageTurnSound();
    setFlipDirection(target > currentChapter ? 'next' : 'prev');
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentChapter(target);
      setIsFlipping(false);
    }, 450);
  };

  const handleNext = () => turnToChapter(currentChapter + 1);
  const handlePrev = () => turnToChapter(currentChapter - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentChapter, isFlipping, isSoundEnabled]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#0c0907]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
        {/* Khung Bao Cuốn Sách Sang Trọng */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-6xl h-[94vh] bg-[#FAF6F0] text-[#3D2314] rounded-3xl border-4 border-[#3D2314] flex flex-col overflow-hidden shadow-2xl"
          style={{
            boxShadow:
              '0 30px 80px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(230, 159, 0, 0.25), inset 0 0 25px rgba(61, 35, 20, 0.1)',
          }}
        >
          {/* Lớp xấp giấy dày hàng trăm trang ở 2 cạnh ngoài (Stacked Paper Edges) */}
          <div
            className="absolute top-0 bottom-0 left-0 w-3 z-30 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to right, #e8decd, #e8decd 1px, #d8cebc 1px, #d8cebc 2px)',
              boxShadow: 'inset -2px 0 3px rgba(61, 35, 20, 0.2)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-3 z-30 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to left, #e8decd, #e8decd 1px, #d8cebc 1px, #d8cebc 2px)',
              boxShadow: 'inset 2px 0 3px rgba(61, 35, 20, 0.2)',
            }}
          />

          {/* Dải ruy băng đánh dấu trang mạ vàng */}
          <div className="absolute top-0 right-28 w-4 h-16 bg-[#E69F00] rounded-b-md shadow-md z-40 pointer-events-none" />

          {/* THANH ĐẦU TRANG (HEADER BAR) */}
          <div className="px-6 py-3.5 border-b border-[#3D2314]/15 bg-[#FAF6F0] flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69F00] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#3D2314]">
                {chapterTitles[currentChapter - 1]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1.5 rounded-lg text-[#3D2314] hover:bg-[#3D2314]/10 transition-colors cursor-pointer"
                title={isSoundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#E69F00]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#3D2314] hover:bg-[#D87093] text-[#FAF6F0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Đóng sách và quay lại thư viện 3D"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Đóng Sách</span>
              </button>
            </div>
          </div>

          {/* KHÔNG GIAN TOÀN TRANG CHƯƠNG VỚI HIỆU ỨNG LẬT 3D CHÂN THỰC */}
          <div
            className="flex-1 relative overflow-hidden z-10"
            style={{ perspective: '2000px' }}
          >
            <div className="w-full h-full overflow-y-auto px-6 sm:px-10 md:px-14 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChapter}
                  initial={{
                    opacity: 0,
                    rotateY: flipDirection === 'next' ? 25 : -25,
                    scale: 0.98,
                  }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    rotateY: flipDirection === 'next' ? -25 : 25,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.4, ease: [0.38, 0.05, 0.22, 1] }}
                  className="min-h-full"
                  style={{
                    transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {currentChapter === 1 && <Chapter1 />}
                  {currentChapter === 2 && <Chapter2 />}
                  {currentChapter === 3 && (
                    <Chapter3Dashboard
                      onOpenLightbox={(img, title) => {
                        setLightboxImage(img);
                        setLightboxTitle(title);
                      }}
                      onOpenExcel={() => setShowExcel(true)}
                    />
                  )}
                  {currentChapter === 4 && <Chapter4Defense />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* GÓC CUỘN TRANG THÔNG MINH (DOG-EAR PEEL ON HOVER) */}
            {currentChapter < totalChapters && !isFlipping && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={handleNext}
                className="absolute bottom-2 right-2 w-14 h-14 group flex items-end justify-end cursor-pointer z-30 focus:outline-none"
                title="Nhấp để lật sang chương tiếp theo"
              >
                <div className="relative w-9 h-9 group-hover:w-12 group-hover:h-12 transition-all duration-300">
                  <div
                    className="absolute bottom-0 right-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      background: 'linear-gradient(135deg, #E6DAC4 0%, #D4C4A8 100%)',
                      boxShadow: '-3px -3px 6px rgba(61,35,20,0.3)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-full h-full pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      borderTop: '1.5px solid #E69F00',
                      borderLeft: '1.5px solid #E69F00',
                    }}
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold text-[#3D2314] opacity-0 group-hover:opacity-100 transition-opacity">
                    ▶
                  </span>
                </div>
              </motion.button>
            )}

            {currentChapter > 1 && !isFlipping && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={handlePrev}
                className="absolute bottom-2 left-2 w-14 h-14 group flex items-end justify-start cursor-pointer z-30 focus:outline-none"
                title="Nhấp để lật về chương trước"
              >
                <div className="relative w-9 h-9 group-hover:w-12 group-hover:h-12 transition-all duration-300">
                  <div
                    className="absolute bottom-0 left-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                      background: 'linear-gradient(225deg, #E6DAC4 0%, #D4C4A8 100%)',
                      boxShadow: '3px -3px 6px rgba(61,35,20,0.3)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                      borderTop: '1.5px solid #E69F00',
                      borderRight: '1.5px solid #E69F00',
                    }}
                  />
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold text-[#3D2314] opacity-0 group-hover:opacity-100 transition-opacity">
                    ◀
                  </span>
                </div>
              </motion.button>
            )}
          </div>

          {/* THANH ĐIỀU HƯỚNG CUỐI SÁCH (FOOTER BAR) */}
          <div className="px-6 py-3.5 border-t border-[#3D2314]/15 bg-[#FAF6F0] flex items-center justify-between z-20">
            <button
              onClick={handlePrev}
              disabled={currentChapter === 1 || isFlipping}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[#3D2314]/30 text-[#3D2314] hover:bg-[#3D2314]/10 disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Chương trước</span>
            </button>

            {/* Các nốt chấm chuyển chương */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  onClick={() => turnToChapter(c)}
                  disabled={isFlipping}
                  className="group p-1 cursor-pointer focus:outline-none"
                  title={chapterTitles[c - 1]}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      currentChapter === c
                        ? 'w-7 h-2.5 bg-[#E69F00]'
                        : 'w-2.5 h-2.5 bg-[#3D2314]/25 hover:bg-[#3D2314]/60'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-[#6B4C38] ml-2 hidden sm:inline">
                Chương {currentChapter} / {totalChapters}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentChapter === totalChapters || isFlipping}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3D2314] text-[#FAF6F0] hover:bg-[#E69F00] hover:text-[#3D2314] disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Chương sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <ImageLightbox
        image={lightboxImage}
        title={lightboxTitle}
        onClose={() => setLightboxImage(null)}
      />

      <ExcelPreviewModal isOpen={showExcel} onClose={() => setShowExcel(false)} />
    </>
  );
}

/* =========================================================================
   APP CHÍNH (THE BOOKSHELF EXPERIENCE)
========================================================================= */
export default function App() {
  const [isReading, setIsReading] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#120E0B] select-none">
      {/* 1. KHÔNG GIAN CĂN PHÒNG & KỆ SÁCH 3D CHÂN THỰC */}
      <div
        className={`w-full h-full transition-all duration-700 ${
          isReading ? 'filter blur-md brightness-50 scale-105' : 'scale-100'
        }`}
      >
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0.1, 2.2], fov: 45 }}
        >
          <CozyRoomScene
            onOpenBook={() => {
              playPageTurnSound();
              setIsReading(true);
            }}
            isReading={isReading}
          />
        </Canvas>
      </div>

      {/* 2. CHỈ DẪN TƯƠNG TÁC THƯ VIỆN ẤM ÁP */}
      {!isReading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1A140F]/85 backdrop-blur-md border border-[#E69F00]/60 shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69F00] animate-ping" />
              <span className="text-xs md:text-sm font-semibold tracking-wide text-[#FAF6F0]">
                Nhấp vào <span className="text-[#E69F00] font-bold">Cuốn Sách Báo Cáo</span> trên kệ để lấy xuống đọc
              </span>
            </div>
            <span className="text-[11px] text-[#FAF6F0]/60 tracking-wider font-mono">
              Cocoon Vietnam & Cam Consumer · Interactive 3D Bookshelf Experience
            </span>
          </motion.div>
        </div>
      )}

      {/* 3. NÚT TRUY CẬP NHANH GÓC PHẢI */}
      {!isReading && (
        <button
          onClick={() => {
            playPageTurnSound();
            setIsReading(true);
          }}
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-[#1A140F]/85 hover:bg-[#E69F00] text-[#FAF6F0] hover:text-[#3D2314] border border-[#E69F00]/50 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#E69F00]" />
          <span>Rút Sách Ra Đọc</span>
        </button>
      )}

      {/* 4. GIAO DIỆN MỞ SÁCH THỰC TẾ & LẬT TRANG CHÂN THẬT */}
      <RealisticBookReader isOpen={isReading} onClose={() => setIsReading(false)} />
    </div>
  );
}
