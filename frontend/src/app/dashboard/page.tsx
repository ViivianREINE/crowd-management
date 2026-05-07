'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import RiskGauge from '@/components/RiskGauge'
import AlertPanel from '@/components/AlertPanel'
import { simulateDemo, AnalysisResult, getRiskColor } from '@/lib/api'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  Activity, Shield, AlertTriangle, TrendingUp,
  Radio, Cpu, Clock, CheckCircle, Pause, Play
} from 'lucide-react'

interface DataPoint {
  time: string
  violence: number
  panic: number
  fused: number
  risk: string
}

const MAX_POINTS = 40

export default function Dashboard() {
  const [data, setData] = useState<DataPoint[]>([])
  const [latest, setLatest] = useState<AnalysisResult | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPoint = async () => {
    try {
      const r = await simulateDemo()
      const t = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const pt: DataPoint = {
        time: t,
        violence: Math.round(r.violence_score * 100),
        panic: Math.round(r.panic_score * 100),
        fused: Math.round((0.6 * r.violence_score + 0.4 * r.panic_score) * 100),
        risk: r.risk_level,
      }
      setData(prev => [...prev, pt].slice(-MAX_POINTS))
      setLatest(r)
      setStats(prev => ({
        total: prev.total + 1,
        high: prev.high + (r.risk_level === 'HIGH' ? 1 : 0),
        medium: prev.medium + (r.risk_level === 'MEDIUM' ? 1 : 0),
        low: prev.low + (r.risk_level === 'LOW' ? 1 : 0),
      }))
    } catch (_) {}
  }

  useEffect(() => {
    fetchPoint()
    if (isLive) {
      intervalRef.current = setInterval(fetchPoint, 3000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isLive])

  const toggleLive = () => {
    setIsLive(p => {
      if (p && intervalRef.current) clearInterval(intervalRef.current)
      if (!p) intervalRef.current = setInterval(fetchPoint, 3000)
      return !p
    })
  }

  const statCards = [
    { label: 'TOTAL SCANS', value: stats.total, icon: Cpu, color: '#00d4ff' },
    { label: 'HIGH RISK', value: stats.high, icon: AlertTriangle, color: '#ff2d55' },
    { label: 'MEDIUM RISK', value: stats.medium, icon: TrendingUp, color: '#ffb800' },
    { label: 'CLEAR', value: stats.low, icon: CheckCircle, color: '#00e87a' },
  ]

  const chartTooltipStyle = {
    background: '#0d1117',
    border: '1px solid #1f2937',
    borderRadius: 8,
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#e2e8f0',
  }

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-accent text-xs font-mono tracking-widest mb-1">MONITORING CENTER</p>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">LIVE DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-mono tracking-wider
              ${isLive ? 'bg-safe/10 border-safe/30 text-safe' : 'bg-muted/10 border-border text-muted'}`}>
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'LIVE' : 'PAUSED'}
            </div>
            <button
              onClick={toggleLive}
              className="glass border border-border/50 hover:border-accent/30 text-muted hover:text-white p-2 rounded-lg transition-all"
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="glass rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: s.color + '15', border: `1px solid ${s.color}30` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-muted text-xs font-mono tracking-widest">{s.label}</p>
                <p className="font-display text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gauges */}
          <div className="glass rounded-xl p-6 flex flex-col items-center justify-center gap-6">
            <p className="text-muted text-xs font-mono tracking-widest self-start">CURRENT RISK</p>
            <div className="flex flex-wrap gap-6 justify-center">
              <RiskGauge
                score={latest?.violence_score ?? 0}
                label="Violence"
                riskLevel={latest?.risk_level ?? 'LOW'}
                size={150}
              />
              <RiskGauge
                score={latest?.panic_score ?? 0}
                label="Panic"
                riskLevel={latest?.risk_level ?? 'LOW'}
                size={150}
              />
            </div>
            <div className={`w-full py-2 rounded-lg border text-center font-display text-sm font-bold tracking-widest
              ${latest?.risk_level === 'HIGH' ? 'risk-bg-high risk-high' :
                latest?.risk_level === 'MEDIUM' ? 'risk-bg-medium risk-medium' :
                'risk-bg-low risk-low'}`}>
              {latest?.risk_level ?? 'NOMINAL'} RISK
            </div>
          </div>

          {/* Area chart */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <p className="text-muted text-xs font-mono tracking-widest mb-4">THREAT SCORE TIMELINE</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="violenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff2d55" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="panicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Area type="monotone" dataKey="violence" stroke="#ff2d55" fill="url(#violenceGrad)" strokeWidth={2} dot={false} name="Violence" />
                <Area type="monotone" dataKey="panic" stroke="#00d4ff" fill="url(#panicGrad)" strokeWidth={2} dot={false} name="Panic" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-danger" /><span className="text-xs font-mono text-muted">Violence</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-accent" /><span className="text-xs font-mono text-muted">Panic</span></div>
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Fused score bar chart */}
          <div className="glass rounded-xl p-6">
            <p className="text-muted text-xs font-mono tracking-widest mb-4">FUSED RISK SCORE (LAST 20)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Bar
                  dataKey="fused"
                  name="Fused Score"
                  radius={[3, 3, 0, 0]}
                  fill="#00d4ff"
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alert panel */}
          <div className="h-64 lg:h-auto">
            <AlertPanel latestResult={latest} />
          </div>
        </div>

        {/* System info */}
        <div className="glass rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'FUSION WEIGHTS', value: 'V:0.6 / A:0.4' },
            { label: 'HIGH THRESHOLD', value: '≥ 70%' },
            { label: 'MEDIUM THRESHOLD', value: '≥ 40%' },
            { label: 'UPDATE INTERVAL', value: '3s' },
          ].map(i => (
            <div key={i.label} className="text-center">
              <p className="text-muted text-xs font-mono tracking-widest">{i.label}</p>
              <p className="text-accent font-mono text-sm mt-1">{i.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
