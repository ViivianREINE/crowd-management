'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Info, CheckCircle, Bell, Volume2, VolumeX } from 'lucide-react'
import { AnalysisResult } from '@/lib/api'

interface Alert {
  id: string
  timestamp: Date
  level: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  violence_score: number
  panic_score: number
}

interface AlertPanelProps {
  latestResult?: AnalysisResult | null
}

function playAlertTone(level: string) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (level === 'HIGH') {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } else if (level === 'MEDIUM') {
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch (_) {}
}

export default function AlertPanel({ latestResult }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const prevJobId = useRef<string | null>(null)

  useEffect(() => {
    if (!latestResult) return
    if (latestResult.job_id === prevJobId.current) return
    prevJobId.current = latestResult.job_id

    const msgs: Record<string, string> = {
      HIGH: `⚠ CRITICAL: Violence ${(latestResult.violence_score * 100).toFixed(0)}% | Panic ${(latestResult.panic_score * 100).toFixed(0)}% — Immediate intervention required`,
      MEDIUM: `⚡ WARNING: Elevated risk detected — Violence ${(latestResult.violence_score * 100).toFixed(0)}% | Panic ${(latestResult.panic_score * 100).toFixed(0)}%`,
      LOW: `✓ CLEAR: No significant threat detected — All metrics within normal range`,
    }

    const newAlert: Alert = {
      id: latestResult.job_id,
      timestamp: new Date(),
      level: latestResult.risk_level,
      message: msgs[latestResult.risk_level],
      violence_score: latestResult.violence_score,
      panic_score: latestResult.panic_score,
    }

    setAlerts(prev => [newAlert, ...prev].slice(0, 20))

    if (soundEnabled && latestResult.risk_level !== 'LOW') {
      playAlertTone(latestResult.risk_level)
    }
  }, [latestResult, soundEnabled])

  const Icon = (level: string) => {
    if (level === 'HIGH') return <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
    if (level === 'MEDIUM') return <Info className="w-4 h-4 text-warn shrink-0" />
    return <CheckCircle className="w-4 h-4 text-safe shrink-0" />
  }

  return (
    <div className="glass rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <span className="font-display text-xs tracking-widest text-accent">ALERT LOG</span>
          {alerts.filter(a => a.level === 'HIGH').length > 0 && (
            <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full font-mono animate-pulse">
              {alerts.filter(a => a.level === 'HIGH').length}
            </span>
          )}
        </div>
        <button
          onClick={() => setSoundEnabled(p => !p)}
          className="text-muted hover:text-white transition-colors p-1 rounded"
          title={soundEnabled ? 'Mute alerts' : 'Enable alert sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted text-xs font-mono tracking-wider">NO ALERTS · MONITORING ACTIVE</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-lg p-3 border text-xs font-mono flex gap-3 items-start transition-all
                ${alert.level === 'HIGH' ? 'risk-bg-high' :
                  alert.level === 'MEDIUM' ? 'risk-bg-medium' :
                  'risk-bg-low'}`}
            >
              {Icon(alert.level)}
              <div className="flex-1 min-w-0">
                <p className={`font-medium leading-snug ${
                  alert.level === 'HIGH' ? 'text-danger' :
                  alert.level === 'MEDIUM' ? 'text-warn' : 'text-safe'
                }`}>
                  {alert.message}
                </p>
                <p className="text-muted mt-1 tracking-wider">
                  {alert.timestamp.toLocaleTimeString()} · ID: {alert.id.slice(0, 8)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
