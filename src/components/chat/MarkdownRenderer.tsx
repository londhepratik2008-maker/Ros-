import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, ...rest } = props
          const match = /language-([\w-]+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')

          if (match) {
            return <CodeBlock language={match[1]} code={codeString} />
          }

          return (
            <code className="bg-hud-bg/80 px-1.5 py-0.5 rounded text-hud-accent text-[13px] font-mono" {...rest}>
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-lg font-orbitron text-hud-accent mb-2">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-base font-orbitron text-hud-accent mb-2">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-sm font-orbitron text-hud-accent mb-1">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-hud-accent/40 pl-3 italic text-hud-text-dim mb-2">
              {children}
            </blockquote>
          )
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-hud-accent underline hover:text-hud-accent-alt">
              {children}
            </a>
          )
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-2">
              <table className="border-collapse border border-hud-border text-xs">{children}</table>
            </div>
          )
        },
        th({ children }) {
          return <th className="border border-hud-border px-2 py-1 bg-hud-surface text-hud-accent font-orbitron">{children}</th>
        },
        td({ children }) {
          return <td className="border border-hud-border px-2 py-1">{children}</td>
        },
        hr() {
          return <hr className="border-hud-border my-3" />
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (insecure context) — no-op
    }
  }, [code])

  return (
    <div className="rounded-lg overflow-hidden border border-hud-border mb-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-hud-surface border-b border-hud-border">
        <span className="text-[10px] font-mono text-hud-text-dim uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-hud-text-dim hover:text-hud-accent transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '12px',
          background: '#0a0e1a',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace",
        }}
        showLineNumbers={code.split('\n').length > 3}
        lineNumberStyle={{ color: '#374151', minWidth: '2.5em' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
