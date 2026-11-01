import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Environment,
  ContactShadows,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  BarChart3,
  ExternalLink,
  BookOpen,
  Users,
  Send,
  Sparkles as SparklesIcon,
  Maximize2,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  TrendingUp,
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Check,
  Flame,
  ArrowRight,
  Bookmark,
  Share2,
} from 'lucide-react';

/* =========================================================================
   MÃ MÀU BẮT BUỘC (PALETTE)
   - Nền (Kem beige): #F7F1E7
   - Chữ / Đường nét (Nâu cà phê): #593522
   - Nhấn / Phát sáng (Vàng nghệ): #DDAA24
   - Cảnh báo / Rời bỏ (Hồng sen): #D98CA5
   - Phòng ấm cúng: #1a140f
========================================================================= */
const PALETTE = {
  bgCream: '#F7F1E7',
  textBrown: '#593522',
  accentGold: '#DDAA24',
  alertPink: '#D98CA5',
  woodOak: '#8B5A2B',
  darkRoom: '#120E0B',
};

// Âm thanh lật trang tự nhiên bằng Web Audio API (không cần file mp3 ngoài)
function playPageTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Mô phỏng tiếng sột soạt giấy mềm
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // Buffer tiếng ồn trắng (white noise)
    const bufferSize = ctx.sampleRate * 0.12;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext might be blocked until user interaction
  }
}

/* =========================================================================
   DỮ LIỆU ĐỒ ÁN: COCOON VIETNAM & CAM CONSUMER
========================================================================= */

// 1. Đội ngũ thành viên
const TEAM_MEMBERS = [
  {
    name: 'Nguyễn Văn An',
    role: 'Trưởng nhóm & Lead Data Analyst',
    desc: 'Phụ trách làm sạch dữ liệu, kiểm định phân phối lệch phải (Outliers) và mô hình hóa hành vi Churn 180 ngày.',
    avatar: '👨‍💼',
    tags: ['Python', 'Statistical Modeling', 'IQR Analysis'],
  },
  {
    name: 'Trần Thị Bình',
    role: 'BI Specialist & Dashboard Architect',
    desc: 'Thiết kế hệ thống Interactive Dashboard, phân tích ma trận Kênh × Sản phẩm và bản đồ nhiệt chuyển đổi.',
    avatar: '👩‍💻',
    tags: ['PowerBI', 'Data Visualization', 'Cohort Analysis'],
  },
  {
    name: 'Lê Hoàng Cường',
    role: 'Business Strategist & Marketing Analytics',
    desc: 'Phân tích ROI kênh tiếp thị, đề xuất tái cấu trúc kênh Referral & chiến lược giữ chân khách hàng Gold VIP.',
    avatar: '📊',
    tags: ['Marketing ROI', 'Customer Retention', 'Subscription'],
  },
  {
    name: 'Phạm Minh Đức',
    role: 'Data Engineer & ETL Developer',
    desc: 'Xây dựng pipeline chuẩn hóa 300 bản ghi khách hàng, trích xuất dữ liệu đa kênh và tính toán CLV chuẩn hóa.',
    avatar: '⚙️',
    tags: ['SQL', 'ETL Pipeline', 'Data Quality'],
  },
];

// 2. Dữ liệu phân tích chi tiết theo từng Quý (Các Quý)
interface QuarterInfo {
  quarter: string;
  year: string;
  newCustomers: number;
  highlight: string;
  churnRate: string;
  topChannel: string;
  topProduct: string;
  revenueEst: string;
  status: 'peak' | 'normal' | 'low';
  insight: string;
}

const QUARTER_DATA: QuarterInfo[] = [
  {
    quarter: 'Q4',
    year: '2023',
    newCustomers: 19,
    highlight: 'Khởi đầu chu kỳ nghiên cứu',
    churnRate: '42%',
    topChannel: 'Facebook Ads',
    topProduct: 'Toner Cà Phê Đắk Lắk',
    revenueEst: '28.5 triệu đ',
    status: 'normal',
    insight: 'Giai đoạn bắt đầu tích lũy dữ liệu khách hàng sạch sau đợt di chuyển hệ thống CRM.',
  },
  {
    quarter: 'Q1',
    year: '2024',
    newCustomers: 28,
    highlight: 'Tăng trưởng đầu xuân',
    churnRate: '38%',
    topChannel: 'Search Ads',
    topProduct: 'Serum Bí Đao',
    revenueEst: '44.8 triệu đ',
    status: 'normal',
    insight: 'Chiến dịch đầu năm thu hút nhóm khách hàng có ý định mua sắm cao từ Search Ads.',
  },
  {
    quarter: 'Q2',
    year: '2024',
    newCustomers: 23,
    highlight: 'Mùa hè tiêu dùng mỹ phẩm',
    churnRate: '45%',
    topChannel: 'Instagram',
    topProduct: 'Sữa rửa mặt Nghệ',
    revenueEst: '36.2 triệu đ',
    status: 'normal',
    insight: 'Nhóm khách hàng trẻ chuộng các dòng sản phẩm làm sạch và dịu da mùa hè.',
  },
  {
    quarter: 'Q3',
    year: '2024',
    newCustomers: 24,
    highlight: 'Ổn định phễu khách hàng',
    churnRate: '40%',
    topChannel: 'Marketplace',
    topProduct: 'Dưỡng thể Cà phê',
    revenueEst: '38.4 triệu đ',
    status: 'normal',
    insight: 'Kênh Shopee & Lazada bắt đầu đóng góp lượng khách quen mua lại ổn định.',
  },
  {
    quarter: 'Q4',
    year: '2024',
    newCustomers: 18,
    highlight: 'Điểm trũng cuối năm 2024',
    churnRate: '56%',
    topChannel: 'Referral',
    topProduct: 'Tẩy da chết Môi',
    revenueEst: '26.8 triệu đ',
    status: 'low',
    insight: 'Sự gia tăng đột biến của Referral kèm voucher đơn đầu dẫn đến tỷ lệ rời bỏ cao ngay sau khi nhận quà.',
  },
  {
    quarter: 'Q1',
    year: '2025',
    newCustomers: 21,
    highlight: 'Phục hồi nhu cầu chăm sóc',
    churnRate: '44%',
    topChannel: 'Search Ads',
    topProduct: 'Serum Bí Đao',
    revenueEst: '32.5 triệu đ',
    status: 'normal',
    insight: 'Thương hiệu cơ cấu lại ngân sách tiếp thị tìm kiếm để nâng cao chất lượng khách hàng.',
  },
  {
    quarter: 'Q2',
    year: '2025',
    newCustomers: 26,
    highlight: 'Tăng tốc chiến dịch quà tặng',
    churnRate: '39%',
    topChannel: 'TikTok',
    topProduct: 'Mặt nạ hoa hồng',
    revenueEst: '41.6 triệu đ',
    status: 'normal',
    insight: 'Kênh TikTok Shop tạo làn sóng viral ngắn hạn, kéo lượt tải ứng dụng và đơn hàng mới.',
  },
  {
    quarter: 'Q3',
    year: '2025',
    newCustomers: 29,
    highlight: 'Tích lũy phễu trước siêu sale',
    churnRate: '35%',
    topChannel: 'Marketplace',
    topProduct: 'Dưỡng thể Cà phê',
    revenueEst: '48.2 triệu đ',
    status: 'normal',
    insight: 'Gia tăng các chương trình thành viên Bronze & Silver, chuẩn bị cơ sở khách hàng cho Q4.',
  },
  {
    quarter: 'Q4',
    year: '2025',
    newCustomers: 39,
    highlight: 'ĐỈNH CAO KỶ LỤC (PEAK)',
    churnRate: '31%',
    topChannel: 'Search Ads & Marketplace',
    topProduct: 'Combo Trị Mụn Bí Đao',
    revenueEst: '72.4 triệu đ',
    status: 'peak',
    insight: 'Lượng khách mới đạt đỉnh cao nhất lịch sử (39 khách) nhờ kết hợp mùa mua sắm cuối năm, siêu sale và tối ưu Search Ads.',
  },
  {
    quarter: 'Q1',
    year: '2026',
    newCustomers: 21,
    highlight: 'Hạ nhiệt sau mùa Tết',
    churnRate: '41%',
    topChannel: 'Search Ads',
    topProduct: 'Sữa rửa mặt Nghệ',
    revenueEst: '34.0 triệu đ',
    status: 'normal',
    insight: 'Tâm lý thắt chặt chi tiêu sau kỳ nghỉ Tết, doanh số duy trì từ khách quen quay lại.',
  },
  {
    quarter: 'Q2',
    year: '2026',
    newCustomers: 25,
    highlight: 'Tăng trưởng biên lợi nhuận H1',
    churnRate: '33%',
    topChannel: 'Marketplace',
    topProduct: 'Dưỡng thể & Nước hoa',
    revenueEst: '42.8 triệu đ',
    status: 'normal',
    insight: 'Giai đoạn Q2/2026 ghi nhận biên lợi nhuận tăng vọt lên 31,1%, lợi nhuận tăng +33% so với Q1.',
  },
  {
    quarter: 'Q3',
    year: '2026',
    newCustomers: 27,
    highlight: 'Khép lại 3 năm nghiên cứu',
    churnRate: '32%',
    topChannel: 'Search Ads',
    topProduct: 'Dưỡng thể Subscription',
    revenueEst: '46.5 triệu đ',
    status: 'normal',
    insight: 'Thử nghiệm gói đăng ký định kỳ 2-3 tháng/lần cho nhóm khách trung thành chứng minh hiệu quả giữ chân 0% churn.',
  },
];

