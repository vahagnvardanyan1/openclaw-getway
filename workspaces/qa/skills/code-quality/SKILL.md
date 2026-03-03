# Code Quality Skill

## Clean Code Standards

### General Principles
- **Single Responsibility**: Each file/function/component does one thing well
- **DRY**: No copy-pasted blocks of code (3+ repeated lines is a red flag)
- **Readability**: Code should be self-documenting with clear naming
- **Consistency**: Same patterns used throughout the codebase

### Naming Conventions
- Variables/functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case` or consistent BEM/module pattern
- Files: match the primary export naming convention

## HTML Quality

**Check for:**
- Proper document structure (`DOCTYPE`, `html`, `head`, `body`)
- Semantic elements over generic `<div>` soup
- Valid nesting (no `<div>` inside `<p>`, no block elements inside inline)
- No deprecated elements (`<center>`, `<font>`, `<marquee>`)
- Proper use of heading hierarchy
- Meta viewport tag for responsive pages

**Red flags:**
```
<center>
<font
<marquee
<blink
<div>\s*<div>\s*<div>  (excessive nesting)
```

## CSS Quality

**Check for:**
- No inline styles when stylesheet is available
- Logical organization (layout → typography → colors → effects)
- Responsive design (media queries, relative units)
- No magic numbers without explanation
- Proper use of CSS custom properties for repeated values
- No overly specific selectors (ID + class + element chains)

**Red flags:**
```
style\s*=\s*["']  (inline styles)
!important
z-index:\s*\d{4,}  (z-index wars)
```

## JavaScript/TypeScript Quality

**Check for:**
- Modern syntax (const/let over var, arrow functions, template literals)
- Proper error handling (no empty catch blocks)
- No unused variables or imports
- Consistent async patterns (don't mix callbacks and promises)
- No deeply nested callbacks (>3 levels)
- Functions under 50 lines (ideally under 30)

**Red flags:**
```
var\s  (use const/let)
catch\s*\([^)]*\)\s*\{\s*\}  (empty catch)
console\.log  (debug artifacts)
TODO|FIXME|HACK|XXX  (unresolved markers)
```

## React-Specific Quality

**Check for:**
- Functional components (no class components unless justified)
- Proper hook usage (deps arrays, cleanup functions)
- No inline function definitions in JSX props (causes re-renders)
- Key props on list items (and not using array index as key)
- Proper component decomposition (no 300+ line components)
- Props destructured at function signature level

**Red flags:**
```
class\s+\w+\s+extends\s+(React\.)?Component  (class components)
key\s*=\s*\{(index|i)\}  (index as key)
useEffect\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)  (useEffect with no deps — runs every render)
```

## Complexity Red Flags

| Pattern | Concern | Severity |
|---------|---------|----------|
| File > 300 lines | Too much in one file | Medium |
| Function > 50 lines | Hard to understand/test | Medium |
| Nesting > 4 levels deep | Cognitive complexity | Medium |
| 5+ parameters on a function | Interface too complex | Low |
| Ternary chains (nested `? :`) | Hard to read | Low |
| Class components in new code | Outdated pattern | Low |
| `any` type in TypeScript | Type safety bypass | Medium |
