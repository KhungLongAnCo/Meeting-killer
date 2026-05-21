---
description: Global logic patterns for the entire project
alwaysApply: true
---

# Global Logic Rules

## ✅ Must / 🚫 Never (TL;DR)

- ✅ Always wrap async/await functions in try/catch blocks.
- ✅ Always handle errors gracefully with meaningful error messages.
- ✅ Always use early returns to reduce nesting.
- ✅ Always validate inputs at function boundaries.
- ✅ Always use optional chaining (`?.`) for potentially undefined values.
- ✅ Always use nullish coalescing (`??`) instead of `||` for default values when 0 or '' are valid.
- ✅ Always use object params pattern for hooks/functions with 2+ parameters.
- ✅ Always use Zod schemas for data validation (API routes, forms).
- ✅ Always use Prisma client properly with connection handling.
- ✅ Always handle NextAuth session properly with null checks.
- 🚫 Never leave empty catch blocks without at least logging the error.
- 🚫 Never use `any` type; prefer `unknown` and narrow it down.
- 🚫 Never mutate function parameters directly.
- 🚫 Never ignore Promise rejections (unhandled promise).
- 🚫 Never use positional params for hooks/functions with more than 2 parameters.
- 🚫 Never expose sensitive env variables in client-side code.

---

## Try/Catch Pattern (required)

```tsx
// ✅ Good - async function with try/catch
const fetchUserData = async (userId: string) => {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    // Handle error appropriately (show toast, return fallback, throw)
    throw error;
  }
};

// ✅ Good - with loading state
const handleSubmit = async () => {
  try {
    setLoading(true);
    await submitForm(data);
    showSuccess("Submitted successfully!");
  } catch (error) {
    showError("Submit failed. Please try again.");
    console.error("Submit error:", error);
  } finally {
    setLoading(false);
  }
};
```

---

## Early Return Pattern

```tsx
// ✅ Good - early returns
const processOrder = (order: Order | null) => {
  if (!order) return null;
  if (order.status === "cancelled") return null;
  if (!order.items?.length) return null;

  // Main logic here
  return calculateTotal(order);
};

// ❌ Bad - deep nesting
const processOrder = (order: Order | null) => {
  if (order) {
    if (order.status !== "cancelled") {
      if (order.items?.length) {
        return calculateTotal(order);
      }
    }
  }
  return null;
};
```

---

## Safe Access Patterns

```tsx
// ✅ Good - optional chaining + nullish coalescing
const userName = user?.profile?.name ?? "Guest";
const itemCount = cart?.items?.length ?? 0;

// ✅ Good - safe array access
const firstItem = items?.[0];
const nested = data?.level1?.level2?.value;

// ❌ Bad - unsafe access
const userName = user.profile.name; // Throws if undefined
const itemCount = cart.items.length || 0; // Wrong for 0
```

---

## Error Handling in Event Handlers

```tsx
// ✅ Good - wrapped in try/catch
const handleClick = async () => {
  try {
    await performAction();
  } catch (error) {
    console.error("Action failed:", error);
    toast.error("Something went wrong");
  }
};

// ❌ Bad - unhandled promise
const handleClick = () => {
  performAction(); // Promise rejection not handled
};
```

---

## Type Safety

```tsx
// ✅ Good - use unknown and narrow
const parseJson = (input: string): unknown => {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

// ✅ Good - type guard
const isUser = (data: unknown): data is User => {
  return typeof data === "object" && data !== null && "id" in data;
};

// ❌ Bad - using any
const parseJson = (input: string): any => JSON.parse(input);
```

---

## Async Function Patterns

```tsx
// ✅ Good - Promise.all with error handling
const fetchAllData = async () => {
  try {
    const [users, products] = await Promise.all([
      fetchUsers(),
      fetchProducts(),
    ]);
    return { users, products };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { users: [], products: [] };
  }
};

// ✅ Good - Promise.allSettled for independent operations
const results = await Promise.allSettled([
  sendEmail(),
  sendNotification(),
  logAnalytics(),
]);

results.forEach((result, index) => {
  if (result.status === "rejected") {
    console.error(`Operation ${index} failed:`, result.reason);
  }
});
```

---

## Object Params Pattern (Hooks & Functions)

Khi hook/function có **2+ parameters**, sử dụng object params thay vì positional params.

```tsx
// ✅ Good - Object params (dễ đọc, dễ mở rộng)
export type UseChartDataParams = {
  chartRef: MutableRefObject<ChartApi | null>;
  selectedPeriod: PeriodOption;
  selectedSymbol: SymbolOption;
  isReady: boolean;
  onDataReady?: () => void;
};

export function useChartData({
  chartRef,
  selectedPeriod,
  selectedSymbol,
  isReady,
  onDataReady,
}: UseChartDataParams) {
  // ...
}

// Usage
useChartData({
  chartRef,
  selectedPeriod,
  selectedSymbol,
  isReady,
  onDataReady: handleDataReady,
});

// ❌ Bad - Positional params (khó đọc, khó mở rộng)
export function useChartData(
  chartRef: MutableRefObject<ChartApi | null>,
  selectedPeriod: PeriodOption,
  selectedSymbol: SymbolOption,
  isReady: boolean,
  onDataReady?: () => void,
) {
  // ...
}

// Usage - không biết param nào là gì
useChartData(
  chartRef,
  selectedPeriod,
  selectedSymbol,
  isReady,
  handleDataReady,
);
```

### Lợi ích

- ✅ **Dễ đọc**: Biết ngay param nào là gì khi gọi
- ✅ **Dễ mở rộng**: Thêm param mới không breaking change
- ✅ **Default values**: Dễ đặt giá trị mặc định
- ✅ **Type safety**: Export type để tái sử dụng
- ✅ **Optional params**: Không cần quan tâm thứ tự

### Quy tắc

| Số params | Pattern           |
| --------- | ----------------- |
| 1 param   | Positional OK     |
| 2+ params | **Object params** |

---

## Next.js API Route Patterns

### Route Handler Structure

```typescript
// ✅ Good - API route with proper error handling and validation
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validatedData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to create user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Session Handling Pattern

```typescript
// ✅ Good - proper session checking
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Safe to use session.user now
const userId = session.user.id;
```

---

## Prisma Patterns

### Database Operations

```typescript
// ✅ Good - proper Prisma usage with error handling
const getUser = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

// ✅ Good - transaction example
const createUserWithProfile = async (userData: CreateUserData) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userData.email,
          name: userData.name,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          bio: userData.bio,
        },
      });

      return { user, profile };
    });

    return result;
  } catch (error) {
    console.error("Failed to create user with profile:", error);
    throw error;
  }
};
```

---

## Environment Variables Pattern

```typescript
// ✅ Good - server-side env validation
import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
});

export const serverEnv = ServerEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});

// ❌ Bad - exposing server env to client
// Never do this in client components
const apiKey = process.env.OPENAI_API_KEY; // Will be undefined on client
```

---

## Anti-patterns (avoid)

- ❌ Empty catch blocks: `catch (e) {}`
- ❌ Swallowing errors silently without logging.
- ❌ Using `any` type to bypass TypeScript.
- ❌ Deep nested conditionals (3+ levels).
- ❌ Mutating objects/arrays passed as parameters.
- ❌ Floating promises without await or `.catch()`.
- ❌ Using `||` for default values when `0` or `''` are valid.
- ❌ Positional params cho hooks/functions với 2+ parameters.
- ❌ Not validating API route inputs with Zod.
- ❌ Not checking authentication in protected routes.
- ❌ Exposing sensitive environment variables to client.
- ❌ Not using Prisma transactions for related operations.

---