// So sánh Q1 vs Q2 (Dữ liệu từ Netlify Cam Consumer)
const H1_QUARTERS_COMPARISON = {
  revenueH1: '99,24 tỷ đ',
  q1Rev: '45,85 tỷ đ',
  q2Rev: '53,39 tỷ đ',
  revGrowth: '+16,4%',
  costH1: '70,17 tỷ đ',
  q1Cost: '33,37 tỷ đ',
  q2Cost: '36,80 tỷ đ',
  costGrowth: '+10,3%',
  profitH1: '29,07 tỷ đ',
  q1Profit: '12,48 tỷ đ',
  q2Profit: '16,59 tỷ đ',
  profitGrowth: '≈ +33,0%',
  marginH1: '29,3%',
  q1Margin: '27,2%',
  q2Margin: '31,1%',
  marginGrowth: '+3,9 điểm %',
};

// 3. Thư viện 6 biểu đồ phân tích thực chứng
const CHART_GALLERY = [
  {
    id: 1,
    title: 'Khách mới tăng mạnh nhất vào Q4/25',
    type: 'Biểu đồ đường · Khách mới theo quý',
    image: '/assets/aistudio/bi_u____1_xu_h__ng_4e8bbcf0.png',
    keyTakeaway: 'Khách mới tăng mạnh nhất vào Q4/25 (39 khách), trùng với mùa mua sắm & siêu sale cuối năm.',
    recommendation: 'Chủ động chuẩn bị ngân sách tiếp thị và dự trữ tồn kho từ cuối Q3 để đón đầu điểm rơi doanh số.',
  },
  {
    id: 2,
    title: 'Giá trị khách hàng lệch phải: Trung vị thấp hơn trung bình',
    type: 'Histogram · Phân phối CLV mỗi khách',
    image: '/assets/aistudio/bi_u____2_ph_n_ph_i_CLV_7084ef0d.png',
    keyTakeaway: 'Dữ liệu CLV lệch phải: Đại đa số (108 người) ở mức 0–1 trđ, kéo trung bình (1,74 trđ) vượt xa trung vị (1,41 trđ).',
    recommendation: 'Báo cáo CLV điển hình bằng Trung vị (1,41 trđ); dùng Trung bình khi dự báo tổng ngân thu doanh nghiệp.',
  },
  {
    id: 3,
    title: 'Referral rời bỏ cao nhất, Search ads thấp nhất',
    type: 'Biểu đồ cột · Tỷ lệ rời bỏ theo kênh thu hút',
    image: '/assets/aistudio/bi_u____3_r_i_b__theo_k_nh_2e87060f.png',
    keyTakeaway: 'Referral có tỷ lệ Churn kỷ lục 64% (n=22) do voucher đơn đầu. Search ads trung thành nhất với chỉ 34% Churn.',
    recommendation: 'Đổi thưởng Referral sang voucher đơn thứ hai; tái phân bổ ngân sách sang Search ads cho các sản phẩm phễu.',
  },
  {
    id: 4,
    title: 'Hạng Member giá trị thấp, hạng Gold cao nhưng biên độ rộng',
    type: 'Box plot · CLV theo hạng thành viên',
    image: '/assets/aistudio/bi_u____4_CLV_theo_h_ng_e18a09c5.png',
    keyTakeaway: 'Member có CLV trung vị chỉ 0,40 trđ. Hạng Gold VIP đạt trung vị 4,63 trđ nhưng có đến 50% (12 khách) đã rời bỏ.',
    recommendation: 'Kích hoạt chương trình VIP Care cá nhân hóa khi khách Gold chưa mua sau 120-150 ngày để tránh mất 55,5 trđ.',
  },
  {
    id: 5,
    title: 'Càng lâu không mua, giá trị càng thấp',
    type: 'Scatter plot · Ngày từ lần mua cuối và CLV',
    image: '/assets/aistudio/bi_u____5_recency_CLV_19c588a9.png',
    keyTakeaway: 'Khách còn hoạt động nằm gọn trong 0–180 ngày; toàn bộ khách Churn dồn về phía >= 180 đến 300+ ngày.',
    recommendation: 'Xác lập mốc 180 ngày (tương đương 2 chu kỳ tiêu dùng mỹ phẩm) làm ngưỡng can thiệp Churn chuẩn xác.',
  },
  {
    id: 6,
    title: 'Kênh nào kéo khách về nhóm sản phẩm nào',
    type: 'Heat map · Kênh thu hút × Nhóm sản phẩm yêu thích',
    image: '/assets/aistudio/bi_u____6_k_nh_x_s_n_ph_m_d0e598b6.png',
    keyTakeaway: 'Marketplace dẫn đầu Dưỡng thể (14) & Kem dưỡng (13). Instagram hút mạnh Sữa rửa mặt (14). Nhóm Marketplace x Dưỡng thể có 15 hội viên 0% Churn.',
    recommendation: 'Triển khai ngay gói đăng ký định kỳ (Subscription) 2-3 tháng/lần cho 15 khách hàng trung thành này.',
  },
];

