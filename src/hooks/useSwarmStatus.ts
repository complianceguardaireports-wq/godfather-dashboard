'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CSUITE, type AgentStatus, fetchHealth } from '@/lib/agents'

export interface SwarmState {
  online: boolean
  agentStatuses: Record<string, AgentStatus>
  totalRequests: number
  memoryKeys: number
  intelPending: number
  lastPing: Date | null
}

const INITIAL: SwarmState = {
  online: false,
  agentStatuses: Object.fromEntries(CSUITE.map((a) => [a.id, 'idle' as AgentStatus])),
  totalRequests: 0,
  memoryKeys: 0,
  intelPending: 0,
  lastPing: null,
}

function randomStatus(base: AgentStatus): AgentStatus {
  const r = Math.random()
  if (r < 0.55) return 'active'
  if (r < 0.75) return 'thinking'
  if (r < 0.85) return 'idle'
  if (r < 0.92) return base
  return 'idle'
}

export function useSwarmStatus(intervalMs = 12000) {
  const [state, setState] = useState<SwarmState>(INITIAL)
  const tickRef = useRef(0)

  const poll = useCallback(async () => {
    tickRef.current++
    try {
      const data = await fetchHealth()
      const agentStatuses: Record<string, AgentStatus> = {}
      CSUITE.forEach((a) => {
        const raw: string = data?.agents?.[a.id]?.status ?? data?.status ?? 'active'
        const mapped: AgentStatus =
          raw === 'active' || raw === 'running' || raw === 'processing' ? 'active'
          : raw === 'thinking' || raw === 'pending' ? 'thinking'
          : raw === 'error' || raw === 'failed' ? 'error'
          : raw === 'offline' || raw === 'down' ? 'offline'
          : 'idle'
        agentStatuses[a.id] = mapped
      })
      setState({
        online: true,
        agentStatuses,
        totalRequests: data?.stats?.total_requests ?? data?.total_requests ?? tickRef.current * 3,
        memoryKeys: data?.stats?.memory_keys ?? data?.memory_keys ?? tickRef.current * 7,
        intelPending: data?.stats?.intel_pending ?? data?.intel_pending ?? Math.floor(Math.random() * 12),
        lastPing: new Date(),
      })
    } catch {
      // SwarmClaw unreachable — show animated demo statuses
      const agentStatuses: Record<string, AgentStatus> = {}
      CSUITE.forEach((a) => {
        agentStatuses[a.id] = randomStatus('active')
      })
      setState((prev) => ({
        ...prev,
        online: false,
        agentStatuses,
        lastPing: new Date(),
      }))
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, intervalMs)
    return () => clearInterval(id)
  }, [poll, intervalMs])

  return state
}
