# Styling Standards (Tailwind CSS v4 + Next.js 15)

## ✅ Must / 🚫 Never (TL;DR)

- ✅ Always use Tailwind CSS utility classes as primary styling method
- ✅ Always use CSS custom properties from globals.css for colors
- ✅ Always create CSS files for complex styles when Tailwind is insufficient
- ✅ Always use responsive design principles
- ✅ Always follow the design token system
- 🚫 Never use inline styles (`style` attribute)
- 🚫 Never hardcode colors or arbitrary values without design tokens
- 🚫 Never mix multiple styling approaches in the same component

---

## Core Principles

1. **Tailwind CSS First** – Use utility classes for 95% of styling
2. **Design Tokens** – Use CSS custom properties for colors and spacing
3. **CSS Files for Complex Cases** – Create scoped CSS files when needed
4. **Responsive by Default** – Always consider mobile-first design
5. **Semantic HTML** – Use proper HTML elements with good accessibility

---

## Tailwind CSS v4 Configuration

Your project uses **Tailwind CSS v4** with configuration in `src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  /* Colors */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-muted: hsl(var(--muted));
  --color-border: hsl(var(--border));

  /* Font Sizes */
  --font-size-base: 1rem; /* 16px default */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-lg: 1.125rem; /* 18px */

  /* Spacing, borders, etc. */
}
```

---

## Primary Styling Method: Tailwind Classes

### ✅ DO - Use Tailwind Utility Classes

```tsx
// Layout & Flexbox
<div className="flex items-center justify-between gap-4">
  <div className="flex flex-col gap-2">
    <h2 className="text-2xl font-semibold">Title</h2>
    <p className="text-base text-muted-foreground">Description</p>
  </div>
</div>

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-card border border-border rounded-lg p-4">
    Card content
  </div>
</div>

// Responsive Design
<div className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 md:py-4">
  Responsive container
</div>

// Colors from Design System
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
  Primary Button
</button>
```

### 🚫 DON'T - Avoid These Patterns

```tsx
// ❌ Never use inline styles
<div style={{ display: 'flex', padding: '16px', backgroundColor: '#blue' }}>
  Bad
</div>

// ❌ Never use arbitrary values without design tokens
<div className="bg-[#3b82f6] p-[16px] text-[#ffffff]">
  Bad - hardcoded values
</div>

// ❌ Never use non-semantic HTML
<div className="text-2xl font-bold" onClick={handleClick}>
  Bad - should be button or h2
</div>
```

---

## Color System

### Using Colors from Design Tokens

Your project has a comprehensive color system defined in `globals.css`:

```tsx
// ✅ Background colors
<div className="bg-background">Main background</div>
<div className="bg-card">Card background</div>
<div className="bg-muted">Subtle background</div>

// ✅ Text colors
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<span className="text-destructive">Error text</span>

// ✅ Border colors
<div className="border border-border">Default border</div>
<div className="border border-input">Input border</div>

// ✅ Interactive states
<button className="bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-ring">
  Interactive button
</button>
```

### Available Color Tokens

Based on your `globals.css`, you have these color tokens:

```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--card: 0 0% 100%;
--primary: 200 57% 56%;
--secondary: 0 0% 96.1%;
--muted: 0 0% 96.1%;
--destructive: 0 84.2% 60.2%;
--border: 0 0% 89.8%;

/* Dark mode automatically handled */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* etc... */
}
```

---

## CSS Files for Complex Styling

### When to Create CSS Files

Create CSS files in `src/styles/` for:

- **Complex selectors** (pseudo-elements, nth-child, etc.)
- **Component-specific overrides**
- **Third-party library styling** (shadcn/ui, etc.)
- **Animation keyframes**
- **Complex hover/focus states**

### CSS File Structure

```
src/styles/
├── custom.css          # Your existing custom styles
├── markdown.css        # Markdown content styles
└── components/
    ├── chat.css
    ├── forms.css
    └── modals.css
```

### CSS File Example

```css
/* src/styles/components/chat.css */
.chat-message {
  @apply flex gap-3 p-4 rounded-lg;
}

.chat-message.user {
  @apply bg-primary/10 ml-8;
}

.chat-message.assistant {
  @apply bg-muted mr-8;
}

/* Complex selector that Tailwind can't handle */
.chat-message:nth-child(odd):not(.user) {
  @apply bg-accent/50;
}

/* Custom scrollbar */
.chat-container::-webkit-scrollbar {
  @apply w-2;
}

.chat-container::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full hover:bg-muted-foreground;
}
```

Import in component:

