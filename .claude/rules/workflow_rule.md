---
alwaysApply: true
---

# Workflow Rules

## Purpose

Keep every task consistent: greet, classify complexity, apply relevant rule files only, show/verify checklist.

## Start of Conversation

- Say "U Raa..🫡: 🌐" in the first reply.
- Decide task complexity:
  - **COMPLEX**: 3+ files, complex logic/steps, new feature, large refactor, multi-component integration.
  - **SIMPLE**: find/read code, quick fix 1–2 functions, normal new function, simple bug fix, add property/parameter.

## If COMPLEX

- Create workflow file `memory_claude_ai/wf_{workflow_name}` (≤10 words, snake_case) with sections:
  - If file already exist => read it to know history
  - Current tasks from user prompt
  - Rule files to be used (from task-based mapping below)
  - Plan: your thoughts + "✅ Must / 🚫 Never (TL;DR)" from selected rule files
  - Steps: small, ordered
  - Things done
  - Things not done yet
- **⏸️ CONFIRM STEP (REQUIRED):**
  - After creating workflow file, **STOP and ask user to review**.
  - Say: "📋 Đã tạo workflow file. Vui lòng review và cho biết nếu cần điều chỉnh gì trước khi bắt đầu code."
  - **Wait for user confirmation** before proceeding to code generation.
  - If user updates/adds requirements → update workflow file accordingly.

## If SIMPLE

- Skip workflow file; proceed directly.
- List relevant rule files based on task type (see mapping below).
- Show checklist from selected rule files.
- Apply rules and verify checklist before completion.

## Each Conversation Cycle

- **Complex task**:
  - Read current `memory_claude_ai/wf_{workflow_name}` fully.
  - List relevant rule files based on task type (see mapping below).
  - **Show checklist** from "✅ Must / 🚫 Never (TL;DR)" of selected rule files.
  - Apply the listed rule files; update plan/steps if needed.
  - Update Things done / Things not done yet.
  - **Verify checklist** before marking task complete.
- **Simple task**:
  - List relevant rule files based on task type.
  - **Show checklist** from "✅ Must / 🚫 Never (TL;DR)" of selected rule files.
  - Apply the listed rule files.
  - **Verify checklist** before completing the task.

## Task-Based Rule File Mapping

**Only read rule files relevant to the current task to minimize context usage.**

### Core Rules (Always Apply)

- `logic_global_rule.md` - Global logic patterns (error handling, type safety, async patterns)

### Task Type → Rule Files

| Task Type                                   | Rule Files to Read                                 |
| ------------------------------------------- | -------------------------------------------------- |
| **Create/Update UI Components**             | `ui_rule.md`, `style_rule.md`, `font_size_rule.md` |
| **Create/Update Pages (App Router)**        | `ui_rule.md`, `style_rule.md`, `font_size_rule.md` |
| **Create/Update API Routes (Next.js)**      | `api_rule.md`                                      |
| **Create/Update Hooks**                     | `hooks_rule.md`                                    |
| **Database/Prisma Operations**              | `logic_global_rule.md` only                        |
| **Authentication/NextAuth**                 | `logic_global_rule.md` only                        |
| **Styling Only**                            | `style_rule.md`, `font_size_rule.md`               |
| **Typography/Font Changes**                 | `font_size_rule.md`                                |
| **Logic/Business Logic**                    | `logic_global_rule.md` only                        |
| **Full Feature (UI + Logic + API + Hooks)** | All relevant files based on what you're creating   |

### Examples

**Task: "Create a new user profile component"**

- Read: `ui_rule.md`, `style_rule.md`, `font_size_rule.md`, `logic_global_rule.md`

**Task: "Create a hook to fetch user data"**

- Read: `hooks_rule.md`, `logic_global_rule.md`

**Task: "Add Next.js API route for user profile"**

- Read: `api_rule.md`, `logic_global_rule.md`

**Task: "Create new dashboard page with internationalization"**

- Read: `ui_rule.md`, `style_rule.md`, `font_size_rule.md`, `logic_global_rule.md`

**Task: "Fix button styling"**

- Read: `style_rule.md`, `font_size_rule.md`, `logic_global_rule.md`

**Task: "Implement user management feature"** (Complex - UI + Hooks + API)

- Read: `ui_rule.md`, `style_rule.md`, `font_size_rule.md`, `hooks_rule.md`, `api_rule.md`, `logic_global_rule.md`

**Task: "Add Prisma schema and database operations"**

- Read: `logic_global_rule.md` only

**Task: "Fix async error in login function"**

- Read: `logic_global_rule.md` only

## Checklist Display (REQUIRED)

- Show **at start** (after selecting rule files) and **at end** (before completion).
- Copy the "✅ Must / 🚫 Never (TL;DR)" bullets from each selected rule file.
- Format example:

  ```
  📋 Checklist from selected rules:

  logic_global_rule.md:
  ✅ Always wrap async/await in try/catch
  ✅ Always use early returns
  🚫 Never use `any` type

  hooks_rule.md:
  ✅ Always use useController for async
  ✅ Always use Redux for shared state
  🚫 Never handle errors manually with try/catch
  ```

## Rule File Summary

Available rule files in `.claude/rules/`:

1. **logic_global_rule.md** - Global logic patterns (always apply)
2. **hooks_rule.md** - React hooks development
3. **api_rule.md** - API class development
4. **ui_rule.md** - UI components and Next.js pages
5. **style_rule.md** - Styling with Tailwind and CSS
6. **font_size_rule.md** - Typography standards

## ⚡ Key Reminders

- **Always show checklist** from selected rule files at start and end.
- **Only read rule files relevant to current task** to save context.
- Always apply `logic_global_rule.md` for any code task.
- Use task-based mapping to determine which additional rules to read.
- **Verify checklist** before marking any task complete.
- Keep outputs concise; only create workflow file for complex tasks.

## 📊 Quick Reference

| What You're Building      | Read These Rules                                     |
| ------------------------- | ---------------------------------------------------- |
| UI Component              | `ui_rule.md` + `style_rule.md` + `font_size_rule.md` |
| Next.js Page (App Router) | `ui_rule.md` + `style_rule.md` + `font_size_rule.md` |
| Hook                      | `hooks_rule.md`                                      |
| Next.js API Route         | `api_rule.md`                                        |
| Prisma/Database           | `logic_global_rule.md` (only)                        |
| Styling                   | `style_rule.md` + `font_size_rule.md`                |
| Logic/Function            | `logic_global_rule.md` (only)                        |
| Full Feature              | All relevant based on components                     |

**Note**: `logic_global_rule.md` is always applied for any code task, plus add specific rule files based on what you're building.
