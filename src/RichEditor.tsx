import { useRef, useEffect, useState } from 'react'

type RichEditorProps = { value: string; onChange: (html: string) => void; placeholder?: string }

const BUTTONS: { key: string; cmd: string; arg?: string; label: string; title: string }[] = [
  { key: 'bold', cmd: 'bold', label: 'B', title: 'Bold' },
  { key: 'italic', cmd: 'italic', label: 'I', title: 'Italic' },
  { key: 'h2', cmd: 'formatBlock', arg: 'h2', label: 'H', title: 'Heading' },
  { key: 'p', cmd: 'formatBlock', arg: 'p', label: '¶', title: 'Normal' },
  { key: 'ul', cmd: 'insertUnorderedList', label: '• List', title: 'Bullet list' },
  { key: 'ol', cmd: 'insertOrderedList', label: '1. List', title: 'Numbered list' },
]

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function refreshActive() {
    const block = (document.queryCommandValue('formatBlock') || '').toLowerCase()
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
      h2: block === 'h2',
    })
  }

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    ref.current?.focus()
    if (ref.current) onChange(ref.current.innerHTML)
    refreshActive()
  }

  return (
    <div className="rich">
      <div className="rich-toolbar">
        {BUTTONS.map((b) => (
          <button
            key={b.key}
            type="button"
            className={`rich-btn ${active[b.key] ? 'active' : ''}`}
            title={b.title}
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd, b.arg) }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rich-area body-textarea"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); refreshActive() }}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onFocus={refreshActive}
      />
    </div>
  )
}