'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { CSUITE, type AgentStatus } from '@/lib/agents'
import { AgentPod } from './AgentPod'
import { OfficeFloor, Starfield, DataFlow, CentralHUD, ConnectionLines } from './SceneElements'

interface SceneProps {
  statuses: Record<string, AgentStatus>
  selectedAgent: string | null
  talkingAgent: string | null
  chatBubble: string | null
  onSelectAgent: (id: string) => void
}

function CameraController({ targetAgent }: { targetAgent: string | null }) {
  const { camera } = useThree()
  const frameRef = useRef(0)
  useEffect(() => {
    if (!targetAgent) {
      const pos = new THREE.Vector3(0, 16, 20)
      let f = 0
      const animate = () => { f++; camera.position.lerp(pos, 0.04); if (f < 120) frameRef.current = requestAnimationFrame(animate) }
      frameRef.current = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(frameRef.current)
    }
    const agent = CSUITE.find((a) => a.id === targetAgent)
    if (!agent) return
    const targetPos = new THREE.Vector3(agent.pos[0] * 0.5, agent.boss ? 10 : 9, agent.pos[2] + 10)
    let f = 0
    const animate = () => { f++; camera.position.lerp(targetPos, 0.05); if (f < 100) frameRef.current = requestAnimationFrame(animate) }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [targetAgent, camera])
  return null
}

function SceneInner({ statuses, selectedAgent, talkingAgent, chatBubble, onSelectAgent }: SceneProps) {
  return (
    <>
      <CameraController targetAgent={selectedAgent} />
      <ambientLight intensity={0.15} color="#1a1a3a" />
      <pointLight position={[0, 8, 0]} intensity={1.2} color="#4488ff" distance={25} />
      <pointLight position={[8, 4, 8]} intensity={0.4} color="#224488" distance={20} />
      <pointLight position={[-8, 4, -8]} intensity={0.4} color="#442288" distance={20} />
      <hemisphereLight args={['#0a0a2a', '#000000', 0.3]} />
      <fog attach="fog" args={['#050510', 30, 80]} />
      <color attach="background" args={['#050510']} />
      <Starfield count={1400} />
      <OfficeFloor />
      <ConnectionLines agents={CSUITE.map((a) => ({ pos: a.pos, color: a.color }))} />
      {CSUITE.map((agent) => {
        if (agent.id === 'GODFATHER') return null
        const st = statuses[agent.id] ?? 'idle'
        return <DataFlow key={`flow-${agent.id}`} from={agent.pos} to={[0, 0, 0]} color={agent.color} active={st === 'active' || st === 'thinking'} />
      })}
      <CentralHUD />
      {CSUITE.map((agent) => (
        <AgentPod key={agent.id} agent={agent} status={statuses[agent.id] ?? 'idle'} selected={selectedAgent === agent.id} talking={talkingAgent === agent.id} onSelect={() => onSelectAgent(agent.id)} chatBubble={talkingAgent === agent.id ? chatBubble : null} />
      ))}
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.4} intensity={1.6} blendFunction={BlendFunction.ADD} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0003, 0.0003)} radialModulation={false} modulationOffset={1} />
        <Vignette eskil={false} offset={0.35} darkness={0.7} />
      </EffectComposer>
      <OrbitControls enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.2} minDistance={6} maxDistance={38} makeDefault />
    </>
  )
}

export function GodFatherCanvas(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 16, 22], fov: 50, near: 0.1, far: 200 }} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1, outputColorSpace: THREE.SRGBColorSpace }} style={{ background: '#050510' }}>
      <SceneInner {...props} />
    </Canvas>
  )
}