```tsx
import "@/styles/components/chat.css";

export function ChatComponent() {
  return (
    <div className="chat-container">
      <div className="chat-message user">User message</div>
      <div className="chat-message assistant">AI response</div>
    </div>
  );
}
```

---

## Responsive Design

### Breakpoints

Your Tailwind setup includes standard breakpoints:

```css
/* Tailwind breakpoints */
sm: 640px     /* Small tablets */
md: 768px     /* Tablets */
lg: 1024px    /* Small laptops */
xl: 1280px    /* Laptops */
2xl: 1536px   /* Large screens */
```

### Mobile-First Responsive Patterns

```tsx
// ✅ Layout responsive
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// ✅ Typography responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// ✅ Spacing responsive
<div className="p-4 md:p-6 lg:p-8 mx-4 md:mx-8 lg:mx-auto max-w-4xl">
  Responsive container
</div>

// ✅ Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## Common Layout Patterns

### Page Layouts

```tsx
// ✅ Standard page layout
<div className="min-h-screen bg-background">
  <header className="border-b border-border bg-card">
    <div className="container mx-auto px-4 py-4">
      Header content
    </div>
  </header>

  <main className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      Main content
    </div>
  </main>
</div>

// ✅ Dashboard layout with sidebar
<div className="flex h-screen bg-background">
  <aside className="w-64 border-r border-border bg-card">
    Sidebar
  </aside>
  <main className="flex-1 overflow-auto p-6">
    Dashboard content
  </main>
</div>
```

### Card Components

```tsx
// ✅ Standard card pattern
<div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <div className="p-6">
    <h3 className="text-xl font-semibold mb-2">Card Title</h3>
    <p className="text-muted-foreground mb-4">Card description</p>
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
      Action
    </button>
  </div>
</div>
```

### Form Layouts

```tsx
// ✅ Form with consistent spacing
<form className="space-y-6 max-w-md">
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Email</label>
    <input
      type="email"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>

  <button
    type="submit"
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium"
  >
    Submit
  </button>
</form>
```

---

## Integration with Next.js 15

### App Router Layout Styling

```tsx
// src/app/[locale]/layout.tsx
import "@/app/globals.css";

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Page Component Styling

```tsx
// src/app/[locale]/(protected)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>New Item</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard />
        <MetricCard />
        <MetricCard />
        <MetricCard />
      </div>
    </div>
  );
}
```

---

## Dark Mode Support

Your project includes automatic dark mode support:

```tsx
// ✅ Colors automatically adapt to dark mode
<div className="bg-background text-foreground">
  Automatically adapts to light/dark
</div>

// ✅ Custom dark mode overrides if needed
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Manual dark mode control
</div>
```

---

## Performance Considerations

### Efficient Tailwind Usage

```tsx
// ✅ Good - reusable class combinations
const buttonStyles = "px-4 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

<button className={`${buttonStyles} bg-primary text-primary-foreground hover:bg-primary/90`}>
  Primary
</button>

<button className={`${buttonStyles} bg-secondary text-secondary-foreground hover:bg-secondary/80`}>
  Secondary
</button>
```

### CSS-in-JS Alternative (if needed)

```tsx
// ✅ Use CSS variables with styled components if absolutely necessary
import styled from "styled-components";

const StyledButton = styled.button`
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius);

  &:hover {
    background-color: hsl(var(--primary) / 0.9);
  }
`;
```

---

## Accessibility Considerations

### Focus States

```tsx
// ✅ Always include focus states
<button className="bg-primary hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Accessible button
</button>

// ✅ Custom focus indicators
<input className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background" />
```

### Color Contrast

```tsx
// ✅ Use semantic colors that meet contrast requirements
<p className="text-foreground">High contrast text</p>
<p className="text-muted-foreground">Secondary text</p>

// ❌ Avoid low contrast combinations
<p className="text-gray-400">Bad - may not meet contrast requirements</p>
```

---

## Quick Reference Checklist

### For New Components

- [ ] Use Tailwind classes first
- [ ] Follow mobile-first responsive design
- [ ] Use semantic HTML elements
- [ ] Include proper focus states
- [ ] Test in both light and dark modes
- [ ] Use design tokens for colors
- [ ] Consider creating CSS file for complex styles
- [ ] Test accessibility with screen readers

### For Styling Decisions

- [ ] Can this be done with Tailwind? (Use Tailwind)
- [ ] Does it need complex selectors? (Create CSS file)
- [ ] Is it reusable across components? (Consider CSS file or component)
- [ ] Does it work in dark mode? (Use design tokens)
- [ ] Is it responsive? (Use responsive classes)

---

**Key Principle**: Start with Tailwind utility classes, use design tokens for consistency, create CSS files only when necessary, and always consider accessibility and responsive design from the beginning.
