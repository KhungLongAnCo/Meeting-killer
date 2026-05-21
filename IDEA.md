![alt text](image.png)
# 🎙️ VoiceBridge — Real-time Meeting Voice Translator

> Web app giúp người dùng nói tiếng Việt (hoặc ngôn ngữ bất kỳ) và phát lại bằng tiếng Anh (hoặc ngôn ngữ đích) trong cuộc họp quốc tế — theo thời gian thực.

---

## 1. Mục tiêu sản phẩm

| Mục tiêu | Mô tả |
|---|---|
| **Core use case** | Người Việt tham gia meeting quốc tế, nói tiếng Việt → web dịch → phát âm thanh tiếng Anh cho đối phương nghe |
| **Real-time** | Độ trễ < 2 giây từ lúc nói đến lúc phát âm thanh dịch |
| **Transcript** | Hiển thị live transcript song ngữ trên màn hình |
| **Đơn giản** | Không cần cài app, chạy hoàn toàn trên trình duyệt |

---

## 2. Giao diện (UI Layout)

```
┌──────────────────────────────────────────────────────────┐
│  🎙️ VoiceBridge                          [🌐 Settings]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Ngôn ngữ nói:  [ 🇻🇳 Tiếng Việt ▼ ]                    │
│  Dịch sang:     [ 🇬🇧 English     ▼ ]                    │
│  Model AI:      [ Gemini 2.5 Flash-Lite ▼ ]             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  TRANSCRIPT TRỰC TIẾP                                    │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🇻🇳 "Xin chào, hôm nay chúng ta sẽ thảo luận..."  │   │
│ │ 🇬🇧 "Hello, today we will discuss..."              │   │
│ │                                                    │   │
│ │ 🇻🇳 "Tôi muốn đề xuất giải pháp mới..."           │   │
│ │ 🇬🇧 "I would like to propose a new solution..."   │   │
│ │                                          [▌live]  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│         [ 🔴 BẮT ĐẦU NÓI ]    [ 📋 Copy ]  [ 🗑️ Xóa ] │
│                                                          │
│  Status: 🟢 Đang lắng nghe... | Model: Flash-Lite       │
└──────────────────────────────────────────────────────────┘
```

### Chi tiết các thành phần UI:

- **Header**: Logo + tên app + nút Settings
- **Config Bar**: Chọn ngôn ngữ nguồn / đích / model AI
- **Transcript Panel**: 
  - Cuộn tự động xuống dưới
  - Mỗi đoạn gồm 2 dòng: ngôn ngữ gốc + bản dịch
  - Highlight dòng đang được xử lý (live cursor)
  - Font lớn, dễ đọc từ xa
- **Control Bar**: Nút Start/Stop + Copy transcript + Xóa
- **Status Bar**: Trạng thái mic, model đang dùng, độ trễ ms

---

## 3. Luồng xử lý (Pipeline)

```
[Mic Input]
    │
    ▼
[Web Speech API / MediaRecorder]  ← Thu âm từ trình duyệt
    │
    ▼
[STT — Speech-to-Text]
    ├── Option A: Web Speech API (miễn phí, built-in Chrome)
    ├── Option B: OpenAI Whisper API (chính xác hơn)
    └── Option C: Gemini Live API (all-in-one)
    │
    ▼
[Văn bản gốc] ← Hiển thị ngay lên transcript
    │
    ▼
[Translation AI]
    ├── Gemini 2.5 Flash-Lite  ← Rẻ nhất, nhanh nhất
    ├── Gemini 2.5 Flash       ← Cân bằng
    └── GPT-4o Mini            ← Backup
    │
    ▼
[Văn bản đã dịch] ← Hiển thị lên transcript (dòng 2)
    │
    ▼
[TTS — Text-to-Speech]
    ├── Option A: Web Speech API SpeechSynthesis (miễn phí)
    ├── Option B: Google Cloud TTS (giọng tự nhiên hơn)
    └── Option C: ElevenLabs (giọng premium)
    │
    ▼
[🔊 Phát âm thanh tiếng Anh]
```

---

## 4. Lựa chọn Model & Chi phí

| Model | STT | Dịch | TTS | Ưu điểm | Chi phí ước tính |
|---|---|---|---|---|---|
| **Bộ miễn phí** | Web Speech API | Gemini Flash-Lite | SpeechSynthesis | Miễn phí hoàn toàn | $0 |
| **Bộ cân bằng** | Whisper API | Gemini Flash-Lite | SpeechSynthesis | Chính xác hơn | ~$0.006/phút |
| **Bộ premium** | Whisper API | Gemini 2.5 Flash | Google Cloud TTS | Giọng tự nhiên nhất | ~$0.02/phút |

### Gemini 2.5 Flash-Lite — Lựa chọn mặc định:
- Giá dịch cực rẻ: ~$0.01 / 1M tokens
- Latency < 500ms với văn bản ngắn
- Hỗ trợ tiếng Việt rất tốt
- API Key từ Google AI Studio (có free tier)

