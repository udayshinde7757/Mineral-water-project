/**
 * Tiny, safe Markdown-lite renderer for AquaChat replies.
 *
 * Security: ALL text is HTML-escaped before rendering. Links are only created
 * for `http://`/`https://` strings and always get rel="noopener noreferrer" +
 * target="_blank". Raw HTML from the model is never inserted.
 *
 * Supported: paragraphs, bullet/ordered lists, `#` headings, **bold**,
 * *italic*, `code`, and bare https:// links. Soft line breaks inside a
 * paragraph become <br/>.
 */
import { Fragment } from 'react'

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Matches [text](url) where url is http(s):// or a safe same-origin path.
const MD_LINK_TOKEN = /\[[^\]]+\]\([^)\s]+\)/

// Only absolute http(s) URLs or same-origin paths (no ':' → blocks javascript:).
function isSafeLinkUrl(url) {
  if (/^https?:\/\//i.test(url)) return true
  // Same-origin path, e.g. /my-orders — must not start with '//'.
  return /^\/[a-zA-Z0-9][\w/-]*$/.test(url)
}

// Renders inline markup into an array of React nodes.
function renderInline(text, keyPrefix = '') {
  // Defensive: never crash on a missing/empty token. All callers pass strings,
  // but AI-generated Markdown is unpredictable — return an empty render instead.
  if (typeof text !== 'string') return []
  const tokens = []
  // Order matters: bold before italic, both before code/link tokens.
  const regex = new RegExp(
    '(\\*\\*[^*]+\\*\\*|\\*[^*\\n]+\\*|`[^`]+`|' + MD_LINK_TOKEN.source + '|https?:\\/\\/[^\\s<>"\']+)',
    'g'
  )
  let lastIndex = 0
  let match
  let i = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(escapeHtml(text.slice(lastIndex, match.index)))
    }
    const token = match[0]
    const key = `${keyPrefix}${i}`
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(<strong key={key}>{renderInline(token.slice(2, -2), `${key}-`)}</strong>)
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(<em key={key}>{renderInline(token.slice(1, -1), `${key}-`)}</em>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(<code key={key}>{escapeHtml(token.slice(1, -1))}</code>)
    } else if (MD_LINK_TOKEN.test(token)) {
      const mdLink = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      const url = mdLink ? mdLink[2] : null
      if (url && isSafeLinkUrl(url)) {
        tokens.push(
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {renderInline(mdLink[1], `${key}-`)}
          </a>
        )
      } else {
        tokens.push(escapeHtml(token))
      }
    } else if (/^https?:\/\//i.test(token)) {
      tokens.push(
        <a key={key} href={token} target="_blank" rel="noopener noreferrer">
          {token}
        </a>
      )
    }
    lastIndex = match.index + token.length
    i += 1
  }

  if (lastIndex < text.length) {
    tokens.push(escapeHtml(text.slice(lastIndex)))
  }
  return tokens
}

const BULLET_RE = /^\s*[-*+]\s+(.*)$/
const ORDERED_RE = /^\s*\d+[.)]\s+(.*)$/
const HEADING_RE = /^\s*(#{1,3})\s+(.*)$/

export function renderMarkdown(markdown) {
  if (typeof markdown !== 'string') return null
  const source = markdown.trim()
  if (!source) return null

  const lines = source.split(/\r?\n/)
  const blocks = []
  let i = 0

  const push = (node) => blocks.push(node)

  while (i < lines.length) {
    const line = lines[i]

    // Skip blank lines (they separate blocks).
    if (!line.trim()) {
      i += 1
      continue
    }

    // Bullet list.
    const bullet = line.match(BULLET_RE)
    if (bullet) {
      const items = [bullet[1]]
      i += 1
      while (i < lines.length) {
        const m = lines[i].match(BULLET_RE)
        if (m) {
          items.push(m[1])
          i += 1
        } else break
      }
      push(
        <ul key={`ul${blocks.length}`}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ul${blocks.length}-${idx}-`)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list.
    const ordered = line.match(ORDERED_RE)
    if (ordered) {
      const items = [ordered[1]]
      i += 1
      while (i < lines.length) {
        const m = lines[i].match(ORDERED_RE)
        if (m) {
          items.push(m[1])
          i += 1
        } else break
      }
      push(
        <ol key={`ol${blocks.length}`}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ol${blocks.length}-${idx}-`)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Heading.
    const heading = line.match(HEADING_RE)
    if (heading) {
      const level = heading[1].length
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5'
      push(
        <Tag key={`h${blocks.length}`}>{renderInline(heading[2], `h${blocks.length}-`)}</Tag>
      )
      i += 1
      continue
    }

    // Paragraph — gather consecutive non-blank, non-list, non-heading lines.
    const para = [line]
    i += 1
    while (i < lines.length) {
      const l = lines[i]
      if (
        !l.trim() ||
        BULLET_RE.test(l) ||
        ORDERED_RE.test(l) ||
        HEADING_RE.test(l)
      ) {
        break
      }
      para.push(l)
      i += 1
    }

    const renderedLines = para.map((l, idx) => (
      <Fragment key={idx}>{renderInline(l, `p${blocks.length}-${idx}-`)}</Fragment>
    ))
    const withBreaks = renderedLines.flatMap((node, idx) =>
      idx === 0 ? [node] : [<br key={`br${idx}`} />, node]
    )
    push(<p key={`p${blocks.length}`}>{withBreaks}</p>)
  }

  return <div className="aquachat-md">{blocks}</div>
}
