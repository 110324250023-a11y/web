import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { COLD_CALLING_QUESTIONS } from '../data/mockData';

export function Chapter4Defense() {
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Xin chào! Tôi là Trợ Lý Nghiên Cứu NotebookLM AI đồ án Cocoon Vietnam & Cam Consumer. Bạn có câu hỏi nào cần tra cứu sâu từ tập dữ liệu và các biểu đồ không?',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentQ = COLD_CALLING_QUESTIONS.find((q) => q.id === activeQuestion) || COLD_CALLING_QUESTIONS[0];
  const isRevealed = !!revealedAnswers[activeQuestion];

  const handleSendChat = () => {
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      let reply = 'Theo báo cáo thực chứng Cocoon Vietnam: ';
      const lower = userText.toLowerCase();
      if (lower.includes('churn') || lower.includes('rời bỏ')) {
        reply += 'Tỷ lệ rời bỏ trung bình là 45%. Kênh Referral có tỷ lệ Churn cao nhất (64%), trong khi Search Ads thấp nhất (34%). Mốc định nghĩa Churn là 180 ngày không mua.';
      } else if (lower.includes('q4') || lower.includes('đỉnh') || lower.includes('peak')) {
        reply += 'Q4/2025 ghi nhận lượng khách mới cao nhất với 39 khách nhờ hiệu ứng mùa lễ hội và khuyến mãi cuối năm của Cocoon.';
      } else if (lower.includes('gold') || lower.includes('vip')) {
        reply += 'Hạng Gold VIP có CLV trung vị cao nhất là 4,63 triệu đồng (n=24), nhưng có tới 50% khách hàng đã rời bỏ, gây thiệt hại ước tính 55,56 triệu đồng.';
      } else if (lower.includes('h1') || lower.includes('cam')) {
        reply += 'Đối chuẩn Cam Consumer H1/2026: Doanh thu 99.24 tỷ đ, Chi phí 70.17 tỷ đ, Lợi nhuận trước thuế 29.07 tỷ đ, Biên lợi nhuận ròng 29.3%.';
      } else {
        reply += 'Tập dữ liệu 300 khách hàng khẳng định tầm quan trọng của việc cá nhân hóa thông điệp tiếp thị và triển khai cảnh báo Churn sớm ở mốc 120 ngày.';
      }
      setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    }, 450);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-[#E69F00] mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Chương IV · Phản Biện Hội Đồng & Trợ Lý AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3D2314]">
          Mô Phỏng Phản Biện Cold Calling & AI Chatbot
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4C38] mt-1">
          Luyện tập trả lời 6 câu hỏi chất vấn hóc búa nhất của Hội đồng đánh giá, kèm đáp án chuẩn khoa học và Trợ lý NotebookLM AI tra cứu số liệu tức thì.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Khung Cold Calling Defense (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#E69F00]/25 text-[#3D2314]">
                Câu hỏi {currentQ.id} / {COLD_CALLING_QUESTIONS.length}
              </span>
              <div className="flex gap-1.5">
                {COLD_CALLING_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestion(q.id)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeQuestion === q.id
                        ? 'bg-[#3D2314] text-[#FAF6F0]'
                        : revealedAnswers[q.id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#FAF6F0] text-[#3D2314] hover:bg-[#E69F00]/30'
                    }`}
                  >
                    {q.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#3D2314] text-[#FAF6F0] mb-4">
              <span className="text-[10px] font-extrabold text-[#E69F00] uppercase tracking-wider block mb-1">
                Câu hỏi chất vấn của Hội Đồng:
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-snug">{currentQ.question}</h3>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#6B4C38] mb-1">
                Ghi chú / Nháp câu trả lời của bạn:
              </label>
              <textarea
                value={userNotes[currentQ.id] || ''}
                onChange={(e) =>
                  setUserNotes({ ...userNotes, [currentQ.id]: e.target.value })
                }
                placeholder="Nhập ý tưởng trả lời của bạn trước khi mở đáp án chuẩn..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#EFE6D5] bg-[#FAF6F0] text-xs text-[#3D2314] focus:outline-none focus:border-[#E69F00] resize-none"
              />
            </div>

            <AnimatePresence>
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-[#FEF3D6] border border-[#E69F00]/40 text-xs text-[#3D2314] space-y-2 mb-4"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#D48800]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đáp Án Chuẩn Mẫu (Model Answer):</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.modelAnswer}</p>
                  <div className="pt-2 border-t border-[#E69F00]/25">
                    <span className="font-bold text-[11px] text-[#3D2314] block mb-1">Các ý cốt lõi bắt buộc:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQ.keyPoints.map((kp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white text-[10px] text-[#3D2314] font-medium border border-[#E69F00]/30"
                        >
                          ✓ {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#EFE6D5]">
            <button
              onClick={() =>
                setRevealedAnswers({
                  ...revealedAnswers,
                  [activeQuestion]: !isRevealed,
                })
              }
              className="px-4 py-2 rounded-xl bg-[#E69F00] text-[#3D2314] font-bold text-xs hover:bg-[#D48800] transition-colors cursor-pointer shadow-sm"
            >
              {isRevealed ? 'Ẩn Đáp Án Mẫu' : 'Xem Đáp Án Chuẩn Của Nhóm'}
            </button>

            <button
              onClick={() => {
                if (activeQuestion < COLD_CALLING_QUESTIONS.length) {
                  setActiveQuestion(activeQuestion + 1);
                }
              }}
              disabled={activeQuestion === COLD_CALLING_QUESTIONS.length}
              className="px-3.5 py-2 rounded-xl bg-[#3D2314] text-[#FAF6F0] font-bold text-xs hover:bg-[#4A2E1B] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Câu kế tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khung NotebookLM AI Chatbot (5 Cols) */}
        <div className="lg:col-span-5 bg-[#3D2314] text-[#FAF6F0] p-6 rounded-3xl border border-[#4A2E1B] shadow-xl flex flex-col justify-between h-[540px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#4A2E1B] mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E69F00] text-[#3D2314]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#FAF6F0] leading-tight">Trợ Lý NotebookLM AI</h3>
                  <span className="text-[10px] text-[#E69F00]">Đã huấn luyện trên 300 mẫu dữ liệu Cocoon</span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3 overflow-y-auto h-[350px] pr-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-[#2C1810] text-[#FAF6F0] border border-[#4A2E1B] mr-auto'
                      : 'bg-[#E69F00] text-[#3D2314] font-semibold ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#4A2E1B] flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Hỏi về Churn, Q4/25, Gold VIP, H1/2026..."
              className="flex-1 bg-[#2C1810] border border-[#4A2E1B] rounded-xl px-3 py-2 text-xs text-[#FAF6F0] placeholder-[#E5D9C5]/50 focus:outline-none focus:border-[#E69F00]"
            />
            <button
              onClick={handleSendChat}
              className="p-2 rounded-xl bg-[#E69F00] text-[#3D2314] hover:bg-[#D48800] transition-colors cursor-pointer"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
