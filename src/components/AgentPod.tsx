'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { type AgentDef, type AgentStatus, STATUS_COLORS } from '@/lib/agents'

interface AgentPodProps {
  agent: AgentDef
  status: AgentStatus
  selected: boolean
  talking: boolean
  onSelect: () => void
  chatBubble?: string | null
}

function HexPlatform({ color, boss }: { color: string; boss: boolean }) {
  const h = boss ? 0.35 : 0.22
  const r = boss ? 1.8 : 1.3
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r, r + 0.1, h, 6]} />
        <meshStandardMaterial color="#0a0a1a" emissive={color} emissiveIntensity={0.12} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]}>
        <cylinderGeometry args={[r, r, 0.02, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function StatusRing({ color, statusColor, boss }: { color: string; statusColor: string; boss: boolean }) {
  const ref = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.6
    innerRef.current.rotation.y -= delta * 0.9
  })
  const r = boss ? 2.2 : 1.6
  return (
    <group position={[0, -0.08, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[r, 0.04, 8, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[r - 0.35, 0.025, 8, 48]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.8} />
      </mesh>
    </group>
  )
}

function AgentCharacter({ color, status, boss }: { color: string; status: AgentStatus; boss: boolean }) {
  const bodyRef = useRef<THREE.Mesh>(null!)
  const headRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const intensity = useMemo(() => {
    if (status === 'active') return 1.2
    if (status === 'thinking') return 0.7
    if (status === 'error') return 0.9
    return 0.25
  }, [status])
  const bodyH = boss ? 1.1 : 0.85
  const headR = boss ? 0.38 : 0.3
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const breathe = Math.sin(t * (status === 'active' ? 3.5 : status === 'thinking' ? 2.2 : 1.0)) * 0.04
    if (bodyRef.current) bodyRef.current.scale.y = 1 + breathe
    if (headRef.current) {
      headRef.current.position.y = bodyH / 2 + headR + breathe * 1.5
      headRef.current.rotation.z = status === 'thinking' ? Math.sin(t * 1.5) * 0.12 : 0
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * (status === 'active' ? 4 : 1.5)) * 0.15
      glowRef.current.scale.setScalar(pulse)
      ;(glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * (0.8 + Math.sin(t * 2) * 0.2)
    }
  })
  const emColor = status === 'error' ? '#FF2222' : color
  return (
    <group position={[0, boss ? 0.5 : 0.35, 0]}>
      <mesh ref={bodyRef}>
        <capsuleGeometry args={[0.22, bodyH, 8, 16]} />
        <meshStandardMaterial color="#111122" emissive={emColor} emissiveIntensity={intensity} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={headRef} position={[0, bodyH / 2 + headR, 0]}>
        <sphereGeometry args={[headR, 16, 16]} />
        <meshStandardMaterial color="#111122" emissive={emColor} emissiveIntensity={intensity * 1.3} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh ref={glowRef} position={[0, bodyH / 4, 0]}>
        <sphereGeometry args={[boss ? 1.0 : 0.75, 16, 16]} />
        <meshStandardMaterial color={emColor} emissive={emColor} emissiveIntensity={intensity * 0.4} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ChatBubble({ text }: { text: string }) {
  return (
    <Html position={[0, 4.5, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
      <div style={{ background: 'rgba(5,5,20,0.92)', border: '1px solid rgba(100,200,255,0.4)', borderRadius: 8, padding: '8px 12px', maxWidth: 220, color: '#e0f0ff', fontSize: 11, fontFamily: 'monospace', backdropFilter: 'blur(8px)', lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'pre-wrap' }}>
        {text.length > 180 ? text.slice(0, 180) + '\u2026' : text}
      </div>
    </Html>
  )
}

export function AgentPod({ agent, status, selected, talking, onSelect, chatBubble }: AgentPodProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const statusColor = STATUS_COLORS[status]
  const elevation = agent.boss ? 0.8 : 0
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = elevation + Math.sin(t * 0.8 + agent.pos[0]) * 0.08
    if (selected) groupRef.current.rotation.y += 0.005
  })
  return (
    <group ref={groupRef} position={[agent.pos[0], elevation, agent.pos[2]]} onClick={(e) => { e.stopPropagation(); onSelect() }}>
      <HexPlatform color={agent.color} boss={agent.boss} />
      <StatusRing color={agent.color} statusColor={statusColor} boss={agent.boss} />
      <AgentCharacter color={agent.color} status={status} boss={agent.boss} />
      {selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[agent.boss ? 2.3 : 1.7, agent.boss ? 2.6 : 2.0, 48]} />
          <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={2} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Billboard position={[0, agent.boss ? 3.4 : 2.8, 0]}>
        <Text fontSize={agent.boss ? 0.38 : 0.28} color={agent.color} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">{agent.id}</Text>
        <Text fontSize={0.18} color="#8899bb" anchorX="center" anchorY="middle" position={[0, -0.38, 0]}>{agent.role} \u00b7 {agent.dept}</Text>
      </Billboard>
      <mesh position={[0, agent.boss ? 2.6 : 2.1, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={2} />
      </mesh>
      {talking && chatBubble && <ChatBubble text={chatBubble} />}
    </group>
  )
}
