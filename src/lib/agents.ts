export const SWARMCLAW_URL = process.env.NEXT_PUBLIC_SWARMCLAW_URL ?? 'https://mavado-mavado-swarmclaw.hf.space'
export type AgentStatus = 'active' | 'idle' | 'thinking' | 'error' | 'offline'
export interface AgentDef { id: string; role: string; dept: string; color: string; emissive: string; pos: [number,number,number]; boss: boolean; tagline: string }
const R = 7.8
const hex = (i: number): [number,number,number] => [R*Math.sin(i*Math.PI/3), 0, -R*Math.cos(i*Math.PI/3)]
export const CSUITE: AgentDef[] = [
  { id:'GODFATHER', role:'CEO', dept:'Command', color:'#FFD700', emissive:'#FF8C00', pos:[0,0,0], boss:true, tagline:'Final Authority · Strategic Command' },
  { id:'ARCHITECT', role:'CTO', dept:'Engineering', color:'#00C8FF', emissive:'#0066FF', pos:hex(0), boss:false, tagline:'Technical Lead · System Architecture' },
  { id:'VAULT', role:'CFO', dept:'Finance', color:'#00FF99', emissive:'#00AA44', pos:hex(1), boss:false, tagline:'Financial Controller · Zero Cost' },
  { id:'HERALD', role:'CMO', dept:'Marketing', color:'#FF69B4', emissive:'#CC0066', pos:hex(2), boss:false, tagline:'Brand Voice · Content Engine' },
  { id:'CONDUCTOR', role:'COO', dept:'Operations', color:'#FF8C00', emissive:'#CC4400', pos:hex(3), boss:false, tagline:'Workflow Master · Process Optimizer' },
  { id:'HUNTER', role:'CRO', dept:'Revenue', color:'#AA44FF', emissive:'#6600CC', pos:hex(4), boss:false, tagline:'Lead Generation · Deal Tracker' },
  { id:'GUARDIAN', role:'CISO', dept:'Security', color:'#FF3333', emissive:'#AA0000', pos:hex(5), boss:false, tagline:'Threat Monitor · Access Control' },
]
export const STATUS_COLORS: Record<AgentStatus,string> = { active:'#00FF99', idle:'#556677', thinking:'#FFD700', error:'#FF2222', offline:'#222233' }
export interface ChatMessage { role:'user'|'assistant'|'system'; content:string }
export interface ChatResponse { response?:string; content?:string; agent?:string; provider?:string; tokens?:number; error?:string }
export async function fetchHealth() {
  const r = await fetch(`${SWARMCLAW_URL}/health`, { cache:'no-store' })
  if (!r.ok) throw new Error(`Health check failed: ${r.status}`)
  return r.json()
}
export async function chat(agentName: string, messages: ChatMessage[], signal?: AbortSignal): Promise<ChatResponse> {
  const r = await fetch(`${SWARMCLAW_URL}/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, signal, body: JSON.stringify({ agent_name:agentName, messages, max_tokens:700, temperature:0.85 }) })
  if (!r.ok) { const e = await r.text().catch(()=>`HTTP ${r.status}`); throw new Error(e) }
  return r.json()
}
export function extractReply(data: ChatResponse): string {
  return data.response ?? data.content ?? (data as any).message ?? (data as any).text ?? JSON.stringify(data)
}