---

## 5. Tech Stack

### Frontend
```
├── Next.js 14+ (App Router)
│   ├── React Server Components  ← Layout, transcript history page
│   ├── Client Components        ← Mic input, live transcript, TTS player
│   └── Server Actions           ← Gọi Gemini API an toàn phía server
├── Tailwind CSS                 ← Styling
├── Web Speech API               ← STT (SpeechRecognition) + TTS (SpeechSynthesis)
└── MediaRecorder API            ← Thu âm raw buffer gửi Whisper nếu cần
```

### Backend (Next.js API Routes / Route Handlers)
```
├── /api/translate               ← Nhận text, gọi Gemini, trả bản dịch
├── /api/stt                     ← Nhận audio blob, gọi Whisper API (optional)
├── /api/sessions                ← CRUD session / lịch sử transcript
└── /api/settings                ← Lưu cài đặt user (model, ngôn ngữ...)
```

### Database
```
├── PostgreSQL                   ← Lưu transcript sessions, cài đặt
│   └── Chạy bằng Docker         ← docker-compose.yml local dev
└── Prisma ORM
    ├── Schema + Migration       ← prisma/schema.prisma
    └── Prisma Client            ← Type-safe query trong API routes
```

### Infrastructure / DevOps
```
├── Docker Compose               ← PostgreSQL local dev
├── .env.local                   ← Biến môi trường (API keys, DATABASE_URL)
└── Vercel (deploy)              ← Frontend + API routes
    └── Vercel Postgres / Supabase ← Database production
```

### Cấu trúc thư mục Next.js
```
voicebridge/
├── app/
│   ├── page.tsx                 ← Trang chính (live translator)
│   ├── history/
│   │   └── page.tsx             ← Lịch sử các session
│   ├── api/
│   │   ├── translate/route.ts   ← POST: text → dịch qua Gemini
│   │   ├── stt/route.ts         ← POST: audio → text qua Whisper
│   │   └── sessions/route.ts    ← GET/POST: lịch sử transcript
│   └── layout.tsx
├── components/
│   ├── VoiceCapture.tsx         ← Client: bắt mic, stream STT
│   ├── TranscriptPanel.tsx      ← Client: hiển thị live transcript
│   ├── TTSPlayer.tsx            ← Client: phát âm thanh bản dịch
│   ├── LanguageSelector.tsx     ← Chọn ngôn ngữ nguồn/đích
│   └── ModelSelector.tsx        ← Chọn AI model
├── prisma/
│   ├── schema.prisma            ← Định nghĩa models
│   └── migrations/              ← Migration files
├── lib/
│   ├── prisma.ts                ← Prisma client singleton
│   ├── gemini.ts                ← Gemini API wrapper
│   └── whisper.ts               ← Whisper API wrapper
├── docker-compose.yml           ← PostgreSQL container
├── .env.local                   ← DATABASE_URL, API keys
└── README.md
```

