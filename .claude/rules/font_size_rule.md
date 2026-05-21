# Font Size Standards (Tailwind CSS v4)

## ✅ Must / 🚫 Never (TL;DR)

- ✅ Always use Tailwind font size classes (`text-base`, `text-lg`, etc.)
- ✅ Always use semantic HTML headings with default styles
- ✅ Always follow the font scale defined in globals.css
- ✅ Always use rem-based sizes for scalability
- 🚫 Never use inline styles for font sizes
- 🚫 Never use arbitrary values like `text-[16px]`
- 🚫 Never hardcode pixel values in components

---

## Tailwind CSS v4 Font Configuration

Font sizes are configured in `src/app/globals.css` using the new `@theme` directive:

```css
@theme inline {
  /* Font Sizes */
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px - Default size */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  --font-size-5xl: 3rem; /* 48px */
  --font-size-6xl: 3.75rem; /* 60px */

  /* Font Weights */
  --font-weight-normal: 400; /* Default weight */
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## Default HTML Element Styles

Defined in `src/app/globals.css` base layer:

```css
@layer base {
  html {
    font-size: 16px; /* Base size - makes 1rem = 16px */
  }

  body {
    font-size: var(--font-size-base); /* 16px */
    line-height: var(--line-height-base); /* 24px */
    font-weight: var(--font-weight-normal); /* 400 */
  }

  h1 {
    font-size: var(--font-size-4xl);
  } /* 36px */
  h2 {
    font-size: var(--font-size-3xl);
  } /* 30px */
  h3 {
    font-size: var(--font-size-2xl);
  } /* 24px */
  h4 {
    font-size: var(--font-size-xl);
  } /* 20px */
  h5 {
    font-size: var(--font-size-lg);
  } /* 18px */
  h6 {
    font-size: var(--font-size-base);
  } /* 16px */

  small {
    font-size: var(--font-size-sm);
  } /* 14px */
}
```

---

## Usage Rules

### ✅ DO - Use Tailwind Classes

```tsx
// Body text
<p className="text-base">Normal body text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>
<p className="text-lg font-medium">Emphasized text</p>

// Headings - Use semantic HTML with default styles
<h1>Page Title</h1>           // Automatically 36px
<h2>Section Title</h2>        // Automatically 30px
<h3>Subsection Title</h3>     // Automatically 24px

// Or override with classes when needed
<h3 className="text-xl">Custom sized heading</h3>

// Small text
<small>Helper text</small>    // Automatically 14px
<span className="text-xs">Extra small text</span>
```

### 🚫 DON'T - Avoid These Patterns

```tsx
// ❌ Never use inline styles
<div style={{ fontSize: '16px' }}>Bad</div>

// ❌ Never use arbitrary values
<div className="text-[16px]">Bad</div>

// ❌ Never hardcode pixel values
const fontSize = '16px' // Bad
const styles = { fontSize: '16px' } // Bad

// ❌ Don't override semantic headings unnecessarily
<h1 className="text-sm">Bad - h1 should be large</h1>
```

---

## Font Scale Reference

| Tailwind Class | CSS Variable       | Size (px) | Line Height | Use Case                    |
| -------------- | ------------------ | --------- | ----------- | --------------------------- |
| `text-xs`      | `--font-size-xs`   | 12px      | 16px        | Labels, badges, captions    |
| `text-sm`      | `--font-size-sm`   | 14px      | 20px        | Secondary text, helper text |
| `text-base`    | `--font-size-base` | 16px      | 24px        | **Body text (default)**     |
| `text-lg`      | `--font-size-lg`   | 18px      | 28px        | Emphasis, lead paragraphs   |
| `text-xl`      | `--font-size-xl`   | 20px      | 28px        | Card titles, small headings |
| `text-2xl`     | `--font-size-2xl`  | 24px      | 32px        | Section headers             |
| `text-3xl`     | `--font-size-3xl`  | 30px      | 36px        | Page titles                 |
| `text-4xl`     | `--font-size-4xl`  | 36px      | 40px        | Hero headings               |
| `text-5xl`     | `--font-size-5xl`  | 48px      | 48px        | Large displays              |
| `text-6xl`     | `--font-size-6xl`  | 60px      | 60px        | Extra large displays        |

---

## Common Patterns

### Text Hierarchy

```tsx
// Page structure
<article>
  <h1>Article Title</h1> {/* 36px, automatic */}
  <p className="text-lg text-muted-foreground">Lead paragraph</p>
  <h2>Section Header</h2> {/* 30px, automatic */}
  <p className="text-base">Body content</p> {/* 16px, default */}
  <h3>Subsection</h3> {/* 24px, automatic */}
  <p className="text-sm">Fine print</p> {/* 14px */}
