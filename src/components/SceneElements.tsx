'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function OfficeFloor() {
  const gridRef = useRef<THREE.GridHelper>(null!)
  useFrame((state) => {
    if (gridRef.current) {
      const m = gridRef.current.material as THREE.LineBasicMaterial
      m.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03
    }
  })
  return (
    <group>
      <gridHelper ref={gridRef} args={[60, 60, '#112233', '#0a1a2a']} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#050510" metalness={0.8} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Starfield({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) + 10
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      const t = Math.random()
      col[i * 3] = 0.3 + t * 0.5
      col[i * 3 + 1] = 0.4 + t * 0.4
      col[i * 3 + 2] = 0.8 + t * 0.2
    }
    return { positions: pos, colors: col }
  }, [count])
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

export function DataFlow({ from, to, color, active }: { from: [number,number,number]; to: [number,number,number]; color: string; active: boolean }) {
  const ref = useRef<THREE.Points>(null!)
  const count = 18
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  useFrame((state) => {
    if (!ref.current || !active) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const p = ((i / count + t * 0.4) % 1)
      positions[i * 3] = from[0] + (to[0] - from[0]) * p
      positions[i * 3 + 1] = from[1] + (to[1] - from[1]) * p + Math.sin(p * Math.PI) * 0.8
      positions[i * 3 + 2] = from[2] + (to[2] - from[2]) * p
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  if (!active) return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.14} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

export function CentralHUD() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2
    }
  })
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ref} position={[0, 0.3, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={0.6} transparent opacity={0.35} wireframe />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.1, 0.015, 4, 48]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function ConnLine({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const geo = new THREE.BufferGeometry().setFromPoints([from, to])
  return (
    // @ts-expect-error R3F extends JSX with Three.js primitives
    <line geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.06} />
    </line>
  )
}

export function ConnectionLines({ agents }: { agents: { pos: [number,number,number]; color: string }[] }) {
  const center = new THREE.Vector3(0, 0.5, 0)
  return (
    <>
      {agents.map((a, i) => {
        if (a.pos[0] === 0 && a.pos[2] === 0) return null
        return <ConnLine key={i} from={center} to={new THREE.Vector3(a.pos[0], 0.5, a.pos[2])} color={a.color} />
      })}
    </>
  )
}
