/**
 * Tests for Markdown Editor core logic
 */

import { describe, it, expect } from 'vitest'
import {
  renderMarkdown,
  renderInline,
  getMarkdownStats,
  insertSnippet,
  MARKDOWN_TEMPLATES,
} from './markdownEditor'

describe('renderInline', () => {
  it('renders bold with **', () => {
    expect(renderInline('**bold**')).toBe('<strong>bold</strong>')
  })

  it('renders bold with __', () => {
    expect(renderInline('__bold__')).toBe('<strong>bold</strong>')
  })

  it('renders italic with *', () => {
    expect(renderInline('*italic*')).toBe('<em>italic</em>')
  })

  it('renders italic with _', () => {
    expect(renderInline('_italic_')).toBe('<em>italic</em>')
  })

  it('renders bold+italic with ***', () => {
    expect(renderInline('***bi***')).toBe('<strong><em>bi</em></strong>')
  })

  it('renders strikethrough with ~~', () => {
    expect(renderInline('~~del~~')).toBe('<del>del</del>')
  })

  it('renders inline code with backticks', () => {
    expect(renderInline('`code`')).toBe('<code>code</code>')
  })

  it('escapes HTML inside inline code', () => {
    expect(renderInline('`<div>`')).toBe('<code>&lt;div&gt;</code>')
  })

  it('renders a link', () => {
    const result = renderInline('[GitHub](https://github.com)')
    expect(result).toContain('<a href="https://github.com"')
    expect(result).toContain('GitHub')
    expect(result).toContain('target="_blank"')
  })

  it('renders an image', () => {
    const result = renderInline('![alt text](image.png)')
    expect(result).toContain('<img src="image.png"')
    expect(result).toContain('alt="alt text"')
  })

  it('returns plain text unchanged', () => {
    expect(renderInline('hello world')).toBe('hello world')
  })
})

describe('renderMarkdown', () => {
  it('returns empty string for blank input', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown('   ')).toBe('')
  })

  it('renders h1', () => {
    expect(renderMarkdown('# Heading 1')).toContain('<h1>')
    expect(renderMarkdown('# Heading 1')).toContain('</h1>')
  })

  it('renders h2', () => {
    expect(renderMarkdown('## Heading 2')).toContain('<h2>')
  })

  it('renders h6', () => {
    expect(renderMarkdown('###### Heading 6')).toContain('<h6>')
  })

  it('renders a paragraph', () => {
    const result = renderMarkdown('Hello world')
    expect(result).toContain('<p>')
    expect(result).toContain('Hello world')
  })

  it('renders an unordered list', () => {
    const result = renderMarkdown('- item one\n- item two')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>')
    expect(result).toContain('item one')
    expect(result).toContain('item two')
  })

  it('renders an ordered list', () => {
    const result = renderMarkdown('1. first\n2. second')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>')
    expect(result).toContain('first')
    expect(result).toContain('second')
  })

  it('renders a blockquote', () => {
    const result = renderMarkdown('> quote text')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('quote text')
  })

  it('renders a fenced code block', () => {
    const result = renderMarkdown('```js\nconsole.log("hi")\n```')
    expect(result).toContain('<pre>')
    expect(result).toContain('<code')
    expect(result).toContain('console.log')
  })

  it('escapes HTML in fenced code blocks', () => {
    const result = renderMarkdown('```\n<script>alert(1)</script>\n```')
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })

  it('attaches language class to code block', () => {
    const result = renderMarkdown('```typescript\nlet x = 1\n```')
    expect(result).toContain('class="language-typescript"')
  })

  it('renders a horizontal rule with ---', () => {
    expect(renderMarkdown('---')).toContain('<hr')
  })

  it('renders a horizontal rule with ***', () => {
    expect(renderMarkdown('***')).toContain('<hr')
  })

  it('renders a table', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const result = renderMarkdown(md)
    expect(result).toContain('<table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<th>')
    expect(result).toContain('<tbody>')
    expect(result).toContain('<td>')
  })

  it('renders inline bold in a heading', () => {
    const result = renderMarkdown('# **Bold** heading')
    expect(result).toContain('<strong>Bold</strong>')
  })
})

describe('getMarkdownStats', () => {
  it('returns zero stats for empty string', () => {
    const stats = getMarkdownStats('')
    expect(stats.wordCount).toBe(0)
    expect(stats.charCount).toBe(0)
    expect(stats.headingCount).toBe(0)
    expect(stats.codeBlockCount).toBe(0)
    expect(stats.linkCount).toBe(0)
  })

  it('counts words', () => {
    const stats = getMarkdownStats('hello world foo')
    expect(stats.wordCount).toBe(3)
  })

  it('counts characters', () => {
    const stats = getMarkdownStats('abc')
    expect(stats.charCount).toBe(3)
  })

  it('counts lines', () => {
    const stats = getMarkdownStats('a\nb\nc')
    expect(stats.lineCount).toBe(3)
  })

  it('counts headings', () => {
    const stats = getMarkdownStats('# H1\n## H2\n### H3')
    expect(stats.headingCount).toBe(3)
  })

  it('counts code blocks', () => {
    const stats = getMarkdownStats('```\ncode\n```\n\n```\nmore\n```')
    expect(stats.codeBlockCount).toBe(2)
  })

  it('counts links', () => {
    const stats = getMarkdownStats('[link1](url1) and [link2](url2)')
    expect(stats.linkCount).toBe(2)
  })
})

describe('insertSnippet', () => {
  it('wraps selected text', () => {
    const result = insertSnippet('hello world', 6, 11, '**', '**')
    expect(result.text).toBe('hello **world**')
    expect(result.selectionStart).toBe(8)
    expect(result.selectionEnd).toBe(13)
  })

  it('uses placeholder when no text is selected', () => {
    const result = insertSnippet('', 0, 0, '**', '**', 'bold text')
    expect(result.text).toBe('**bold text**')
  })

  it('inserts at cursor when before/after have no placeholder', () => {
    const result = insertSnippet('hello', 5, 5, '!')
    expect(result.text).toBe('hello!')
  })
})

describe('MARKDOWN_TEMPLATES', () => {
  it('has at least three templates', () => {
    expect(MARKDOWN_TEMPLATES.length).toBeGreaterThanOrEqual(3)
  })

  it('each template has name, description and content', () => {
    for (const t of MARKDOWN_TEMPLATES) {
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(t.content).toBeTruthy()
    }
  })

  it('README template contains a heading', () => {
    const readme = MARKDOWN_TEMPLATES.find(t => t.name === 'README')
    expect(readme).toBeDefined()
    expect(readme!.content).toContain('# ')
  })
})
