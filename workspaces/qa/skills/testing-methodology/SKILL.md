# Testing Methodology Skill

## Risk-Based Test Prioritization

Prioritize testing effort based on risk:

| Risk Level | What to Test | Effort |
|------------|-------------|--------|
| Critical | User-facing functionality, data handling, security boundaries | Exhaustive |
| High | Core layout/structure, navigation, form interactions | Thorough |
| Medium | Styling, responsive behavior, edge cases | Standard |
| Low | Code style, minor formatting, naming conventions | Quick scan |

## Strategy by File Type

### HTML Files
1. Validate document structure (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`)
2. Check semantic element usage (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`)
3. Verify all tags are properly closed and nested
4. Check `<meta>` tags (charset, viewport)
5. Validate link/script references exist and paths are correct
6. Check for broken internal links and anchor references

### CSS Files
1. Check for syntax errors (unclosed braces, missing semicolons)
2. Verify selectors match elements that exist in HTML
3. Check responsive breakpoints and media queries
4. Look for conflicting or overridden styles
5. Verify no `!important` abuse
6. Check for vendor prefix coverage where needed

### JavaScript/TypeScript Files
1. Check for syntax errors and undefined references
2. Verify event handlers are attached to existing elements
3. Check error handling (try/catch, promise rejection handling)
4. Validate API calls have proper error states
5. Check for memory leaks (unremoved listeners, intervals)
6. Verify state management correctness

### React Components
1. Check prop types and required props
2. Verify hooks follow rules (no conditional hooks, proper dependencies)
3. Check for missing keys in lists
4. Verify effect cleanup functions
5. Check conditional rendering logic
6. Validate component composition and data flow

## Requirements Traceability

For every requirement in the task:
1. **Map** each requirement to specific code that fulfills it
2. **Verify** the implementation matches the requirement intent
3. **Flag** any requirements not addressed in the implementation
4. **Note** any extra features added beyond requirements (scope creep)

## Regression Checklist

When verifying changes:
- [ ] Existing functionality not broken by new code
- [ ] File structure remains consistent
- [ ] No orphaned files or dead references
- [ ] Import/export chains are intact
- [ ] Configuration files are consistent
- [ ] No hardcoded values that should be configurable
