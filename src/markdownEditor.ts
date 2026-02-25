/**
 * Markdown Editor — Core Rendering Engine
 * Converts Markdown text to HTML with support for:
 * headings, bold/italic, inline code, code blocks,
 * blockquotes, ordered/unordered lists, horizontal rules,
 * links, images, and tables.
 */

export interface MarkdownStats {
  wordCount: number
  charCount: number
  lineCount: number
  headingCount: number
  codeBlockCount: number
  linkCount: number
}

export interface MarkdownTemplate {
  name: string
  description: string
  content: string
}

/** Built-in starter templates */
export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  {
    name: 'README',
    description: 'Project README skeleton',
    content: `# Project Name

A short description of what this project does.

## Features

- ✅ Feature one
- ✅ Feature two
- ✅ Feature three

## Installation

\`\`\`bash
npm install your-package
\`\`\`

## Usage

\`\`\`typescript
import { yourFunction } from 'your-package'
yourFunction()
\`\`\`

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](LICENSE)
`,
  },
  {
    name: 'Blog Post',
    description: 'Simple blog post outline',
    content: `# Title of Your Blog Post

*Published: ${new Date().toISOString().slice(0, 10)} · 5 min read*

## Introduction

Hook the reader here. State the problem you are solving.

## Main Section

Explain the concept step by step.

> 💡 **Pro tip:** Use blockquotes to highlight important ideas.

### Sub-section

More details with inline \`code\` where needed.

\`\`\`javascript
// Code example
const result = solve(problem)
console.log(result)
\`\`\`

## Conclusion

Summarise the key takeaways.

---

*Thanks for reading! Feel free to share your thoughts.*
`,
  },
  {
    name: 'Meeting Notes',
    description: 'Structured meeting notes',
    content: `# Meeting Notes — ${new Date().toISOString().slice(0, 10)}

**Attendees:** Alice, Bob, Charlie

**Agenda:**
1. Review last sprint
2. Plan next sprint
3. Open discussion

---

## Action Items

| Task | Owner | Due |
|------|-------|-----|
| Write tests | Alice | Friday |
| Update docs | Bob | Next Monday |
| Deploy fix | Charlie | Today |

## Notes

- Decided to move the release date to next Wednesday.
- Bob will schedule a follow-up on the API design.

---

*Next meeting: TBD*
`,
  },
]

/**
 * Escape HTML special characters to prevent XSS inside code blocks.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Convert a Markdown string to an HTML string.
 * Processing order matters — block-level elements are handled first,
 * then inline elements within each block.
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown.trim()) return ''

  const lines = markdown.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block  ```lang ... ```
    if (/^```/.test(line)) {
      const langMatch = line.match(/^```(\w*)/)
      const lang = langMatch ? langMatch[1] : ''
      const codeLines: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : ''
      output.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
      continue
    }

    // Horizontal rule  --- / *** / ___
    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      output.push('<hr />')
      i++
      continue
    }

    // ATX headings  # H1 through ###### H6
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = renderInline(headingMatch[2])
      output.push(`<h${level}>${content}</h${level}>`)
      i++
      continue
    }

    // Blockquote  > text
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const inner = renderMarkdown(quoteLines.join('\n'))
      output.push(`<blockquote>${inner}</blockquote>`)
      continue
    }

    // Unordered list  - / * / + item
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s/, ''))}</li>`)
        i++
      }
      output.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    // Ordered list  1. item
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`)
        i++
      }
      output.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    // Table  | col | col |
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s\-|:]+\|/.test(lines[i + 1])) {
      const headerCells = parseTableRow(line)
      i += 2 // skip header + separator
      const bodyRows: string[][] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        bodyRows.push(parseTableRow(lines[i]))
        i++
      }
      const thead = `<thead><tr>${headerCells.map(c => `<th>${renderInline(c)}</th>`).join('')}</tr></thead>`
      const tbody = bodyRows.length
        ? `<tbody>${bodyRows.map(row => `<tr>${row.map(c => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
        : ''
      output.push(`<table>${thead}${tbody}</table>`)
      continue
    }

    // Blank line → paragraph separator
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph — gather consecutive non-blank, non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^(\s*[-*_]){3,}\s*$/.test(lines[i]) &&
      !/^\|/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      output.push(`<p>${renderInline(paraLines.join(' '))}</p>`)
    }
  }

  return output.join('\n')
}

/**
 * Parse a Markdown table row into cell strings.
 */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim())
}

/**
 * Render inline Markdown elements: bold, italic, inline-code, links, images.
 */
export function renderInline(text: string): string {
  // Images  ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`
  })

  // Links  [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
  })

  // Inline code  `code`
  text = text.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`)

  // Bold+italic  ***text***
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')

  // Bold  **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic  *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough  ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')

  return text
}

/**
 * Compute statistics about a Markdown document.
 */
export function getMarkdownStats(markdown: string): MarkdownStats {
  const lines = markdown.split('\n')
  const words = markdown.trim() === '' ? [] : markdown.trim().split(/\s+/)
  const headingCount = lines.filter(l => /^#{1,6}\s/.test(l)).length
  const codeBlockCount = (markdown.match(/^```/gm) || []).length / 2
  const linkCount = (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length

  return {
    wordCount: words.length,
    charCount: markdown.length,
    lineCount: lines.length,
    headingCount,
    codeBlockCount: Math.floor(codeBlockCount),
    linkCount,
  }
}

/**
 * Insert a Markdown snippet at the given cursor position in a textarea string.
 * Returns the new string and updated cursor position.
 */
export function insertSnippet(
  text: string,
  cursorStart: number,
  cursorEnd: number,
  before: string,
  after: string = '',
  placeholder: string = ''
): { text: string; selectionStart: number; selectionEnd: number } {
  const selected = text.slice(cursorStart, cursorEnd)
  const inner = selected || placeholder
  const newText = text.slice(0, cursorStart) + before + inner + after + text.slice(cursorEnd)
  const selectionStart = cursorStart + before.length
  const selectionEnd = selectionStart + inner.length
  return { text: newText, selectionStart, selectionEnd }
}
