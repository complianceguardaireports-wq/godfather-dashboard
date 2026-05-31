'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CSUITE } from '@/lib/agents'
import { type ChatEntry } from '@/hooks/useChat'

interface ChatTerminalProps {
  history: ChatEntry[]
  loading: boolean
  activeAgent: string
  onSend: (text: string) => void
  onAgentChange: (id: string) => void
  onAgentSelect: (id: string) => void
}

export function ChatTerminal({ history, loading, activeAgent, onSend, onAgentChange, onAgentSelect }: ChatTerminalProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeAgentDef = CSUITE.find((a) => a.id === activeAgent)

  useEffect(() => {
    if (open) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus() }
  }, [history, open])

  const handleSend = () => { if (!input.trim()) return; onSend(input.trim()); setInput('') }
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
        <button onClick={() => setOpen((o) => !o)} style={{ background: 'rgba(5,5,25,0.95)', border: '1px solid rgba(100,140,255,0.25)', borderBottom: 'none', borderRadius: '10px 10px 0 0', padding: '6px 28px', color: '#7799cc', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.1em' }}>
          {open ? '\u25bc CLOSE TERMINAL' : '\u25b2 COMMAND TERMINAL'}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 380, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ background: 'rgba(4,4,20,0.97)', borderTop: '1px solid rgba(80,120,255,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(60,80,140,0.2)', overflowX: 'auto', flexShrink: 0 }}>
              <span style={{ color: '#445', fontSize: 11, fontFamily: 'monospace', paddingTop: 3, whiteSpace: 'nowrap' }}>ROUTE TO \u2192</span>
              {CSUITE.map((a) => (
                <button key={a.id} onClick={() => { onAgentChange(a.id); onAgentSelect(a.id) }}
                  style={{ background: activeAgent === a.id ? `${a.color}22` : 'transparent', border: `1px solid ${activeAgent === a.id ? a.color : '#334'}`, borderRadius: 6, padding: '3px 10px', color: activeAgent === a.id ? a.color : '#667', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: a.color, marginRight: 5, verticalAlign: 'middle' }} />
                  {a.id}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 && <div style={{ color: '#334466', fontSize: 12, fontFamily: 'monospace', textAlign: 'center', marginTop: 24 }}>🔱 THE GODFATHER PROTOCOL \u2014 {activeAgent} is listening.</div>}
              {history.map((entry, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: entry.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: entry.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px', background: entry.role === 'user' ? 'rgba(40,60,140,0.4)' : 'rgba(5,5,20,0.8)', border: entry.role === 'assistant' ? `1px solid ${activeAgentDef?.color ?? '#334'}44` : '1px solid rgba(80,100,200,0.3)', color: entry.role === 'user' ? '#aaccff' : '#cce8ff', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {entry.role === 'assistant' && <div style={{ color: activeAgentDef?.color ?? '#7799bb', fontSize: 10, marginBottom: 4 }}>[{entry.agent ?? activeAgent}]</div>}
                    {entry.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color: activeAgentDef?.color ?? '#7799bb', fontSize: 12, fontFamily: 'monospace' }}>[{activeAgent}] thinking<span className="dots">...</span></div>}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid rgba(60,80,140,0.2)', flexShrink: 0 }}>
              <span style={{ color: activeAgentDef?.color ?? '#7799bb', fontFamily: 'monospace', fontSize: 13, paddingTop: 10 }}>[{activeAgent}] \u203a</span>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} disabled={loading} placeholder={`Command ${activeAgent}...`}
                style={{ flex: 1, background: 'rgba(10,10,30,0.6)', border: '1px solid rgba(80,100,200,0.2)', borderRadius: 6, padding: '8px 12px', color: '#c0d8f0', fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                style={{ background: loading ? '#111' : `${activeAgentDef?.color ?? '#4488ff'}22`, border: `1px solid ${loading ? '#222' : (activeAgentDef?.color ?? '#4488ff')}`, borderRadius: 6, padding: '8px 16px', color: loading ? '#334' : (activeAgentDef?.color ?? '#4488ff'), fontFamily: 'monospace', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer' }}>SEND</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