// 4. Giả lập Cold Calling & Vấn đáp bảo vệ đồ án (giống Netlify Dashboard)
const COLD_CALLING_QUESTIONS = [
  {
    id: 1,
    question: 'Doanh thu và lợi nhuận thay đổi thế nào từ Q1 sang Q2/2026?',
    modelAnswer:
      'Từ Q1 sang Q2, doanh thu tăng trưởng từ 45,85 tỷ lên 53,39 tỷ (+16,4%). Lợi nhuận bứt phá mạnh từ 12,48 tỷ lên 16,59 tỷ (tăng ≈ +33,0%). Biên lợi nhuận cải thiện từ 27,2% lên 31,1% (+3,9 điểm %). Tốc độ tăng trưởng lợi nhuận gấp đôi tốc độ tăng doanh thu nhờ tối ưu chi phí nguyên liệu và cơ cấu sản phẩm biên cao.',
    keyPoints: ['Q2 doanh thu 53,39 tỷ (+16,4%)', 'Lợi nhuận 16,59 tỷ (+33,0%)', 'Biên lợi nhuận 31,1% (+3,9 điểm %)'],
  },
  {
    id: 2,
    question: 'Tại sao CLV trung bình (1,74 trđ) lại cao hơn đáng kể so với trung vị (1,41 trđ)?',
    modelAnswer:
      'Dữ liệu CLV có phân phối lệch phải (Right-skewed) rõ rệt. Đa số khách hàng (108 người) tập trung ở mức 0–1 triệu đồng. Tuy nhiên, một số khách hàng VIP hạng Gold có CLV cực lớn (đạt tới 4–9 triệu đồng, trung vị 4,63 triệu đ). Những giá trị ngoại lai (outliers) này kéo trung bình lên 1,74 triệu đ. Trung vị (1,41 triệu đ) mới là thước đo chuẩn xác cho khách hàng điển hình.',
    keyPoints: ['Phân phối lệch phải', 'Nhóm Gold kéo số bình quân lên cao', 'Dùng Trung vị (1,41 trđ) đại diện chuẩn'],
  },
  {
    id: 3,
    question: 'Vì sao kênh Referral có tỷ lệ Churn cao nhất (64%, n=22)? Đề xuất khắc phục?',
    modelAnswer:
      'Chính sách Referral hiện tại tặng voucher giảm giá lớn ngay cho đơn hàng đầu tiên, thu hút người săn khuyến mãi rồi rời đi sau một lần mua. Đề xuất: Đổi cơ chế thưởng sang voucher cho đơn thứ hai hoặc tích điểm tích lũy, nâng giá trị đơn hàng tối thiểu và tạo luồng onboarding chăm sóc khách sau mua.',
    keyPoints: ['Do voucher giảm giá đơn đầu', 'Thu hút khách săn sale ngắn hạn', 'Đổi sang thưởng đơn thứ 2'],
  },
  {
    id: 4,
    question: 'Search Ads có tỷ lệ Churn thấp nhất (34%, n=38). Làm sao scale-up hiệu quả?',
    modelAnswer:
      'Khách từ Search Ads có ý định mua sắm (purchase intent) chủ động khi tìm kiếm từ khóa cụ thể. Đề xuất tái phân bổ ngân sách từ Referral sang Search Ads, tập trung vào 3 sản phẩm phễu chủ lực: Serum Bí Đao (9 khách), Sữa rửa mặt (8 khách), Kem dưỡng (5 khách), kết hợp kích hoạt quy trình tái tiếp thị trước mốc 90 ngày.',
    keyPoints: ['Khách chủ động có nhu cầu cao', 'Chuyển ngân sách từ Referral sang Search', 'Đẩy mạnh 3 sản phẩm phễu'],
  },
  {
    id: 5,
    question: 'Hạng Gold VIP có 50% rời bỏ. Thiệt hại ước tính và giải pháp cứu vãn?',
    modelAnswer:
      'Hạng Gold sở hữu CLV trung vị cao nhất là 4,63 triệu đồng (n=24). Tỷ lệ Churn 50% (tương đương 12 người) làm thất thoát trực tiếp khoảng 55,56 triệu đồng. Giải pháp: Thiết lập cảnh báo sớm tại mốc 120–150 ngày chưa tái đặt hàng, kích hoạt dịch vụ VIP Care 1:1, tặng quà tri ân và ưu đãi độc quyền để cứu vãn dòng tiền.',
    keyPoints: ['Mất 12 khách VIP = 55,56 triệu đồng', 'Cảnh báo sớm tại 120-150 ngày', 'Kích hoạt VIP Care 1:1'],
  },
  {
    id: 6,
    question: 'Cơ sở khoa học nào để nhóm chọn mốc 180 ngày làm tiêu chí Churn?',
    modelAnswer:
      'Căn cứ thứ nhất: Dữ liệu phân bố thực nghiệm trên biểu đồ Scatter Plot cho thấy 100% khách còn hoạt động nằm trong 0–180 ngày, toàn bộ khách rời bỏ dồn về >=180 ngày. Căn cứ thứ hai: Chu kỳ tiêu dùng mỹ phẩm Cocoon trung bình là 60–90 ngày. Mốc 180 ngày tương đương 2 chu kỳ tiêu dùng liên tiếp không mua, xác suất quay lại gần như bằng 0.',
    keyPoints: ['Scatter plot phân tách rõ rệt', 'Chu kỳ mỹ phẩm 60-90 ngày', '180 ngày = 2 chu kỳ bỏ trống'],
  },
];

/* =========================================================================
   3D SCENE: CĂN PHÒNG ẤM CÚNG & GIÁ SÁCH PHOTOREALISTIC
   - Kệ sách gỗ sồi trung tâm (honey oak)
   - Đèn ấm vàng, sách xếp trên kệ
   - Cuốn sách chính nằm ở vị trí tâm điểm
   - Khi hover: sách nhô ra nhẹ
   - Khi click: sách rút khỏi kệ, bay ra trước mắt và mở trang
========================================================================= */

