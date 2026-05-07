'use client'

import { useEffect, useRef } from 'react'
import { getRiskColor } from '@/lib/api'

interface GaugeProps {
  score: number        // 0–1
  label: string
  riskLevel: string
  size?: number
}

export default function RiskGauge({ score, label, riskLevel, size = 180 }: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const currentScore = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38
    const lineW = size * 0.07
    const target = score

    const draw = (val: number) => {
      ctx.clearRect(0, 0, size, size)

      // Background arc
      ctx.beginPath()
      ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = lineW
      ctx.lineCap = 'round'
      ctx.stroke()

      // Color zones
      const zones = [
        { from: Math.PI * 0.75, to: Math.PI * 1.25, color: '#00e87a22' },
        { from: Math.PI * 1.25, to: Math.PI * 1.75, color: '#ffb80022' },
        { from: Math.PI * 1.75, to: Math.PI * 2.25, color: '#ff2d5522' },
      ]
      zones.forEach(z => {
        ctx.beginPath()
        ctx.arc(cx, cy, r, z.from, z.to)
        ctx.strokeStyle = z.color
        ctx.lineWidth = lineW
        ctx.stroke()
      })

      // Value arc
      const end = Math.PI * 0.75 + val * Math.PI * 1.5
      const color = getRiskColor(riskLevel)
      const grad = ctx.createLinearGradient(0, 0, size, size)
      grad.addColorStop(0, color + '88')
      grad.addColorStop(1, color)
      ctx.beginPath()
      ctx.arc(cx, cy, r, Math.PI * 0.75, end)
      ctx.strokeStyle = grad
      ctx.lineWidth = lineW
      ctx.lineCap = 'round'
      ctx.stroke()

      // Glow
      ctx.shadowBlur = 16
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(cx, cy, r, Math.PI * 0.75, end)
      ctx.strokeStyle = color + '55'
      ctx.lineWidth = lineW * 2
      ctx.stroke()
      ctx.shadowBlur = 0

      // Needle
      const angle = Math.PI * 0.75 + val * Math.PI * 1.5
      const nx = cx + (r - lineW) * Math.cos(angle)
      const ny = cy + (r - lineW) * Math.sin(angle)
      ctx.beginPath()
      ctx.arc(nx, ny, lineW * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.shadowBlur = 12
      ctx.shadowColor = color
      ctx.fill()
      ctx.shadowBlur = 0

      // Center value
      ctx.font = `bold ${size * 0.18}px 'Orbitron', sans-serif`
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(val * 100)}%`, cx, cy)

      // Label
      ctx.font = `${size * 0.065}px 'JetBrains Mono', monospace`
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillText(label.toUpperCase(), cx, cy + size * 0.14)
    }

    const animate = () => {
      if (Math.abs(currentScore.current - target) > 0.002) {
        currentScore.current += (target - currentScore.current) * 0.06
        draw(currentScore.current)
        animRef.current = requestAnimationFrame(animate)
      } else {
        currentScore.current = target
        draw(target)
      }
    }

    cancelAnimationFrame(animRef.current)
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [score, riskLevel, label, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} width={size} height={size} />
      <div
        className={`px-3 py-1 rounded-full border text-xs font-mono tracking-widest font-bold
          ${riskLevel === 'HIGH' ? 'risk-bg-high risk-high' :
            riskLevel === 'MEDIUM' ? 'risk-bg-medium risk-medium' :
            'risk-bg-low risk-low'}`}
      >
        {riskLevel}
      </div>
    </div>
  )
}
