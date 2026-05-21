# NEW REQUIREMENT RULE

> **Purpose**: This file defines mandatory rules before implementing any new requirement.
> It is designed to be used by **both humans and AI agents**.

---

## 🔴 IMPORTANT (STRICT)

1. **Always read `CLAUDE.md` first**
   - Understand:
     - Project architecture
     - Folder structure
     - Existing conventions
     - Global rules

   - ❌ Never start implementation without reading it

2. **Do NOT write code immediately**
   Before any code changes, you MUST:
   - Make an implementation **plan**
   - Draw or describe a **flow / diagram**
   - Update this file (`CLAUDE_NEW_REQ.md`) with that plan

3. **This file is the single source of truth for new requirements**
   - All assumptions
   - All constraints
   - All decisions
     must be written here first

---

# User requirement:

## Analysis of existing chat structure:

### Current Chat Architecture:

- **Chat List Page**: `/chat` - Shows `ChatEmptyState` component for creating new chats
- **Chat Detail Page**: `/chat/[id]` - Individual chat conversation interface
- **Chat Layout**: Wraps chat pages with `ChatLayoutClient` (provides sidebar with chat history)
- **Database Models**:
  - `Chat`: stores chat sessions with `userId`, `title`, `englishLevel`, `passageId`
  - `Message`: stores individual messages with `chatId`, `content`, `role`, `caseType`
  - `Passage`: stores practice passages (already exists for current chat system)

### Required Implementation:

#### 1. Create IELTS Writing Task System

- **New Model Needed**: `IeltsTask` (writing questions/prompts provided by admin)
- **Task List Page**: `/ielts-writing` - Display available IELTS writing tasks
- **Task Practice Page**: `/ielts-writing/[taskId]` - Individual task conversation interface

#### 2. Database Schema Updates:

