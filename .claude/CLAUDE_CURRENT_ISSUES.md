# FIX BUGS RULE

> **Purpose**: Simple and strict rules before fixing any bug.
> Used by **humans and AI**.

---

## IMPORTANT (DO FIRST)

1. **Read `CLAUDE.md`**
   - Know project structure, conventions, and rules
   - ❌ Do not fix bugs without reading it

2. **Do NOT write code immediately**
   Before any code change:
   - Understand the bug
   - Write a short plan
   - Update this file with that plan

3. **This file is the source of truth for this bug**
   - If it is not written here → it does not exist

---

### Current issue:

when I run yarn build i got this.
/src/app/api/admin/ielts-tasks/[id]/route.ts:11:8
Type error: No overload matches this call.
Overload 1 of 2, '(values: readonly ["task1", "task2"], params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; } | undefined): ZodEnum<...>', gave the following error.
Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; }'.
Overload 2 of 2, '(entries: Readonly<Record<string, EnumValue>>, params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; } | undefined): ZodEnum<...>', gave the following error.
Argument of type 'string[]' is not assignable to parameter of type 'Readonly<Record<string, EnumValue>>'.
Index signature for type 'string' is missing in type 'string[]'.

9 | prompt: z.string().min(1, "Prompt is required").optional(),
10 | taskType: z

> 11 | .enum(["task1", "task2"], {

     |        ^

12 | errorMap: () => ({ message: "Task type must be 'task1' or 'task2'" }),
13 | })
14 | .optional(),
Next.js build worker exited with code: 1 and signal: null
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