</article>
```

### UI Components

```tsx
// Card component
<div className="card">
  <h4 className="text-xl font-semibold">Card Title</h4>
  <p className="text-base">Card description text</p>
  <span className="text-xs text-muted-foreground">Metadata</span>
</div>

// Button text sizes
<button className="text-sm">Small Button</button>
<button className="text-base">Default Button</button>
<button className="text-lg">Large Button</button>
```

### Form Elements

```tsx
// Form with consistent sizing
<form>
  <label className="text-sm font-medium">Email</label>
  <input className="text-base" />
  <small className="text-xs text-muted-foreground">Helper text</small>
</form>
```

---

## Responsive Font Sizes

Use Tailwind's responsive prefixes for different screen sizes:

```tsx
// Responsive heading
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Responsive body text
<p className="text-sm md:text-base lg:text-lg">
  Responsive paragraph
</p>
```

---

## Font Weight Classes

Always combine font size with appropriate weight:

```tsx
// Heading weights
<h1 className="text-4xl font-bold">Bold heading</h1>
<h2 className="text-3xl font-semibold">Semibold heading</h2>
<h3 className="text-2xl font-medium">Medium heading</h3>

// Body text weights
<p className="text-base">Normal text (400)</p>
<p className="text-base font-medium">Medium text (500)</p>
<strong className="text-base font-semibold">Strong text (600)</strong>
```

---

## Customizing Font Sizes

To change font sizes globally, modify the CSS variables in `src/app/globals.css`:

```css
@theme inline {
  /* Example: Making base font larger */
  --font-size-base: 1.125rem; /* Change from 1rem to 1.125rem (18px) */

  /* Example: Adding new custom size */
  --font-size-7xl: 4.5rem; /* 72px for extra large displays */
}
```

After adding custom sizes, you can use them as:

```tsx
<h1 className="text-7xl">Extra Large Heading</h1>
```

---

## Integration with Design System

### With next-intl (Internationalization)

```tsx
import { useTranslations } from "next-intl";

function Component() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("pageTitle")}</h1> {/* Uses default h1 size */}
      <p className="text-base">{t("description")}</p>
    </div>
  );
}
```

### With shadcn/ui Components

```tsx
import { Button } from '@/components/ui/button'

<Button className="text-sm">Small Button</Button>
<Button className="text-base">Default Button</Button>
<Button size="lg" className="text-lg">Large Button</Button>
```

---

## Accessibility Considerations

- **Minimum readable size**: Never go below `text-sm` (14px) for body text
- **Heading hierarchy**: Use semantic HTML (h1-h6) and maintain logical order
- **Line height**: Automatically handled by CSS variables for optimal readability
- **Contrast**: Ensure sufficient contrast with background colors

---

## Quick Checklist

When implementing font sizes:

- [ ] Use Tailwind classes (`text-*`)
- [ ] Use semantic HTML headings
- [ ] Consider responsive sizing
- [ ] Include appropriate font weight
- [ ] Test readability on different devices
- [ ] Maintain visual hierarchy
- [ ] Check accessibility requirements

---

**Key Principle**: Use the established font scale consistently across your application. Let semantic HTML elements use their default sizes, and override with Tailwind classes only when necessary for design requirements.
