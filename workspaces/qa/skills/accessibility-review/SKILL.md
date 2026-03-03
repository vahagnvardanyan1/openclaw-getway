# Accessibility Review Skill

## WCAG 2.1 AA Compliance Checklist

### 1. Perceivable

**Images and media:**
- All `<img>` tags MUST have `alt` attributes
- Decorative images should have `alt=""`
- Complex images need detailed `alt` text or `aria-describedby`
- `<video>` and `<audio>` elements need captions/transcripts

**Search patterns for issues:**
```
<img(?![^>]*alt\s*=)
<img[^>]*alt\s*=\s*["']\s*["']  (empty alt — verify it's decorative)
<video(?![^>]*track)
<audio(?![^>]*track)
```

**Color and contrast:**
- Text color must have sufficient contrast against background (4.5:1 for normal text, 3:1 for large text)
- Information must not be conveyed by color alone
- Check for hardcoded light colors on white/light backgrounds

**Text and content:**
- Page must have a meaningful `<title>`
- Language must be declared (`<html lang="...">`)
- Text can be resized to 200% without loss of content

### 2. Operable

**Keyboard navigation:**
- All interactive elements must be keyboard accessible
- Tab order must be logical (avoid positive `tabindex` values > 0)
- Focus states must be visible (check for `outline: none` or `outline: 0`)
- No keyboard traps (user can tab away from any element)

**Search patterns for issues:**
```
outline\s*:\s*none
outline\s*:\s*0
tabindex\s*=\s*["'][2-9]
tabindex\s*=\s*["']\d{2,}
```

**Navigation:**
- Skip navigation link should be present for content-heavy pages
- Headings must follow hierarchy (`<h1>` → `<h2>` → `<h3>`, no skipping levels)
- Landmark regions should be used (`<main>`, `<nav>`, `<header>`, `<footer>`)

### 3. Understandable

**Forms:**
- All form inputs MUST have associated `<label>` elements (via `for`/`id` or wrapping)
- Error messages must be descriptive and associated with the field
- Required fields must be indicated (not just by color)
- Form validation errors must be announced to screen readers

**Search patterns for issues:**
```
<input(?![^>]*aria-label)(?![^>]*id\s*=)
<select(?![^>]*aria-label)(?![^>]*id\s*=)
<textarea(?![^>]*aria-label)(?![^>]*id\s*=)
```

**Language and readability:**
- Link text must be descriptive (no "click here", "read more" without context)
- Error messages must explain what went wrong and how to fix it
- Instructions must not rely solely on sensory characteristics ("the red button", "the item on the left")

### 4. Robust

**ARIA usage:**
- ARIA roles must be valid and used correctly
- `aria-hidden="true"` must not be on focusable elements
- Custom interactive elements need proper ARIA roles and states
- Prefer semantic HTML over ARIA (a `<button>` is better than `<div role="button">`)

**Search patterns for issues:**
```
aria-hidden\s*=\s*["']true["'][^>]*tabindex
<div[^>]*onclick
<span[^>]*onclick
role\s*=\s*["']button["']  (check if a <button> would work instead)
```

**HTML validity:**
- Unique `id` attributes (no duplicates)
- Proper nesting of elements
- Valid HTML structure

## Common Anti-Patterns to Flag

| Anti-Pattern | Severity | Fix |
|-------------|----------|-----|
| `<img>` without `alt` | High | Add descriptive `alt` text |
| `outline: none` without alternative focus style | High | Add visible focus indicator |
| `<div onclick>` instead of `<button>` | Medium | Use semantic `<button>` element |
| Heading level skipped (h1 → h3) | Medium | Use proper heading hierarchy |
| `<html>` without `lang` attribute | Medium | Add `lang="en"` (or appropriate) |
| Link text "click here" | Low | Use descriptive link text |
| `tabindex` > 0 | Low | Use natural DOM order instead |