// Kệ sách bằng gỗ sồi ấm áp (Honey Oak Bookshelf)
function BookshelfBay() {
  const oakMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#8E5E35', // Gỗ sồi ấm áp mật ong
        roughness: 0.65,
        metalness: 0.08,
        clearcoat: 0.2,
        clearcoatRoughness: 0.35,
      }),
    []
  );

  return (
    <group position={[0, -0.1, -0.6]}>
      {/* Vách lưng tủ gỗ sồi */}
      <mesh position={[0, 0, -0.32]} receiveShadow>
        <boxGeometry args={[4.4, 3.4, 0.04]} />
        <meshPhysicalMaterial color="#6B4423" roughness={0.8} />
      </mesh>

      {/* Tấm hông trái */}
      <mesh position={[-2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>

      {/* Tấm hông phải */}
      <mesh position={[2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>

      {/* Vách ngăn đứng giữa (2 trụ phân chia 3 gian) */}
      <mesh position={[-0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>

      {/* Tấm nóc tủ trên cùng */}
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.42, 0.08, 0.68]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>

      {/* Các đợt kệ ngang (Shelves) */}
      {/* Kệ tầng 1 (Dưới cùng) */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      {/* Kệ tầng 2 (Tầng anh hùng - Đặt cuốn sách chính) */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      {/* Kệ tầng 3 */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      {/* Kệ tầng 4 */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>

      {/* Dải đèn fairy lights viền mép đợt kệ */}
      <mesh position={[0, -0.37, 0.28]}>
        <boxGeometry args={[4.3, 0.015, 0.015]} />
        <meshBasicMaterial color="#FFDA88" />
      </mesh>
    </group>
  );
}

// Các cuốn sách phụ trên các tầng kệ tạo chiều sâu căn phòng
function BackgroundShelfBooks() {
  const bookColors = [
    '#3B1F17',
    '#1B2E25',
    '#252C3D',
    '#4A2E1B',
    '#5A2326',
    '#2E3321',
    '#3C3528',
    '#422918',
    '#1F3540',
  ];

  const books = useMemo(() => {
    const list = [];
    // Gian trái tầng 2
    for (let i = 0; i < 9; i++) {
      list.push({
        pos: [-1.8 + i * 0.11, -0.15, -0.55],
        size: [0.08, 0.45 + (i % 3) * 0.05, 0.32],
        color: bookColors[i % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.05, 0],
      });
    }
    // Gian phải tầng 2
    for (let i = 0; i < 9; i++) {
      list.push({
        pos: [0.9 + i * 0.11, -0.15, -0.55],
        size: [0.08, 0.46 + (i % 4) * 0.04, 0.32],
        color: bookColors[(i + 3) % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.05, 0],
      });
    }
    // Gian giữa tầng 3
    for (let i = 0; i < 11; i++) {
      list.push({
        pos: [-0.55 + i * 0.1, 0.7, -0.55],
        size: [0.075, 0.44 + (i % 3) * 0.04, 0.3],
        color: bookColors[(i + 5) % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.04, 0],
      });
    }
    // Gian trái tầng 3
    for (let i = 0; i < 8; i++) {
      list.push({
        pos: [-1.75 + i * 0.12, 0.7, -0.55],
        size: [0.09, 0.48 + (i % 2) * 0.05, 0.32],
        color: bookColors[(i + 2) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {books.map((b, idx) => (
        <mesh key={idx} position={b.pos as [number, number, number]} rotation={b.rot as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={b.size as [number, number, number]} />
          <meshPhysicalMaterial color={b.color} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      {/* Đèn bàn mini nhỏ trên kệ tạo ánh sáng ấm cúng (như ảnh tham khảo) */}
      <group position={[-1.25, 0.65, -0.45]}>
        {/* Chụp đèn gốm */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.16, 0.18, 32]} />
          <meshPhysicalMaterial
            color="#FFF4D4"
            emissive="#FFC766"
            emissiveIntensity={1.2}
            roughness={0.3}
          />
        </mesh>
        {/* Chân đế gỗ */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.06, 32]} />
          <meshPhysicalMaterial color="#5A3A1E" roughness={0.8} />
        </mesh>
        <pointLight color="#FFAE42" intensity={1.5} distance={1.8} decay={2} />
      </group>

      {/* Lọ gốm trang trí tầng 3 */}
      <mesh position={[1.4, 0.7, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.36, 24]} />
        <meshPhysicalMaterial color="#E8DAC6" roughness={0.35} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

// CUỐN SÁCH CHÍNH TRÊN KỆ (THE HERO BOOK)
interface HeroBookOnShelfProps {
  onOpenBook: () => void;
  isReading: boolean;
}

function HeroBookOnShelf({ onOpenBook, isReading }: HeroBookOnShelfProps) {
  const [hovered, setHovered] = useState(false);
  const bookGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    document.body.style.cursor = hovered && !isReading ? 'pointer' : 'default';
  }, [hovered, isReading]);

  // Hoạt ảnh rút sách nhẹ khi hover hoặc khi người dùng click mở
  useFrame((state, delta) => {
    if (!bookGroupRef.current) return;

    // Vị trí tĩnh trên kệ tầng 2: [0, -0.12, -0.45]
    // Khi hover: sách trượt nhẹ ra ngoài ~12cm và nhếch nghiêng nhẹ
    const targetZ = hovered ? -0.22 : -0.45;
    const targetRotY = hovered ? 0.18 : 0.0;
    const targetRotX = hovered ? -0.05 : 0.0;

    bookGroupRef.current.position.z = THREE.MathUtils.lerp(
      bookGroupRef.current.position.z,
      targetZ,
      delta * 6
    );
    bookGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.y,
      targetRotY,
      delta * 6
    );
    bookGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.x,
      targetRotX,
      delta * 6
    );

    // Ánh sáng phát quang khi hover
    if (glowLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.3;
      const targetIntensity = hovered ? 2.5 + pulse : 0.8 + pulse * 0.2;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(
        glowLightRef.current.intensity,
        targetIntensity,
        delta * 6
      );
    }
  });

  return (
    <group
      ref={bookGroupRef}
      position={[0, -0.12, -0.45]}
      onClick={(e) => {
        e.stopPropagation();
        onOpenBook();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Khối Bìa Sách Chính - Da cao cấp mạ chỉ vàng sang trọng */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.54, 0.38]} />
        <meshPhysicalMaterial
          color="#381D14" // Da nâu sáp sẫm sang trọng
          roughness={0.35}
          metalness={0.2}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
          emissive={PALETTE.accentGold}
          emissiveIntensity={hovered ? 0.35 : 0.12}
        />
      </mesh>

      {/* Sống gáy sách viền vàng (Book Spine) hướng ra ngoài */}
      <mesh position={[0, 0, 0.192]}>
        <planeGeometry args={[0.15, 0.52]} />
        <meshPhysicalMaterial
          color={PALETTE.accentGold}
          roughness={0.2}
          metalness={0.85}
          clearcoat={0.7}
          emissive={PALETTE.accentGold}
          emissiveIntensity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Đường chữ dập nổi mạ vàng trên gáy sách */}
      <mesh position={[0, 0, 0.195]}>
        <planeGeometry args={[0.07, 0.42]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive={PALETTE.accentGold}
          emissiveIntensity={hovered ? 1.4 : 0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Cạnh giấy ngà tự nhiên (Top & Bottom page edges) */}
      <mesh position={[0, 0.265, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <meshPhysicalMaterial color="#F7F1E7" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.265, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <meshPhysicalMaterial color="#F7F1E7" roughness={0.9} />
      </mesh>

      {/* Vầng hào quang ánh vàng nhẹ khi hover */}
      <pointLight
        ref={glowLightRef}
        position={[0, 0, 0.25]}
        color={PALETTE.accentGold}
        intensity={0.8}
        distance={1.6}
        decay={2}
      />

      {/* Hạt bụi vàng thần bí lượn quanh cuốn sách */}
      <Sparkles
        count={hovered ? 45 : 18}
        scale={0.9}
        size={hovered ? 3.0 : 1.8}
        speed={hovered ? 0.6 : 0.25}
        color={PALETTE.accentGold}
        opacity={hovered ? 0.85 : 0.4}
      />
    </group>
  );
}

// Toàn cảnh không gian 3D căn phòng ấm áp
function CozyRoomScene({
  onOpenBook,
  isReading,
}: {
  onOpenBook: () => void;
  isReading: boolean;
}) {
  return (
    <>
      <color attach="background" args={[PALETTE.darkRoom]} />

      {/* Ánh sáng môi trường tự nhiên */}
      <ambientLight intensity={0.5} color="#FFE6CC" />

      {/* Ánh nắng hoàng hôn từ cửa sổ bên phải (Golden hour light) */}
      <directionalLight
        position={[4.5, 3.2, 2.5]}
        intensity={2.2}
        color="#FFA84A"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Đèn trần trung tâm dịu nhẹ */}
      <pointLight position={[0, 3.5, 1.2]} intensity={1.4} color="#FFF1DB" decay={2} distance={8} />

      {/* Đèn rọi trực tiếp vào kệ sách trung tâm */}
      <spotLight
        position={[0, 2.4, 2.0]}
        target-position={[0, -0.1, -0.5]}
        intensity={3.2}
        angle={0.65}
        penumbra={0.8}
        color="#FFF3D6"
        castShadow
      />

      {/* Kệ sách gỗ sồi trung tâm */}
      <BookshelfBay />

      {/* Các cuốn sách phụ và phụ kiện trên kệ */}
      <BackgroundShelfBooks />

      {/* Cuốn sách anh hùng có thể rút ra */}
      <HeroBookOnShelf onOpenBook={onOpenBook} isReading={isReading} />

      {/* Sàn gỗ sẫm màu có vân bóng nhẹ */}
      <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshPhysicalMaterial
          color="#2B1A11" // Gỗ sàn màu nâu sẫm sáp bóng
          roughness={0.4}
          metalness={0.15}
          clearcoat={0.3}
        />
      </mesh>

      {/* Đổ bóng tiếp xúc thực tế */}
      <ContactShadows position={[0, -1.74, 0]} opacity={0.65} scale={8} blur={2.2} far={2} />
    </>
  );
}

/* =========================================================================
   GIAO DIỆN MỞ SÁCH THỰC TẾ & LẬT TRANG (REALISTIC 3D PAGE FLIP)
========================================================================= */

// Modal Lightbox xem biểu đồ phóng to chi tiết
function ImageLightbox({
  image,
  title,
  onClose,
}: {
  image: string | null;
  title: string | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative max-w-4xl max-h-[92vh] bg-[#F7F1E7] p-3 rounded-2xl shadow-2xl border border-[#593522]/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#593522] text-[#F7F1E7] rounded-full hover:bg-[#DDAA24] hover:text-[#593522] transition-colors z-10 cursor-pointer shadow-md"
          aria-label="Đóng ảnh"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="overflow-hidden rounded-xl border border-[#593522]/15 bg-white">
          <img src={image} alt={title || 'Biểu đồ chi tiết'} className="w-full h-auto object-contain max-h-[75vh]" />
        </div>
        <div className="mt-3 text-center">
          <p className="font-bold text-sm text-[#593522]">{title}</p>
          <span className="text-[11px] text-[#593522]/70">Dữ liệu nguồn trích từ Báo cáo Phân tích Khách hàng Cocoon</span>
        </div>
      </motion.div>
    </div>
  );
}

// Modal xem trước file Excel dữ liệu sạch
function ExcelPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl bg-[#F7F1E7] text-[#593522] rounded-2xl shadow-2xl p-6 border border-[#593522]/30 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#593522]/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#593522] text-[#F7F1E7] rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-[#DDAA24]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Dữ liệu Khách hàng Cocoon Vietnam (Cleaned)</h3>
              <p className="text-xs text-[#593522]/70">300 bản ghi khách hàng chuẩn hóa · Giai đoạn Q4/2023 – Q3/2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#593522]/10 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#593522]/15 rounded-lg text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#593522] text-[#F7F1E7] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">CustomerID</th>
                <th className="py-2.5 px-3">Kênh Thu Hút</th>
                <th className="py-2.5 px-3">Sản Phẩm</th>
                <th className="py-2.5 px-3">Hạng Thành Viên</th>
                <th className="py-2.5 px-3 text-right">CLV (VNĐ)</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#593522]/10">
              <tr className="hover:bg-[#593522]/5">
                <td className="py-2 px-3 font-mono">CCN_001</td>
                <td className="py-2 px-3">Search ads</td>
                <td className="py-2 px-3">Serum Bí Đao</td>
                <td className="py-2 px-3 font-semibold text-[#DDAA24]">Gold</td>
                <td className="py-2 px-3 text-right font-mono font-bold">4.850.000</td>
                <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">Hoạt động</span></td>
              </tr>
              <tr className="hover:bg-[#593522]/5">
                <td className="py-2 px-3 font-mono">CCN_002</td>
                <td className="py-2 px-3">Referral</td>
                <td className="py-2 px-3">Toner Cà Phê</td>
                <td className="py-2 px-3 font-semibold">Member</td>
                <td className="py-2 px-3 text-right font-mono font-bold">420.000</td>
                <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-[#D98CA5]/30 text-[#852844] text-[10px] font-medium">Đã rời bỏ (64%)</span></td>
              </tr>
              <tr className="hover:bg-[#593522]/5">
                <td className="py-2 px-3 font-mono">CCN_003</td>
                <td className="py-2 px-3">Marketplace</td>
                <td className="py-2 px-3">Dưỡng thể Cà phê</td>
                <td className="py-2 px-3 font-semibold text-amber-700">Bronze</td>
                <td className="py-2 px-3 text-right font-mono font-bold">1.280.000</td>
                <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">Hoạt động (Sub 15)</span></td>
              </tr>
              <tr className="hover:bg-[#593522]/5">
                <td className="py-2 px-3 font-mono">CCN_004</td>
                <td className="py-2 px-3">Instagram</td>
                <td className="py-2 px-3">Sữa rửa mặt Nghệ Hưng Yên</td>
                <td className="py-2 px-3 font-semibold text-slate-600">Silver</td>
                <td className="py-2 px-3 text-right font-mono font-bold">2.640.000</td>
                <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">Hoạt động</span></td>
              </tr>
              <tr className="hover:bg-[#593522]/5">
                <td className="py-2 px-3 font-mono">CCN_005</td>
                <td className="py-2 px-3">TikTok</td>
                <td className="py-2 px-3">Tẩy da chết Môi</td>
                <td className="py-2 px-3 font-semibold text-[#DDAA24]">Gold</td>
                <td className="py-2 px-3 text-right font-mono font-bold">4.630.000</td>
                <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-[#D98CA5]/30 text-[#852844] text-[10px] font-medium">Đã rời bỏ (50% Gold)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-[#593522]/15 flex items-center justify-between text-xs text-[#593522]/80">
          <span>Tổng số mẫu: 300 khách hàng hợp lệ (Đã loại bỏ trùng lặp và null)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#593522] text-[#F7F1E7] rounded-lg font-medium hover:bg-[#DDAA24] hover:text-[#593522] transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================
   CÁC TRANG NỘI DUNG CUỐN SÁCH (BOOK SPREADS)
========================================================================= */

// TRANG 1 & 2: BÌA TRONG & ĐỘI NGŨ THỰC HIỆN
function PageSpread1() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Trang Trái: Lời Tựa & Case Study Tổng Quan */}
      <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#593522]/20 pb-6 md:pb-0 md:pr-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-2">
            <Bookmark className="w-4 h-4" />
            <span>Chương I · Tổng Quan Báo Cáo</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#593522] leading-tight mb-3">
            Báo Cáo Phân Tích Dữ Liệu Khách Hàng Cocoon Vietnam
          </h2>
          <div className="p-3.5 rounded-xl bg-[#593522]/5 border border-[#593522]/15 mb-4 text-xs leading-relaxed text-[#593522]">
            <p className="font-semibold text-[#DDAA24] mb-1">Giai đoạn nghiên cứu: Q4/2023 – Q3/2026</p>
            <p>
              Báo cáo thực chứng khám phá quy luật biến động của 300 khách hàng chuẩn hóa, tìm ra thời điểm vàng thu hút khách mới vào <strong>Q4/25 (39 khách)</strong>, giải mã mốc rời bỏ <strong>180 ngày</strong> và định vị chiến lược giữ chân nhóm <strong>Gold VIP</strong>.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-[#593522]/85">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#DDAA24]" />
              <span>Phương pháp: Descriptive Analytics, EDA & RFM Segmentation</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#DDAA24]" />
              <span>Quy mô dữ liệu: 300 khách hàng, 7 kênh tiếp thị, 8 nhóm sản phẩm</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#DDAA24]" />
              <span>Nền tảng: Python, PowerBI Dashboard & Trực quan hóa PBR 3D</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>Cam Consumer & Cocoon Vietnam Data Study</span>
          <span className="font-serif italic">Trang 1</span>
        </div>
      </div>

      {/* Trang Phải: Đội Ngũ Thực Hiện (4 Thành Viên) */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-2">
            <Users className="w-4 h-4" />
            <span>Hồ Sơ Đồ Án</span>
          </div>
          <h3 className="text-xl font-bold text-[#593522] mb-3">Đội Ngũ Thực Hiện</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {TEAM_MEMBERS.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/80 border border-[#593522]/15 hover:border-[#DDAA24] transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">{m.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-[#593522] leading-tight">{m.name}</h4>
                    <span className="text-[10px] text-[#DDAA24] font-semibold">{m.role}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#593522]/75 leading-relaxed mb-2">{m.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {m.tags.slice(0, 2).map((t, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#F7F1E7] border border-[#593522]/10 text-[#593522]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#593522]/5 border border-[#593522]/10 text-[11px] text-[#593522]">
            <strong className="text-[#DDAA24]">Cam kết nghiên cứu: </strong>
            Toàn bộ số liệu và đồ thị đều được trích xuất từ dữ liệu sạch, đảm bảo tính khách quan và khoa học khi bảo vệ trước Hội đồng.
          </div>
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>Học phần Phân tích Dữ liệu Kinh doanh</span>
          <span className="font-serif italic">Trang 2</span>
        </div>
      </div>
    </div>
  );
}

// TRANG 3 & 4: PHÂN TÍCH CHI TIẾT THEO QUÝ (CÁC QUÝ)
function PageSpread2() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4/2025');

  const currentQ = useMemo(() => {
    return (
      QUARTER_DATA.find((q) => `${q.quarter}/${q.year}` === selectedQuarter) ||
      QUARTER_DATA[8] // Q4/2025 đỉnh cao
    );
  }, [selectedQuarter]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Trang Trái: Bộ Chọn Tương Tác Các Quý & Số Liệu Quý Đang Chọn */}
      <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#593522]/20 pb-6 md:pb-0 md:pr-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-2">
            <Calendar className="w-4 h-4" />
            <span>Chương II · Dữ Liệu Các Quý (Q4/23 – Q3/26)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#593522] leading-tight mb-1">
            Phân Tích Chi Tiết Từng Quý
          </h2>
          <p className="text-xs text-[#593522]/75 mb-3">
            Bấm chọn bất kỳ Quý nào bên dưới để khám phá diễn biến khách mới, kênh tiếp thị và tỷ lệ rời bỏ:
          </p>

          {/* Dải nút bấm các quý (12 Quý) */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-4">
            {QUARTER_DATA.map((q) => {
              const qKey = `${q.quarter}/${q.year}`;
              const isSelected = selectedQuarter === qKey;
              const isPeak = q.status === 'peak';

              return (
                <button
                  key={qKey}
                  onClick={() => setSelectedQuarter(qKey)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#593522] text-[#F7F1E7] ring-2 ring-[#DDAA24] shadow-md'
                      : isPeak
                      ? 'bg-amber-100 text-amber-900 border border-[#DDAA24] hover:bg-amber-200'
                      : 'bg-white/70 text-[#593522] border border-[#593522]/15 hover:bg-[#593522]/10'
                  }`}
                >
                  <span className="text-[11px] leading-tight">{q.quarter}</span>
                  <span className="text-[9px] opacity-75">{q.year.slice(2)}</span>
                  {isPeak && <span className="text-[8px] text-amber-600 font-extrabold">⭐ Peak</span>}
                </button>
              );
            })}
          </div>

          {/* Hộp chi tiết Quý đang chọn */}
          <motion.div
            key={selectedQuarter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/90 border border-[#593522]/20 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-[#593522]/15 pb-2">
              <div>
                <span className="text-xs font-bold text-[#DDAA24] uppercase tracking-wider">Thông số quý</span>
                <h3 className="text-lg font-extrabold text-[#593522]">
                  {currentQ.quarter}/{currentQ.year} — {currentQ.highlight}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#593522]/70 block">Khách mới</span>
                <span className="text-lg font-extrabold text-[#DDAA24]">{currentQ.newCustomers} khách</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#F7F1E7]/80">
                <span className="text-[10px] text-[#593522]/70 block">Tỷ lệ rời bỏ (Churn):</span>
                <span
                  className={`font-bold ${
                    parseInt(currentQ.churnRate) >= 50 ? 'text-[#D98CA5]' : 'text-emerald-700'
                  }`}
                >
                  {currentQ.churnRate}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7F1E7]/80">
                <span className="text-[10px] text-[#593522]/70 block">Kênh dẫn đầu:</span>
                <span className="font-bold text-[#593522]">{currentQ.topChannel}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7F1E7]/80">
                <span className="text-[10px] text-[#593522]/70 block">Sản phẩm tiêu biểu:</span>
                <span className="font-bold text-[#593522] truncate block">{currentQ.topProduct}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F7F1E7]/80">
                <span className="text-[10px] text-[#593522]/70 block">Ước tính doanh số:</span>
                <span className="font-bold text-[#593522]">{currentQ.revenueEst}</span>
              </div>
            </div>

            <p className="text-xs text-[#593522]/85 italic pt-1 border-t border-[#593522]/10">
              💡 {currentQ.insight}
            </p>
          </motion.div>
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>Chuỗi thời gian khách mới 12 Quý</span>
          <span className="font-serif italic">Trang 3</span>
        </div>
      </div>

      {/* Trang Phải: Báo Cáo H1/2026 (Q1 vs Q2 - Cam Consumer) */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>So Sánh Chuyên Sâu Quý 1 vs Quý 2</span>
          </div>
          <h3 className="text-xl font-bold text-[#593522] mb-1">
            Báo Cáo Hoạt Động H1/2026 (Q1 & Q2)
          </h3>
          <p className="text-xs text-[#593522]/75 mb-3.5">
            Phân tích tốc độ tăng trưởng và hiệu quả hoạt động giữa 2 quý liên tiếp theo dữ liệu Cam Consumer:
          </p>

          {/* 4 Thẻ so sánh Q1 vs Q2 */}
          <div className="space-y-2.5 mb-4">
            {/* 1. Doanh thu */}
            <div className="p-3 rounded-xl bg-white/80 border border-[#593522]/15">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#593522]">Doanh Thu H1: 99,24 tỷ đ</span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Q2 so với Q1: {H1_QUARTERS_COMPARISON.revGrowth}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#593522]/70">
                <span>Q1: {H1_QUARTERS_COMPARISON.q1Rev}</span>
                <span>Q2: {H1_QUARTERS_COMPARISON.q2Rev}</span>
              </div>
            </div>

            {/* 2. Chi phí */}
            <div className="p-3 rounded-xl bg-white/80 border border-[#593522]/15">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#593522]">Tổng Chi Phí H1: 70,17 tỷ đ</span>
                <span className="text-xs font-semibold text-[#593522] bg-[#593522]/10 px-2 py-0.5 rounded">
                  Q2 so với Q1: {H1_QUARTERS_COMPARISON.costGrowth}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#593522]/70">
                <span>Q1: {H1_QUARTERS_COMPARISON.q1Cost}</span>
                <span>Q2: {H1_QUARTERS_COMPARISON.q2Cost}</span>
              </div>
            </div>

            {/* 3. Lợi nhuận */}
            <div className="p-3 rounded-xl bg-white/80 border border-[#593522]/15">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#593522]">Lợi Nhuận H1: 29,07 tỷ đ</span>
                <span className="text-xs font-extrabold text-[#DDAA24] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Q2 so với Q1: {H1_QUARTERS_COMPARISON.profitGrowth}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#593522]/70">
                <span>Q1: {H1_QUARTERS_COMPARISON.q1Profit}</span>
                <span>Q2: {H1_QUARTERS_COMPARISON.q2Profit}</span>
              </div>
            </div>

            {/* 4. Biên lợi nhuận */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-[#DDAA24]/40">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#593522]">Biên Lợi Nhuận H1: 29,3%</span>
                <span className="text-xs font-bold text-emerald-800">
                  {H1_QUARTERS_COMPARISON.marginGrowth}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#593522]/75">
                <span>Q1: {H1_QUARTERS_COMPARISON.q1Margin}</span>
                <span className="font-bold text-[#DDAA24]">Q2: {H1_QUARTERS_COMPARISON.q2Margin}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#593522]/5 border border-[#593522]/15 text-[11px] text-[#593522] leading-relaxed">
            <strong className="text-[#DDAA24]">Kết luận quản trị: </strong>
            Quý 2 tăng trưởng nhanh hơn Quý 1 ở mọi chỉ số cốt lõi. Tỷ trọng chi phí nguyên liệu được kiểm soát tốt giúp biên lợi nhuận mở rộng thêm 3,9 điểm %.
          </div>
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>Cam Consumer Financial Report H1/2026</span>
          <span className="font-serif italic">Trang 4</span>
        </div>
      </div>
    </div>
  );
}

// TRANG 5 & 6: THƯ VIỆN BIỂU ĐỒ & DASHBOARD
function PageSpread3({
  onOpenLightbox,
  onOpenExcel,
}: {
  onOpenLightbox: (img: string, title: string) => void;
  onOpenExcel: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Tiêu đề & Section A: Tóm Tắt Nhanh */}
      <div className="border-b border-[#593522]/20 pb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Chương III · Thư Viện Biểu Đồ & Dashboard Trực Quan</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#593522]">
          Kho Dữ Liệu Thực Chứng & Hệ Thống BI
        </h2>
      </div>

      {/* Grid 3 Hộp Tổng Quan Nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Box 1: File Excel */}
        <div className="p-4 rounded-xl bg-white/80 border border-[#593522]/20 flex flex-col justify-between">
          <div>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg w-fit mb-2.5 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#593522] mb-1">Dữ Liệu Excel Gốc</h4>
            <p className="text-xs text-[#593522]/75">
              300 bản ghi khách hàng Cocoon đã qua quy trình ETL và phân loại RFM.
            </p>
          </div>
          <button
            onClick={onOpenExcel}
            className="mt-3 w-full py-2 px-3 bg-[#593522] hover:bg-[#DDAA24] text-[#F7F1E7] hover:text-[#593522] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mở Bảng Dữ Liệu</span>
          </button>
        </div>

        {/* Box 2: Chỉ số Insight then chốt */}
        <div className="p-4 rounded-xl bg-white/80 border border-[#593522]/20 flex flex-col justify-between">
          <div>
            <div className="p-2 bg-amber-50 text-[#DDAA24] rounded-lg w-fit mb-2.5 border border-amber-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#593522] mb-1">Tóm Tắt Chỉ Số Churn</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-0.5 border-b border-[#593522]/10">
                <span className="text-[#593522]/75">CLV TB / Trung vị:</span>
                <span className="font-bold text-[#593522]">1.74tr / 1.41tr</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#593522]/10">
                <span className="text-[#593522]/75">Referral Churn:</span>
                <span className="font-bold text-[#D98CA5] bg-[#D98CA5]/15 px-1 py-0.5 rounded">64% (n=22)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#593522]/75">Hạng Gold Rời bỏ:</span>
                <span className="font-bold text-[#D98CA5] bg-[#D98CA5]/15 px-1 py-0.5 rounded">50% (-55.5tr)</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[#593522]/60 mt-2 block italic">
            *Màu hồng sen cảnh báo tỷ lệ rời bỏ nghiêm trọng
          </span>
        </div>

        {/* Box 3: Link Netlify Dashboard */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#593522] to-[#3A2216] text-[#F7F1E7] flex flex-col justify-between shadow-md">
          <div>
            <div className="p-2 bg-[#DDAA24]/20 text-[#DDAA24] rounded-lg w-fit mb-2.5 border border-[#DDAA24]/40">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#F7F1E7] mb-1">Interactive Dashboard</h4>
            <p className="text-xs text-[#F7F1E7]/80">
              Hệ thống BI Dashboard trực quan tương tác toàn diện trên nền tảng Netlify.
            </p>
          </div>
          <a
            href="https://lustrous-licorice-891659.netlify.app/#cold-calling"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-2 px-3 bg-[#DDAA24] hover:bg-[#f5bc32] text-[#593522] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
          >
            <span>Mở Dashboard Trực Tuyến</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Section B: Thư viện 6 Biểu Đồ sắc nét (Có thể ấn để phóng to Lightbox) */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#593522] mb-3 flex items-center gap-2">
          <span>Thư Viện 6 Biểu Đồ Phân Tích Thực Tế (Nhấp để phóng to)</span>
          <span className="h-px flex-1 bg-[#593522]/15"></span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHART_GALLERY.map((chart) => (
            <div
              key={chart.id}
              onClick={() => onOpenLightbox(chart.image, chart.title)}
              className="group bg-white rounded-xl border border-[#593522]/15 overflow-hidden hover:border-[#DDAA24] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-[#F7F1E7]/40 overflow-hidden border-b border-[#593522]/10">
                  <img
                    src={chart.image}
                    alt={chart.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[#593522] text-[#F7F1E7] rounded-full shadow-lg">
                      <Maximize2 className="w-4 h-4 text-[#DDAA24]" />
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <span className="text-[10px] font-bold text-[#DDAA24] uppercase tracking-wider block mb-0.5">
                    {chart.type}
                  </span>
                  <h4 className="font-bold text-xs text-[#593522] leading-snug mb-1 group-hover:text-[#DDAA24] transition-colors">
                    {chart.title}
                  </h4>
                  <p className="text-[11px] text-[#593522]/80 leading-relaxed mb-2">
                    {chart.keyTakeaway}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#F7F1E7]/70 border-t border-[#593522]/10 text-[10px] text-[#593522]">
                <strong className="text-[#DDAA24]">Hành động: </strong>
                {chart.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// TRANG 7 & 8: LUYỆN COLD CALLING & TRỢ LÝ AI NOTEBOOKLM
function PageSpread4() {
  // 1. State phần Luyện Cold Calling
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>(null);

  // 2. State phần Trợ lý AI NotebookLM
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI (Tích hợp NotebookLM) của dự án Cocoon Vietnam & Cam Consumer. Tôi có thể giải đáp toàn bộ câu hỏi về doanh thu các quý, Churn 180 ngày và giữ chân khách Gold VIP. Hãy đặt câu hỏi cho tôi!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const curQ = COLD_CALLING_QUESTIONS[currentQuestionIdx];

  const handleGradeAnswer = () => {
    if (!userAnswer.trim()) {
      setScoreResult({ score: 0, feedback: 'Vui lòng nhập câu trả lời trước khi bấm chấm điểm.' });
      return;
    }
    const lowerAns = userAnswer.toLowerCase();
    let matches = 0;
    curQ.keyPoints.forEach((kp) => {
      const words = kp.toLowerCase().split(' ').slice(0, 3);
      if (words.some((w) => lowerAns.includes(w))) {
        matches++;
      }
    });

    const score = Math.min(10, Math.round((matches / curQ.keyPoints.length) * 10) + 2);
    setScoreResult({
      score,
      feedback:
        score >= 8
          ? 'Tuyệt vời! Câu trả lời của bạn bám rất sát số liệu thực tế của đồ án.'
          : 'Khá tốt! Bạn nên bổ sung thêm các số liệu định lượng cụ thể để tăng sức thuyết phục trước thầy.',
    });
    setShowModelAnswer(true);
  };

  const handleSendChat = (promptText?: string) => {
    const q = promptText || chatInput;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!promptText) setChatInput('');
    setIsTyping(true);

    // Tìm câu trả lời trong dữ liệu
    const matched = COLD_CALLING_QUESTIONS.find(
      (item) =>
        q.toLowerCase().includes(item.question.toLowerCase().slice(0, 15)) ||
        item.question.toLowerCase().includes(q.toLowerCase().slice(0, 15))
    );

    const reply = matched
      ? matched.modelAnswer
      : `Theo dữ liệu báo cáo đối với "${q}": Nghiên cứu khẳng định sự phân hóa sâu sắc giữa các kênh tiếp thị và nhóm khách hàng. Đặc biệt tại Q4/25, khách mới đạt đỉnh 39 khách. Nhóm khách hàng Gold VIP (CLV 4,63 triệu đ) cần quy trình chăm sóc tự động tại mốc 120-150 ngày để tránh thất thoát 55,56 triệu đ. Bạn có thể nhấn vào các câu hỏi gợi ý để xem số liệu chi tiết.`;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Cột Trái: Luyện Cold Calling — Bảo Vệ Báo Cáo (Giống Netlify) */}
      <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#593522]/20 pb-6 md:pb-0 md:pr-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-1.5">
            <Flame className="w-4 h-4" />
            <span>Phòng Luyện Vấn Đáp Bảo Vệ Đồ Án</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#593522] mb-1">
            Luyện Cold Calling — Vấn Đáp Đột Xuất
          </h2>
          <p className="text-xs text-[#593522]/75 mb-3">
            Giả lập thầy phản biện đặt câu hỏi bất ngờ. Hãy tự gõ câu trả lời, bấm chấm điểm rồi xem đáp án chuẩn:
          </p>

          {/* Hộp câu hỏi hiện tại */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#593522]/20 mb-3 shadow-sm">
            <div className="flex justify-between items-center text-[10px] text-[#593522]/70 mb-1">
              <span className="font-bold text-[#DDAA24]">
                Câu {currentQuestionIdx + 1} / {COLD_CALLING_QUESTIONS.length}
              </span>
              <span>Trọng tâm bảo vệ</span>
            </div>
            <h4 className="font-bold text-xs text-[#593522] leading-snug">{curQ.question}</h4>
          </div>

          {/* Ô nhập câu trả lời của người dùng */}
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Nhập câu trả lời của bạn tại đây (nhớ nêu dẫn chứng số liệu cụ thể)..."
            rows={3}
            className="w-full p-2.5 text-xs rounded-xl bg-white border border-[#593522]/20 text-[#593522] placeholder-[#593522]/45 focus:outline-none focus:ring-2 focus:ring-[#DDAA24] mb-2.5 resize-none shadow-inner"
          />

          {/* Nút hành động chấm điểm & xem đáp án */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleGradeAnswer}
              className="flex-1 py-1.5 px-3 bg-[#593522] hover:bg-[#DDAA24] text-[#F7F1E7] hover:text-[#593522] font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Chấm Câu Trả Lời
            </button>
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="py-1.5 px-3 border border-[#593522]/30 hover:bg-[#593522]/10 text-[#593522] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {showModelAnswer ? 'Ẩn Đáp Án' : 'Xem Đáp Án Mẫu'}
            </button>
            <button
              onClick={() => {
                setCurrentQuestionIdx((prev) => (prev + 1) % COLD_CALLING_QUESTIONS.length);
                setUserAnswer('');
                setShowModelAnswer(false);
                setScoreResult(null);
              }}
              className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Câu Kế</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kết quả chấm điểm & Đáp án mẫu */}
          {scoreResult && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs mb-2">
              <span className="font-bold text-emerald-800">Điểm đánh giá: {scoreResult.score}/10 — </span>
              <span className="text-emerald-700">{scoreResult.feedback}</span>
            </div>
          )}

          {showModelAnswer && (
            <div className="p-3 rounded-xl bg-[#F7F1E7] border border-[#593522]/20 text-xs text-[#593522] space-y-1.5 max-h-36 overflow-y-auto">
              <span className="font-bold text-[#DDAA24] block">Đáp Án Mẫu Của Trưởng Nhóm:</span>
              <p className="leading-relaxed">{curQ.modelAnswer}</p>
              <div className="pt-1 border-t border-[#593522]/10">
                <span className="text-[10px] font-bold text-[#593522]/80">Các ý cốt lõi bắt buộc: </span>
                <ul className="list-disc list-inside text-[10px] text-[#593522]/75">
                  {curQ.keyPoints.map((kp, i) => (
                    <li key={i}>{kp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>Mô phỏng phản biện đồ án</span>
          <span className="font-serif italic">Trang 7</span>
        </div>
      </div>

      {/* Cột Phải: Trợ Lý AI NotebookLM (Hỏi Đáp Thông Minh) */}
      <div className="flex flex-col justify-between">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DDAA24] mb-1.5">
            <SparklesIcon className="w-4 h-4" />
            <span>Trợ Lý Tra Cứu Thông Minh</span>
          </div>
          <h3 className="text-xl font-bold text-[#593522] mb-1">Trợ Lý AI NotebookLM</h3>
          <p className="text-xs text-[#593522]/75 mb-2.5">
            Được huấn luyện trực tiếp trên toàn bộ Báo cáo phân tích khách hàng Cocoon Vietnam:
          </p>

          {/* Câu hỏi gợi ý nhanh */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {COLD_CALLING_QUESTIONS.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(item.question)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 hover:bg-[#DDAA24] hover:text-[#593522] text-[#593522] border border-[#593522]/20 transition-all font-medium text-left truncate max-w-[240px] cursor-pointer"
                title={item.question}
              >
                💡 {item.question}
              </button>
            ))}
          </div>

          {/* Cửa sổ chat có thanh cuộn */}
          <div
            ref={chatScrollRef}
            className="flex-1 min-h-[190px] max-h-[220px] overflow-y-auto p-3 rounded-xl bg-white/75 border border-[#593522]/20 space-y-2.5 text-xs mb-2.5"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] p-2.5 rounded-xl leading-relaxed text-xs shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[#593522] text-[#F7F1E7] rounded-tr-none font-medium'
                      : 'bg-[#F7F1E7] text-[#593522] border border-[#593522]/20 rounded-tl-none'
                  }`}
                >
                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-[#DDAA24] mb-0.5">
                      <SparklesIcon className="w-2.5 h-2.5" />
                      NotebookLM AI
                    </div>
                  )}
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[11px] text-[#593522]/70 italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DDAA24] animate-ping" />
                <span>NotebookLM đang tra cứu báo cáo...</span>
              </div>
            )}
          </div>

          {/* Ô nhập chat */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Đặt câu hỏi về CLV, các quý, Churn..."
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#593522]/25 text-[#593522] placeholder-[#593522]/50 text-xs focus:outline-none focus:ring-2 focus:ring-[#DDAA24]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#593522] hover:bg-[#DDAA24] text-[#F7F1E7] hover:text-[#593522] font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="pt-4 border-t border-[#593522]/15 flex items-center justify-between text-[11px] text-[#593522]/60">
          <span>AI Synthesis Engine</span>
          <span className="font-serif italic">Trang 8</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CONTAINER LẬT SÁCH 3D CHÂN THỰC (THE OPEN BOOK CONTAINER)
========================================================================= */
interface RealisticBookReaderProps {
  isOpen: boolean;
  onClose: () => void;
}

function RealisticBookReader({ isOpen, onClose }: RealisticBookReaderProps) {
  const [currentSpread, setCurrentSpread] = useState<number>(1);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);
  const [showExcel, setShowExcel] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  const totalSpreads = 4;

  const spreadNames = [
    'Chương I: Tổng Quan & Đội Ngũ',
    'Chương II: Dữ Liệu Các Quý (Q4/23 – Q3/26)',
    'Chương III: Biểu Đồ & Dashboard',
    'Chương IV: Cold Calling & AI Chat',
  ];

  const goToNextSpread = () => {
    if (currentSpread < totalSpreads) {
      if (isSoundEnabled) playPageTurnSound();
      setFlipDirection('next');
      setCurrentSpread((s) => s + 1);
    }
  };

  const goToPrevSpread = () => {
    if (currentSpread > 1) {
      if (isSoundEnabled) playPageTurnSound();
      setFlipDirection('prev');
      setCurrentSpread((s) => s - 1);
    }
  };

  // Hỗ trợ phím mũi tên lật sách
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') goToNextSpread();
      if (e.key === 'ArrowLeft') goToPrevSpread();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSpread, isSoundEnabled]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#0c0907]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
        {/* Khung Bao Cuốn Sách Thực Tế Với Bìa Da & Nếp Gáy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 35, rotateX: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 35, rotateX: 12 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative w-full max-w-6xl h-[94vh] bg-[#F7F1E7] text-[#593522] rounded-2xl border-4 border-[#3D2316] flex flex-col overflow-hidden shadow-2xl"
          style={{
            boxShadow:
              '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(221, 170, 36, 0.2), inset 0 0 25px rgba(89, 53, 34, 0.1)',
          }}
        >
          {/* Nếp gáy sách chính giữa (Spine Crease & Shadow) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 pointer-events-none bg-gradient-to-r from-transparent via-[#593522]/15 to-transparent z-30" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 pointer-events-none bg-[#593522]/25 z-30" />

          {/* Dải ruy băng đánh dấu trang màu vàng nghệ (Golden Bookmark Ribbon) */}
          <div className="absolute top-0 left-[52%] w-4 h-16 bg-[#DDAA24] rounded-b-md shadow-md z-40 pointer-events-none transform -translate-x-1/2" />

          {/* THANH ĐẦU CUỐN SÁCH (HEADER) */}
          <div className="px-5 py-3 border-b border-[#593522]/20 bg-[#F7F1E7]/95 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DDAA24] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#593522]">
                {spreadNames[currentSpread - 1]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút bật/tắt âm thanh lật sách */}
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1.5 rounded-lg text-[#593522] hover:bg-[#593522]/10 transition-colors cursor-pointer"
                title={isSoundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#DDAA24]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>

              {/* Nút Đóng sách & Đặt lại lên kệ */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-[#593522] hover:bg-[#D98CA5] text-[#F7F1E7] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Đóng sách và quay lại kệ phòng 3D"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Đóng Sách</span>
              </button>
            </div>
          </div>

          {/* NỘI DUNG 2 TRANG MỞ RA VỚI HIỆU ỨNG LẬT TRANG CHÂN THẬT */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 md:px-12 py-5 z-10 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSpread}
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
                transition={{ duration: 0.38, ease: 'easeInOut' }}
                className="h-full"
                style={{ transformOrigin: flipDirection === 'next' ? 'left center' : 'right center' }}
              >
                {currentSpread === 1 && <PageSpread1 />}
                {currentSpread === 2 && <PageSpread2 />}
                {currentSpread === 3 && (
                  <PageSpread3
                    onOpenLightbox={(img, title) => {
                      setLightboxImage(img);
                      setLightboxTitle(title);
                    }}
                    onOpenExcel={() => setShowExcel(true)}
                  />
                )}
                {currentSpread === 4 && <PageSpread4 />}
              </motion.div>
            </AnimatePresence>

            {/* Nếp gấp góc trang để click lật trang tự nhiên (Dog-ear corner) */}
            {currentSpread < totalSpreads && (
              <button
                onClick={goToNextSpread}
                className="absolute bottom-2 right-2 w-10 h-10 group flex items-end justify-end cursor-pointer z-30"
                title="Lật sang trang tiếp theo"
              >
                <div className="w-6 h-6 bg-gradient-to-tl from-[#DDAA24]/40 to-transparent border-t border-l border-[#593522]/30 group-hover:w-8 group-hover:h-8 transition-all rounded-tl-sm shadow-sm" />
              </button>
            )}
            {currentSpread > 1 && (
              <button
                onClick={goToPrevSpread}
                className="absolute bottom-2 left-2 w-10 h-10 group flex items-end justify-start cursor-pointer z-30"
                title="Lật về trang trước"
              >
                <div className="w-6 h-6 bg-gradient-to-tr from-[#DDAA24]/40 to-transparent border-t border-r border-[#593522]/30 group-hover:w-8 group-hover:h-8 transition-all rounded-tr-sm shadow-sm" />
              </button>
            )}
          </div>

          {/* THANH ĐIỀU HƯỚNG CUỐI SÁCH (FOOTER) */}
          <div className="px-6 py-3 border-t border-[#593522]/20 bg-[#F7F1E7]/95 flex items-center justify-between z-20">
            {/* Nút Lật Về Trước */}
            <button
              onClick={goToPrevSpread}
              disabled={currentSpread === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#593522] border border-[#593522]/30 hover:bg-[#593522]/10 disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trang trước</span>
            </button>

            {/* Chỉ Báo Chương / Trang */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (isSoundEnabled) playPageTurnSound();
                    setFlipDirection(s > currentSpread ? 'next' : 'prev');
                    setCurrentSpread(s);
                  }}
                  className="group p-1 cursor-pointer focus:outline-none"
                  title={spreadNames[s - 1]}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      currentSpread === s
                        ? 'w-7 h-2.5 bg-[#DDAA24]'
                        : 'w-2.5 h-2.5 bg-[#593522]/30 hover:bg-[#593522]/60'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-[#593522]/70 ml-2 hidden sm:inline">
                Chương {currentSpread} / {totalSpreads}
              </span>
            </div>

            {/* Nút Lật Sang Sau */}
            <button
              onClick={goToNextSpread}
              disabled={currentSpread === totalSpreads}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#593522] text-[#F7F1E7] hover:bg-[#DDAA24] hover:text-[#593522] disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Trang sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Lightbox xem phóng to biểu đồ */}
      <ImageLightbox
        image={lightboxImage}
        title={lightboxTitle}
        onClose={() => setLightboxImage(null)}
      />

      {/* Modal dữ liệu Excel */}
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
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1A140F]/85 backdrop-blur-md border border-[#DDAA24]/60 shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DDAA24] animate-ping" />
              <span className="text-xs md:text-sm font-semibold tracking-wide text-[#F7F1E7]">
                Nhấp vào <span className="text-[#DDAA24] font-bold">Cuốn Sách Báo Cáo</span> trên kệ để lấy xuống đọc
              </span>
            </div>
            <span className="text-[11px] text-[#F7F1E7]/60 tracking-wider font-mono">
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
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-[#1A140F]/85 hover:bg-[#DDAA24] text-[#F7F1E7] hover:text-[#593522] border border-[#DDAA24]/50 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#DDAA24]" />
          <span>Rút Sách Ra Đọc</span>
        </button>
      )}

      {/* 4. GIAO DIỆN MỞ SÁCH THỰC TẾ & LẬT TRANG CHÂN THẬT */}
      <RealisticBookReader isOpen={isReading} onClose={() => setIsReading(false)} />
    </div>
  );
}
