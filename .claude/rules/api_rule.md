# Next.js API Route Development Standards

## Quick Reference: API Route Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Input validation schema
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Input validation
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // 3. Database operation
    const user = await prisma.user.create({
      data: validatedData,
    });

    // 4. Success response
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to create user:", error);

    // 5. Error handling
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

## ✅ Must / 🚫 Never (TL;DR)

- ✅ Always validate request body with Zod schemas
- ✅ Always check authentication for protected routes
- ✅ Always handle errors with proper HTTP status codes
- ✅ Always use try/catch blocks
- ✅ Always return consistent JSON response format
- ✅ Always log errors for debugging
- 🚫 Never expose sensitive data in responses
- 🚫 Never trust user input without validation
- 🚫 Never return database errors directly to client
- 🚫 Never forget to handle edge cases

---

## File Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts
│   ├── register/route.ts
│   └── verify-email/route.ts
├── user/
│   ├── route.ts              # GET /api/user, POST /api/user
│   ├── [id]/route.ts         # GET/PATCH/DELETE /api/user/[id]
│   └── [id]/posts/route.ts   # GET /api/user/[id]/posts
└── health/route.ts           # GET /api/health
```

**Rules:**

- Use route groups: `(auth)`, `(admin)`, `(public)`
- Dynamic routes: `[id]`, `[slug]`, `[...params]`
- HTTP methods as named exports: `GET`, `POST`, `PATCH`, `DELETE`

---

## HTTP Method Patterns

### GET - Retrieve Data

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        // Don't expose sensitive fields
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users, page, limit });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### POST - Create Resource

```typescript
const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreatePostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);

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

### PATCH - Update Resource

```typescript
const UpdateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    if (session.user.id !== params.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to update user:", error);

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

### DELETE - Remove Resource

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

## Authentication Patterns

### Protected Route Helper

```typescript
// lib/auth-helpers.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

// Usage in API route
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    // ... rest of logic
  } catch (error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
}
```

---

## Validation Patterns

### Complex Validation

```typescript
const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(1).max(99),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
  paymentMethod: z.enum(["CARD", "PAYPAL", "BANK_TRANSFER"]),
});

// Custom validation
const UpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### File Upload Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Process file...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
// lib/api-response.ts
export type ApiError = {
  error: string;
  details?: any;
  code?: string;
};

export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export function errorResponse(
  error: string,
  status: number,
  details?: any,
): NextResponse {
  return NextResponse.json({ error, details }, { status });
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string,
): NextResponse {
  return NextResponse.json({ data, message }, { status });
}
```

### Error Handler Wrapper

```typescript
// lib/api-wrapper.ts
export function withErrorHandler(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 },
        );
      }

      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

// Usage
export const POST = withErrorHandler(async (request) => {
  // Your handler logic here
});
```

---

## Middleware for API Routes

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

---

## Best Practices Checklist

When creating API routes, verify:

- [ ] File in correct `app/api/` location
- [ ] HTTP methods as named exports (`GET`, `POST`, etc.)
- [ ] Input validation with Zod schemas
- [ ] Authentication check for protected routes
- [ ] Proper error handling with try/catch
- [ ] Consistent JSON response format
- [ ] Appropriate HTTP status codes
- [ ] Error logging for debugging
- [ ] No sensitive data exposed in responses
- [ ] Database operations use Prisma properly
- [ ] Dynamic route params typed correctly

---

## Common Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error

---

**Key Principle**: API routes should be secure, validated, and consistent. Always validate inputs, check authentication, handle errors gracefully, and return meaningful responses.