### Prisma Schema
```prisma
// prisma/schema.prisma

model Session {
  id          String      @id @default(cuid())
  title       String?                          // Tên session (tự đặt hoặc auto)
  sourceLang  String      @default("vi")       // Ngôn ngữ nói
  targetLang  String      @default("en")       // Ngôn ngữ dịch
  model       String      @default("gemini-flash-lite")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  entries     Entry[]
}

model Entry {
  id           String   @id @default(cuid())
  sessionId    String
  originalText String                          // Văn bản gốc
  translatedText String                        // Bản dịch
  latencyMs    Int?                            // Độ trễ pipeline (ms)
  createdAt    DateTime @default(now())
  session      Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

### Docker Compose (PostgreSQL)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: voicebridge_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: voicebridge
      POSTGRES_PASSWORD: voicebridge_secret
      POSTGRES_DB: voicebridge
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```env
# .env.local
DATABASE_URL="postgresql://voicebridge:voicebridge_secret@localhost:5432/voicebridge"
GEMINI_API_KEY="your_key_here"
OPENAI_API_KEY="your_key_here"   # optional, cho Whisper
```

### API Keys cần thiết (lưu server-side, an toàn):
- `GEMINI_API_KEY` — Google AI Studio (có free tier)
- `OPENAI_API_KEY` — Nếu dùng Whisper STT (optional)

> ✅ API key lưu trong `.env.local`, chỉ dùng phía server (API routes) — không lộ ra client.

---

## 6. Tính năng theo Phase

### Phase 1 — MVP (1-2 ngày)
- [x] Giao diện cơ bản
- [x] Web Speech API STT (Chrome)
- [x] Gọi Gemini Flash-Lite dịch văn bản
- [x] Web SpeechSynthesis TTS phát tiếng Anh
- [x] Hiển thị transcript song ngữ
- [x] Chọn ngôn ngữ nguồn/đích

### Phase 2 — Cải thiện (3-5 ngày)
- [ ] Tích hợp Whisper API (STT chính xác hơn)
- [ ] Chọn model AI trong UI
- [ ] Copy transcript ra clipboard
- [ ] Lưu lịch sử transcript
- [ ] Tùy chỉnh tốc độ đọc / giọng TTS
- [ ] Dark mode

### Phase 3 — Nâng cao
- [ ] Gemini Live API (streaming real-time)
- [ ] Google Cloud TTS giọng tự nhiên
- [ ] Phát hiện tự động ngôn ngữ nói
- [ ] Xuất transcript ra file .txt / .pdf
- [ ] PWA — cài như app native
- [ ] Virtual audio cable integration (cho Zoom/Meet)

---

## 7. Vấn đề cần giải quyết

### 7.1 Latency
- **Mục tiêu**: < 2 giây end-to-end
- **Cách giảm lag**:
  - Dùng `interimResults: true` trong Web Speech API → dịch ngay khi có partial text
  - Chunk nhỏ: mỗi câu/mệnh đề dịch riêng, không chờ hết đoạn
  - TTS bắt đầu phát ngay khi có kết quả dịch đầu tiên (streaming TTS)

### 7.2 Âm thanh vòng lặp (Echo)
- Khi TTS phát ra loa, mic có thể bắt lại → dịch lại âm thanh tiếng Anh
- **Giải pháp**:
  - Tắt mic khi TTS đang phát (`isSpeaking` flag)
  - Dùng tai nghe (khuyến nghị user)
  - Web Audio API noise gate

### 7.3 Chạy trên Meeting (Zoom, Google Meet, Teams)
- Browser không chia sẻ âm thanh của tab khác dễ dàng
- **Giải pháp đề xuất**:
  - Mở VoiceBridge trên tab riêng, dùng mic vật lý
  - TTS phát qua loa → Meeting bắt mic vật lý → Đối phương nghe
  - Hoặc dùng virtual audio cable (Voicemeeter, BlackHole)

---

## 8. Cấu trúc file dự án

Xem chi tiết ở **Mục 5 — Tech Stack / Cấu trúc thư mục Next.js** phía trên.

### Lệnh khởi động dev:
```bash
# 1. Khởi động PostgreSQL bằng Docker
docker-compose up -d

# 2. Cài dependencies
npm install

# 3. Chạy Prisma migration
npx prisma migrate dev --name init

# 4. Chạy Next.js dev server
npm run dev
```

---

## 9. Mockup màn hình chính

### Màn hình đang hoạt động:
```
┌─────────────────────────────────────────────┐
│  🎙️ VoiceBridge                    ⚙️       │
│─────────────────────────────────────────────│
│  🇻🇳 → 🇬🇧   │  Model: Flash-Lite ▼          │
│─────────────────────────────────────────────│
│                                             │
│  [14:23] 🇻🇳 Hôm nay tôi muốn trình bày    │
│          🇬🇧 Today I want to present        │
│                                             │
│  [14:24] 🇻🇳 về kế hoạch quý tới           │
│          🇬🇧 the plan for next quarter      │
│                                             │
│  [14:25] 🇻🇳 Chúng ta cần tăng ngân sách▌  │
│          🇬🇧 ⏳ đang dịch...               │
│                                             │
│─────────────────────────────────────────────│
│  [🔴 ĐANG NGHE]  [📋 Copy]  [🗑️ Xóa]      │
│  🟢 Mic OK  |  Latency: 847ms              │
└─────────────────────────────────────────────┘
```

---

## 10. Rủi ro & Giới hạn

| Rủi ro | Mức độ | Giải pháp |
|---|---|---|
| Web Speech API chỉ hoạt động tốt trên Chrome | Trung bình | Thông báo user dùng Chrome |
| API key lộ ở client-side | Cao | Thêm backend proxy hoặc dùng Gemini free tier |
| Tiếng ồn xung quanh làm sai STT | Trung bình | Khuyến nghị dùng tai nghe có mic |
| Meeting bắt cả âm TTS lẫn giọng thật | Cao | Tắt mic khi TTS phát, hoặc virtual cable |
| Cost không kiểm soát được | Thấp | Hiển thị token đã dùng, đặt giới hạn session |

---

## 11. Bước tiếp theo

1. **Setup**: Lấy Gemini API key từ [aistudio.google.com](https://aistudio.google.com)
2. **Docker**: Chạy `docker-compose up -d` để có PostgreSQL local
3. **Prisma**: `npx prisma migrate dev` tạo tables
4. **Build MVP**: Pipeline `Web Speech → /api/translate (Gemini) → SpeechSynthesis`
5. **Test**: Thử trong meeting thực tế, đo latency
6. **Deploy**: Vercel (Next.js) + Supabase hoặc Vercel Postgres (production DB)

---

*Spec version 1.0 — VoiceBridge MVP*

