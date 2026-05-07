const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface AnalysisResult {
  job_id: string
  violence_score: number
  panic_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number
  processing_time_ms: number
  alert_triggered: boolean
  details: Record<string, unknown>
}

export async function analyzeVideo(file: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/analyze/video`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function analyzeAudio(file: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/analyze/audio`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function analyzeMultimodal(video: File, audio: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('video', video)
  form.append('audio', audio)
  const res = await fetch(`${API_BASE}/analyze/multimodal`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function simulateDemo(): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/demo/simulate`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export function getRiskColor(level: string) {
  switch (level) {
    case 'HIGH': return '#ff2d55'
    case 'MEDIUM': return '#ffb800'
    default: return '#00e87a'
  }
}

export function getRiskClass(level: string) {
  switch (level) {
    case 'HIGH': return 'risk-high'
    case 'MEDIUM': return 'risk-medium'
    default: return 'risk-low'
  }
}

export function getRiskBgClass(level: string) {
  switch (level) {
    case 'HIGH': return 'risk-bg-high'
    case 'MEDIUM': return 'risk-bg-medium'
    default: return 'risk-bg-low'
  }
}
