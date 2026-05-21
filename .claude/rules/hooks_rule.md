# React Hooks Development Standards

## Next.js 15 + React 19 + Zustand

> **Purpose**: This document is designed to be used as **AI Context / System Prompt** for tools like ChatGPT, Cursor, GitHub Copilot.
>
> Goals:
>
> - Generate correct, consistent hooks
> - Avoid over-engineering and hallucination
> - Enforce your real project architecture

---

## ✅ Must / ⚠️ Prefer / 🚫 Never (TL;DR)

### ✅ Must

- Always use **Zustand** for shared or cross-feature state
- Always use **async/await** with `try/catch` in hooks
- Always define **explicit TypeScript interfaces** for hook params & returns
- Always clean up **side effects** (events, timers, media, subscriptions)
- Always separate **UI hooks** from **business logic hooks**
- Always return a **stable public API** from hooks

### ⚠️ Prefer

- Prefer `useCallback` **only when needed** (see rule below)
- Prefer **Server Actions** for mutations when possible (Next.js 15)
- Prefer **small, focused hooks** (1 concern per hook)
- Prefer **derived state** over duplicated state

### 🚫 Never

- Never use `any` (use generics or `unknown` instead)
- Never fetch reusable data directly inside components
- Never mutate React or Zustand state directly
- Never mix UI concerns with business logic in the same hook
- Never store derived/computed values in Zustand

---

## AI Guardrails (Strict)

When generating hooks or logic, the AI **MUST** follow these rules:

1. ❌ Do NOT invent new global state
   - Use **existing Zustand stores only**

2. ❌ Do NOT introduce new libraries
   - Allowed: React, Next.js, Zustand, sonner

3. ❌ Do NOT over-abstract
   - If logic is used once, keep it local

4. ❌ Do NOT guess API responses
   - Always define explicit response interfaces

5. ❌ Do NOT combine fetch logic with UI rendering
   - Hooks handle logic
   - Components handle UI

---

## Hook Structure (Standard)

```ts
"use client";

import { useState, useCallback, useEffect } from "react";

interface UseFeatureParams {
  initialValue?: string;
  onSuccess?: (data: Result) => void;
}

interface UseFeatureReturn {
  data: Result | null;
  loading: boolean;
  error: string | null;
  execute: (params: Params) => Promise<Result | void>;
  reset: () => void;
}

export function useFeature({
  initialValue,
  onSuccess,
}: UseFeatureParams = {}): UseFeatureReturn {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: Params) => {
      try {
        setLoading(true);
        setError(null);

        const result = await doSomething(params);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialValue) {
      setData(initialValue as unknown as Result);
    }
  }, [initialValue]);

  return { data, loading, error, execute, reset };
}
```

---

## File Organization

```
src/hooks/
├── use-toast.ts            # UI-only hooks
├── use-text-selection.ts   # DOM / browser hooks
├── use-tts.ts              # Media hooks
├── use-usage-limit.ts      # Business logic hooks
└── index.ts                # Barrel export
```

### Naming Rules

- File name: **kebab-case**
- Hook name: **camelCase**, prefix with `use`
- Be explicit: `useTextSelection` > `useSelection`

---

## Zustand Usage Rules

### Store SHOULD contain

- Shared app state
- Cross-page state
- Cached server data
- User/session-level data

### Store SHOULD NOT contain

- Local UI state (modal, tooltip, hover)
- Temporary form state
- Derived or computed values

### Hook ↔ Store Rules

- Hooks MAY read/write Zustand
- Hooks MUST NOT reshape store data
- Hooks MUST NOT duplicate store state locally

---

## useCallback Rule (Very Important)

### ✅ Use useCallback ONLY when

- Function is passed to child components
- Function is used in dependency arrays
- Function is part of hook public API

### 🚫 Avoid useCallback when

- Function is internal-only
- Function is cheap and not reused

---

## Client vs Server Responsibilities

### Server (API / Server Actions)

- Data fetching
- Mutations
- Authentication & authorization

### Client Hooks

- UI state
- Side effects
- Orchestration between server actions & Zustand
- Error presentation (toast, UI feedback)

🚫 Never fetch sensitive data directly in client hooks

---

## API Integration Pattern

```ts
export function useApiCall<TResponse>() {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<TResponse> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(endpoint, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: TResponse = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, loading, error, execute };
}
```

---

## Hook Complexity Rule

- A hook should not exceed **~150 lines**
- If a hook has:
  - more than 3 `useEffect`
  - more than 5 states

➡️ Split it into smaller hooks

---

## Best Practices Checklist

### ✅ DO

- Use generics for flexible hooks
- Return `reset()` where state exists
- Log errors only at boundaries
- Keep hook APIs minimal

### 🚫 DON'T

- Don’t use `any`
- Don’t duplicate Zustand state
- Don’t hide side effects
- Don’t mix UI & business logic

---

## Core Principle

> **Hooks are orchestration layers**
>
> - UI stays in components
> - Data lives in server or store
> - Hooks connect everything cleanly

---
