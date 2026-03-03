# Security Review Skill

## OWASP-Based Frontend Security Checklist

### 1. Cross-Site Scripting (XSS) Prevention

**Critical patterns to flag:**
- `innerHTML` — Direct HTML injection risk
- `outerHTML` — Same as innerHTML
- `document.write()` — Legacy injection vector
- `eval()` — Arbitrary code execution
- `new Function()` — Dynamic code generation
- `setTimeout/setInterval` with string args — Hidden eval
- `dangerouslySetInnerHTML` — React's explicit escape hatch (must be justified)

**Search patterns:**
```
innerHTML
outerHTML
document\.write
eval\(
new Function\(
dangerouslySetInnerHTML
setTimeout\s*\(\s*["'`]
setInterval\s*\(\s*["'`]
```

**What to check:**
- Is user input ever inserted into DOM without sanitization?
- Are template literals used with unsanitized data in HTML context?
- Does the code use a trusted sanitization library (DOMPurify, etc.)?

### 2. Content Security

**Check for:**
- Missing or weak Content-Security-Policy headers
- Inline `<script>` tags (CSP bypass risk)
- Inline event handlers (`onclick`, `onload`, `onerror`, etc.)
- External script/resource loading from untrusted CDNs
- Mixed content (HTTP resources on HTTPS pages)

**Search patterns:**
```
on\w+\s*=\s*["']
<script>
http://
```

### 3. Data Exposure

**Critical patterns to flag:**
- Hardcoded API keys, tokens, or secrets
- Sensitive data in `localStorage`/`sessionStorage` without encryption
- Credentials in code or config files
- Console.log statements exposing sensitive data
- Comments containing passwords or keys

**Search patterns:**
```
api[_-]?key
secret
password
token
bearer
localStorage\.setItem
sessionStorage\.setItem
console\.log
```

### 4. Input Validation

**Check for:**
- Form inputs without validation
- Missing `maxlength` attributes on text inputs
- Unchecked file upload types/sizes
- URL parameters used without validation
- Missing CSRF protection on forms

### 5. Link and Navigation Safety

**Check for:**
- Links with `target="_blank"` missing `rel="noopener noreferrer"`
- `javascript:` protocol in href attributes
- Unvalidated redirects (user-controlled URLs)
- `<a>` tags without `href` attribute

**Search patterns:**
```
target\s*=\s*["']_blank
javascript:
window\.location\s*=
window\.open\(
```

### 6. Dependency and Resource Safety

**Check for:**
- Third-party scripts loaded without integrity hashes (`integrity` attribute)
- Outdated or vulnerable library versions referenced
- Excessive external dependencies for simple functionality

## Severity Guidelines

| Finding | Severity |
|---------|----------|
| `eval()` with user input | Critical |
| `innerHTML` with unsanitized data | Critical |
| Hardcoded secrets/API keys | Critical |
| `dangerouslySetInnerHTML` without sanitization | High |
| Missing `rel="noopener"` on `_blank` links | Medium |
| Inline event handlers | Medium |
| Console.log with potentially sensitive data | Low |
