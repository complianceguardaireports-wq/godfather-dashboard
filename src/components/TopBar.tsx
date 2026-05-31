'use client'

import { type SwarmState } from '@/hooks/useSwarmStatus'

function Dot({ color, label, value }: { color: string; label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color: '#556677', fontSize: 11, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ color: '#8899bb', fontSize: 11, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

export function TopBar({ swarm }: { swarm: SwarmState }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 46, background: 'rgba(4,4,18,0.92)', borderBottom: '1px solid rgba(40,60,120,0.3)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 24, zIndex: 60, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>\ud83d\udd31</span>
        <span style={{ color: '#FFD700', fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 'bold' }}>GODFATHER PROTOCOL</span>
      </div>
      <div style={{ flex: 1 }} />
      <Dot color={swarm.online ? '#00FF99' : '#FF3333'} label="SWARMCLAW" value={swarm.online ? 'ONLINE' : 'OFFLINE'} />
      <Dot color="#4488ff" label="AGENTS" value="7 C-SUITE" />
      <Dot color="#aa44ff" label="LLM REQ" value={swarm.totalRequests} />
      <Dot color="#00ccff" label="MEMORY" value={swarm.memoryKeys} />
      <Dot color="#FF8C00" label="INTEL" value={swarm.intelPending} />
      <div style={{ color: '#223344', fontSize: 10, fontFamily: 'monospace' }}>{swarm.lastPing?.toLocaleTimeString()}</div>
    </div>
  )
}
