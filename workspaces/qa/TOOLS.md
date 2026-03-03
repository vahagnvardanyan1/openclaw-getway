# TOOLS.md - QA Tool Usage Notes

## Output Directory

All FE output lives in: `{{PROJECT_ROOT}}/output/`
Always use absolute paths when reading files.

## Static Analysis Patterns

Since you don't have a test runner, you perform static analysis by reading files and searching for patterns. Here are your primary techniques:

### HTML Analysis
- Read the file and verify document structure manually
- Check for missing attributes by searching: `<img` without `alt=`, `<html` without `lang=`
- Verify all internal links/references resolve to existing files
- Check heading hierarchy by listing all `<h1>`–`<h6>` tags in order

### CSS Analysis
- Search for `!important` usage and count occurrences
- Search for `outline: none` or `outline: 0` (accessibility concern)
- Check for inline styles in HTML files: `style="`
- Look for very high z-index values (1000+)

### JavaScript Analysis
- Search for security anti-patterns: `innerHTML`, `eval(`, `document.write(`
- Search for debug artifacts: `console.log`, `console.debug`
- Search for deprecated patterns: `var ` (should be `const`/`let`)
- Search for TODO/FIXME/HACK markers
- Check for empty catch blocks

### Security Grep Patterns
```
innerHTML
outerHTML
eval\(
document\.write
dangerouslySetInnerHTML
api[_-]?key
secret
password
token
bearer
console\.log
target\s*=\s*["']_blank
javascript:
```

### React Analysis
- Search for class components: `extends Component` or `extends React.Component`
- Check for index-as-key: `key={index}` or `key={i}`
- Look for missing dependency arrays in useEffect
- Search for inline function definitions in JSX

## File Reading Strategy

1. First, list all files in the output directory
2. Read each file completely — do not skim
3. For large files, read in sections but cover the entire file
4. After reading, perform targeted searches for specific patterns
5. Cross-reference between files (HTML references match CSS/JS filenames)
