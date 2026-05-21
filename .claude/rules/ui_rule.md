# UI Development Standards (Simplified)

Applies to UI components, pages, and Next.js App Router patterns.

**Read first:**

- `style_rule.md` – styling (Tailwind tokens only)
- `font_size_rule.md` – typography tokens

---

## Core Principles

- Follow **Next.js App Router** conventions
- Prefer **Ant Design** components over custom UI
- Style with **Tailwind** (no inline styles)
- **Translate all user-facing text** (`useTranslations`)
- Keep components **small, typed, and organized**

---

## Project Structure

```
components/                 # Shared UI
  Logo.tsx
  Loading.tsx
  modal/
  app-tree/
  [feature]/

app/[lang]/                 # App Router
  (main)/
    (private)/
    (public)/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
```

**Rules**

- Shared → `components/`
- Page-only → `app/[lang]/.../components/`
- Feature groups → `components/[feature]/`

---

## Component Standards

### File Template

```ts
/** @license header */
'use client' // only if using hooks

// External
import { useState } from 'react'
import { Button } from 'antd'
import { useTranslations } from 'next-intl'

// Internal
import { IconSvg } from '@assets/svgs'

export type MyComponentProps = {
  title: string
  onClose?: () => void
}

export const MyComponent = ({ title, onClose }: MyComponentProps) => {
  const t = useTranslations()

  return (
    <div className="flex items-center gap-4">
      <h3>{title}</h3>
      {onClose && <Button onClick={onClose}>{t('close')}</Button>}
    </div>
  )
}
```

### Naming

- **Good:** `UserProfileCard`, `ModalAddWorkspace`, `TestCaseTable`
- **Avoid:** generic names, wrong casing
- **Exports:** named exports only (except pages)

---

## Pages (App Router)

```ts
/** @license header */
'use client'

import { Card } from 'antd'
import { useTranslations } from 'next-intl'
import { ContentWrapper, ContentHeader, ContentBody } from '@layouts/components'

import MyTable from './components/MyTable'

export default function Page() {
  const t = useTranslations()

  return (
    <ContentWrapper className="page-my-feature">
      <ContentHeader>
        <h3 className="heading-page">{t('page_title')}</h3>
      </ContentHeader>
      <ContentBody>
        <Card>
          <MyTable />
        </Card>
      </ContentBody>
    </ContentWrapper>
  )
}
```

**Notes**

- Pages use **default export**
- Use route groups: `(main)`, `(private)`, `(public)`
- Type dynamic params explicitly

---

## Common Patterns

### Table

```ts
<Table columns={columns} dataSource={data} loading={loading} />
```

### Modal

```ts
<Modal open={open} onCancel={onClose} onOk={form.submit} title={t('title')}>
  <Form form={form} onFinish={onSubmit}>...</Form>
</Modal>
```

### Search

- Debounce input
- Cancel on unmount

### Empty / Loading

- Always handle **loading**, **empty**, **error** states

---

## Performance

- `useCallback` for handlers passed to children
- `useMemo` for expensive derived data
- `React.memo` for pure components

---

## Do / Don’t

**DO**

- Use `useTranslations()` for text
- Use Ant Design components
- Keep page components local
- Type all props

**DON’T**

- Inline styles
- Mix UI libraries
- Hardcode text
- Create custom UI when AntD exists

---

## Quick Checklists

**New Component**

- [ ] License header
- [ ] Typed props
- [ ] Tailwind styles
- [ ] Translations used
- [ ] Named export
- [ ] Correct location

**New Page**

- [ ] Correct App Router path
- [ ] Default export
- [ ] Layout components used
- [ ] `loading.tsx` / `error.tsx` when needed

---

**Key Rule:** Keep it simple. Follow App Router, reuse AntD, style with Tailwind, translate everything.
