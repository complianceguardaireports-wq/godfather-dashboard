'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CSUITE, STATUS_COLORS, type AgentStatus } from '@/lib/agents'

interface AgentDetailPanelProps { agentId: string | null; status: AgentStatus; onClose: () => void; onChat: () => void }

export function AgentDetailPanel({ agentId, status, onClose, onChat }: AgentDetailPanelProps) {
  const agent = CSUITE.find((a) => a.id === agentId)
  return (
    <AnimatePresence>
      {agent && (
        <motion.div key={agent.id} initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ position: 'fixed', top: '50%', left: 16, transform: 'translateY(-50%)', width: 280, background: 'rgba(4,4,20,0.95)', border: `1px solid ${agent.color}44`, borderRadius: 12, padding: 20, fontFamily: 'monospace', backdropFilter: 'blur(16px)', zIndex: 40, boxShadow: `0 0 40px ${agent.color}22` }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#445', fontSize: 16, cursor: 'pointer' }}>\u2715</button>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: `${agent.color}22`, border: `1px solid ${agent.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: agent.color, fontSize: 16, fontWeight: 'bold' }}>{agent.role.slice(0, 1)}</div>
              <div><div style={{ color: agent.color, fontSize: 15, fontWeight: 'bold' }}>{agent.id}</div><div style={{ color: '#667', fontSize: 11 }}>{agent.role} \u00b7 {agent.dept}</div></div>
            </div>
            <div style={{ color: '#556', fontSize: 11, lineHeight: 1.5 }}>{agent.tagline}</div>
          </div>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLORS[status], boxShadow: `0 0 8px ${STATUS_COLORS[status]}` }} />
            <span style={{ color: STATUS_COLORS[status], fontSize: 11, textTransform: 'uppercase' }}>{status}</span>
          </div>
          {[['RUNTIME','SwarmClaw v2.0'],['OS','Cognithor (145 MCP tools)'],['MEMORY','agentmemory (shared)'],['LLM','Groq \u2192 ClawRouter cascade']].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(40,40,80,0.5)', fontSize: 11 }}>
              <span style={{ color: '#445' }}>{k}</span><span style={{ color: '#8899cc' }}>{v}</span>
            </div>
          ))}
          <button onClick={onChat} style={{ marginTop: 16, width: '100%', padding: '10px 0', background: `${agent.color}18`, border: `1px solid ${agent.color}55`, borderRadius: 7, color: agent.color, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}>
            \u25b2 OPEN TERMINAL \u00b7 TALK TO {agent.id}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