```sql
model IeltsTask {
  id          String   @id @default(cuid())
  title       String   // Task title/topic
  prompt      String   // Writing question/prompt
  taskType    String   // "task1" or "task2"
  level       String?  // Difficulty level
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  conversations IeltsConversation[]
}

model IeltsConversation {
  id        String    @id @default(cuid())
  userId    String
  taskId    String
  title     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  task      IeltsTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  messages  IeltsMessage[]

  @@unique([userId, taskId]) // One conversation per user per task
}

model IeltsMessage {
  id             String   @id @default(cuid())
  content        String
  role           String   // "user" or "assistant"
  conversationId String
  aiResponse     Json?    // Store IELTS-specific structured feedback
  bandScore      Float?   // Individual message band score
  createdAt      DateTime @default(now())

  conversation   IeltsConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

#### 3. Implementation Plan:

**Phase 1: Database & Models**

- Add new Prisma models for `IeltsTask`, `IeltsConversation`, `IeltsMessage`
- Run database migration
- Seed initial IELTS tasks via admin interface or script

**Phase 2: Task List Page**

- Create `/ielts-writing/page.tsx`
- Fetch and display all active `IeltsTask` entries
- UI similar to chat list but showing task cards instead of chat history
- Each task card shows: title, prompt preview, task type
- Click redirects to `/ielts-writing/[taskId]`

**Phase 3: Task Practice Page**

- Create `/ielts-writing/[taskId]/page.tsx`
- Similar structure to `/chat/[id]/page.tsx`
- Fetch or create `IeltsConversation` for current user + task
- Load existing messages for the conversation
- Use similar chat interface components
- **IELTS-Specific AI Integration**:
  - When user submits writing response → trigger OpenAI review
  - AI analyzes writing against IELTS criteria
  - Provides structured feedback on:
    - Task Achievement/Response
    - Coherence and Cohesion
    - Lexical Resource (vocabulary)
    - Grammatical Range and Accuracy
    - Estimated band score
  - Store structured feedback in `aiResponse` field (similar to current chat system)

**Phase 4: Layout & Components**

- Create `/ielts-writing/layout.tsx`
- Reuse chat components but adapt for IELTS context
- Update breadcrumbs, navigation to reflect IELTS context
- Add task information display in conversation header

#### 4. IELTS AI Review System:

**AI Response Structure (stored in `aiResponse` JSON field):**

```json
{
  "taskAchievement": {
    "score": 7.0,
    "feedback": "Good response to the question...",
    "suggestions": ["Develop examples more fully", "Address counter-arguments"]
  },
  "coherenceCohesion": {
    "score": 6.5,
    "feedback": "Ideas are generally well-organized...",
    "suggestions": [
      "Use more varied linking words",
      "Improve paragraph structure"
    ]
  },
  "lexicalResource": {
    "score": 6.0,
    "feedback": "Adequate vocabulary range...",
    "suggestions": ["Use more sophisticated vocabulary", "Avoid repetition"],
    "vocabularyHighlights": [
      {
        "word": "technology",
        "suggestion": "technological advancement",
        "context": "Line 2"
      }
    ]
  },
  "grammaticalAccuracy": {
    "score": 6.5,
    "feedback": "Generally good control of grammar...",
    "suggestions": [
      "Check complex sentence structures",
      "Review article usage"
    ],
    "errors": [
      {
        "error": "the internet are",
        "correction": "the internet is",
        "line": 3
      }
    ]
  },
  "overallBandScore": 6.5,
  "overallFeedback": "This is a solid response that addresses the question...",
  "improvementPriorities": [
    "Vocabulary sophistication",
    "Complex grammar structures"
  ]
}
```

**AI Prompt Engineering for IELTS:**

- Specific prompts for Task 1 (describe/analyze) vs Task 2 (essay)
- Include IELTS band descriptors in system prompt
- Context-aware scoring based on task type and requirements
- Constructive feedback focused on IELTS improvement

#### 5. Key Differences from Chat System:

- Tasks are admin-managed, not user-created
- One conversation per user per task (unique constraint)
- Task prompt always visible in conversation
- **IELTS-specific AI prompting and scoring system**
- **Structured feedback display with band scores**
- **Progress tracking across multiple attempts per task**
- Task metadata (type, level) affects conversation behavior

#### 6. Implementation Details:

**API Endpoints Needed:**

- `POST /api/ielts/tasks` - Fetch all active IELTS tasks
- `POST /api/ielts/conversation` - Create/get conversation for user+task
- `POST /api/ielts/review` - Submit writing for AI review
- `GET /api/ielts/conversation/[id]/messages` - Load conversation messages

**Component Architecture:**

- `IeltsTaskList` - Display available tasks (similar to ChatEmptyState)
- `IeltsTaskCard` - Individual task display component
- `IeltsConversationHeader` - Show task prompt and progress
- `IeltsFeedbackDisplay` - Structured display of AI review with band scores
- `IeltsMessageBubble` - Message component with IELTS-specific styling

**Message Flow:**

1. User selects task → Create/retrieve conversation
2. User submits writing → Save as user message
3. Trigger AI review → Generate structured feedback
4. Save AI response with structured JSON → Display formatted feedback
5. Allow user to continue conversation for clarification/improvement

#### 7. File Structure:

```
src/app/[locale]/(protected)/ielts-writing/
├── page.tsx           // Task list
├── layout.tsx         // IELTS layout wrapper
└── [taskId]/
    └── page.tsx       // Task conversation
```

#### 8. Component Reuse Strategy:

- **Reuse**: Basic chat UI components, message rendering, input components
- **Adapt**: Layout components for IELTS context, message display for structured feedback
- **New**: Task list components, task header components, IELTS feedback display components

#### 9. AI Integration Specifications:

- **Model**: GPT-4 or Claude for comprehensive IELTS evaluation
- **System Prompt**: Include official IELTS band descriptors (4 criteria)
- **Response Format**: Structured JSON with scores and detailed feedback
- **Context Window**: Include task prompt + user writing + IELTS evaluation guidelines
- **Fallback**: Graceful degradation if AI service unavailable

---

# Plan update below
