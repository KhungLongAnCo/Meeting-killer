# Workflow: Refactor page.tsx + Create /room/[id] route

## Current Tasks

1. Review code `app/page.tsx` — phân tích vấn đề hiện tại
2. Tách components tái sử dụng được từ page.tsx
3. Tạo route mới `/room/[id]` để quản lý room riêng biệt
4. Trang `/` trở thành dashboard hiển thị danh sách room + tạo room mới

## Rule Files Used

- `ui_rule.md` — UI components, pages, App Router
- `style_rule.md` — Tailwind styling
- `font_size_rule.md` — Typography
- `logic_global_rule.md` — Error handling, type safety, async patterns

## Steps

### Step 1: Code Review — Phân tích vấn đề hiện tại ✅
- File 1440 dòng, monolithic
- 4 recording engines + auth + rooms + settings all in one component
- No custom hooks, no reusable components

### Step 2: Tạo custom hooks ✅
- `hooks/useAuth.ts` — login, logout, check auth
- `hooks/useRooms.ts` — CRUD rooms + select room
- `hooks/useSettings.ts` — API keys management
- `hooks/useRecording.ts` — all 4 recording engines (OpenAI Realtime, Deepgram, Web Speech, Whisper+VAD)

### Step 3: Tạo shared components ✅
- `components/ui/Logo.tsx` — reusable logo
- `components/login/LoginScreen.tsx` — login form
- `components/layout/Sidebar.tsx` — room list + navigation
- `components/layout/AppShell.tsx` — auth gate + sidebar + settings modal wrapper
- `components/settings/SettingsModal.tsx` — settings modal with tabs

### Step 4: Tạo room-specific components ✅
- `components/room/ConfigBar.tsx` — STT engine, languages, model, audio source, voice
- `components/room/TranscriptPanel.tsx` — transcript display with auto-scroll
- `components/room/ControlBar.tsx` — start/stop, copy, clear, status badge

### Step 5: Tạo route `/room/[id]/page.tsx` ✅
- Sử dụng AppShell + ConfigBar + TranscriptPanel + ControlBar
- Load room entries từ API
- Recording logic qua useRecording hook

### Step 6: Refactor `app/page.tsx` thành Dashboard ✅
- Trang chủ: logo + danh sách room + tạo room mới
- Click room → navigate `/room/[id]`

## Things Done

- Tất cả các bước trên
- Build thành công (TypeScript + Next.js)
- Không có lỗi type

## Things Not Done Yet

- (Không còn gì)
