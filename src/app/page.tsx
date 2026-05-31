'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useSwarmStatus } from '@/hooks/useSwarmStatus'
import { useChat } from '@/hooks/useChat'
import { ChatTerminal } from '@/components/ChatTerminal'
import { AgentDetailPanel } from '@/components/AgentDetailPanel'
import { TopBar } from '@/components/TopBar'

const GodFatherCanvas = dynamic(
  () => import('@/components/GodFatherCanvas').then((m) => ({ default: m.GodFatherCanvas })),
  { ssr: false, loading: () => (
    <div style={{ width: '100vw', height: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#FFD700', gap: 16 }}>
      <div style={{ fontSize: 36 }}>\ud83d\udd31</div>
      <div style={{ fontSize: 14, letterSpacing: '0.2em' }}>INITIALIZING GODFATHER PROTOCOL</div>
    </div>
  ) }
)

export default function Dashboard() {
  const swarm = useSwarmStatus(15_000)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [talkingAgent, setTalkingAgent] = useState<string | null>(null)
  const [chatBubble, setChatBubble] = useState<string | null>(null)
  const talkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAgentResponse = useCallback((agentId: string) => {
    setTalkingAgent(agentId)
    if (talkTimerRef.current) clearTimeout(talkTimerRef.current)
    talkTimerRef.current = setTimeout(() => { setTalkingAgent(null); setChatBubble(null) }, 8000)
  }, [])

  const chat = useChat(handleAgentResponse)

  useEffect(() => {
    const last = chat.history[chat.history.length - 1]
    if (last?.role === 'assistant') setChatBubble(last.content.slice(0, 160))
  }, [chat.history])

  const handleSelectAgent = useCallback((id: string) => {
    setSelectedAgent((prev) => (prev === id ? null : id))
  }, [])

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050510' }}>
      <div style={{ position: 'absolute', inset: 0, top: 46 }}>
        <GodFatherCanvas statuses={swarm.agentStatuses} selectedAgent={selectedAgent} talkingAgent={talkingAgent} chatBubble={chatBubble} onSelectAgent={handleSelectAgent} />
      </div>
      <TopBar swarm={swarm} />
      <AgentDetailPanel agentId={selectedAgent} status={swarm.agentStatuses[selectedAgent ?? ''] ?? 'idle'} onClose={() => setSelectedAgent(null)} onChat={() => { if (selectedAgent) chat.setActiveAgent(selectedAgent) }} />
      <ChatTerminal history={chat.history} loading={chat.loading} activeAgent={chat.activeAgent} onSend={chat.send} onAgentChange={chat.setActiveAgent} onAgentSelect={setSelectedAgent} />
    </main>
  )
}
