'use client'

import { useState, useCallback } from 'react'
import { CSUITE, chat, extractReply } from '@/lib/agents'

export interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
  agent?: string
  provider?: string
  ts: number
}

export function useChat(onResponse?: (agentId: string) => void) {
  const [history, setHistory] = useState<ChatEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<string>(CSUITE[0].id)

  const send = useCallback(
    async (text: string) => {
      const userEntry: ChatEntry = { role: 'user', content: text, ts: Date.now() }
      setHistory((h) => [...h, userEntry])
      setLoading(true)

      try {
        const messages = [
          { role: 'system' as const, content: `You are ${activeAgent}, a key C-Suite AI agent in the Godfather Protocol autonomous company. Be concise, strategic, and in-character.` },
          { role: 'user' as const, content: text },
        ]
        const data = await chat(activeAgent, messages)
        const reply = extractReply(data)
        const entry: ChatEntry = {
          role: 'assistant',
          content: reply,
          agent: data.agent ?? activeAgent,
          provider: data.provider,
          ts: Date.now(),
        }
        setHistory((h) => [...h, entry])
        onResponse?.(activeAgent)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setHistory((h) => [
          ...h,
          { role: 'assistant', content: `[${activeAgent}] Error: ${msg}`, agent: activeAgent, ts: Date.now() },
        ])
      } finally {
        setLoading(false)
      }
    },
    [activeAgent, onResponse]
  )

  return { history, loading, activeAgent, setActiveAgent, send }
}
