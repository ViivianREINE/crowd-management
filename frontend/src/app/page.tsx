'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Shield, Activity, Zap, Eye, Mic, BarChart3, ArrowRight, ChevronRight } from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: 'Video Intelligence',
    desc: 'CNN+LSTM with MobileNetV2 transfer learning detects violence in real-time from surveillance feeds.',
    color: '#00d4ff',
  },
  {
    icon: Mic,
    title: 'Audio Analysis',
    desc: 'MFCC feature extraction + 1D CNN classifies panic, distress signals, and aggressive crowd sounds.',
    color: '#ff2d55',
  },
  {
    icon: Zap,
    title: 'Multimodal Fusion',
    desc: 'Late fusion algorithm combines video + audio probabilities: risk = 0.6·V + 0.4·A for accurate assessment.',
    color: '#ffb800',
  },
  {
    icon: Activity,
    title: 'Real-time Alerts',
    desc: 'Threshold-based alert engine triggers instant notifications for HIGH / MEDIUM risk events.',
    color: '#00e87a',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    desc: 'Real-time risk gauges, trend charts, and event logs for complete situational awareness.',
    color: '#a78bfa',
  },
  {
    icon: Shield,
    title: 'Edge Deployable',
    desc: 'Optimized for Raspberry Pi / Jetson Nano — low-latency, low cloud dependency.',
    color: '#f472b6',
  },
]

const teamMembers = [
  { usn: '1RV23AI085', name: 'Samruddhi D', dept: 'AI & ML' },
  { usn: '1RV23BT044', name: 'Priyam Parashar', dept: 'Biotech' },
  { usn: '1RV23CS134', name: 'Meghana D Hegde', dept: 'CS' },
  { usn: '1RV23EC128', name: 'Saloni Jadhav', dept: 'ECE' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-danger/5 blur-[80px]" />
        </div>

        {/* Floating rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-accent/10"
              style={{
                width: `${i * 200 + 200}px`,
                height: `${i * 200 + 200}px`,
                animation: `ring-pulse ${i * 2 + 2}s ease-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            <span className="text-xs font-mono text-accent tracking-widest">INTERDISCIPLINARY PROJECT · RV COLLEGE OF ENGINEERING</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-white">AI-POWERED</span>
            <br />
            <span className="text-accent text-glow-accent">CROWD PANIC</span>
            <br />
            <span className="text-white/70">DETECTION SYSTEM</span>
          </h1>

          <p className="text-muted text-sm md:text-base font-mono max-w-2xl mx-auto mb-10 leading-relaxed">
            Multimodal AI system combining computer vision & audio analysis to detect, predict, and alert on crowd violence — enabling rapid intervention before incidents escalate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="group flex items-center justify-center gap-2 bg-accent text-bg font-display text-xs font-bold tracking-widest px-8 py-4 rounded-lg hover:bg-accent/90 transition-all glow-accent"
            >
              ANALYZE NOW
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 glass border border-accent/20 text-accent font-mono text-xs tracking-widest px-8 py-4 rounded-lg hover:border-accent/40 transition-all"
            >
              LIVE DASHBOARD
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-xs font-mono tracking-widest mb-2">SYSTEM CAPABILITIES</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide">
            MULTIMODAL THREAT DETECTION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-6 hover:border-white/10 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: f.color + '15', border: `1px solid ${f.color}30` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-display text-sm font-bold tracking-wider text-white mb-2">{f.title}</h3>
              <p className="text-muted text-xs font-mono leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Pipeline */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-mono tracking-widest mb-2">SYSTEM ARCHITECTURE</p>
          <h2 className="font-display text-2xl font-bold text-white tracking-wide">PROCESSING PIPELINE</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2 items-center">
          {['INPUT', 'PREPROCESS', 'VIDEO MODEL', 'AUDIO MODEL', 'FUSION', 'RISK SCORE', 'ALERT', 'DASHBOARD'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="glass rounded-lg px-4 py-2 text-xs font-mono text-accent tracking-widest border-accent/20 hover:border-accent/40 transition-all">
                {step}
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted" />}
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border/50">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-mono tracking-widest mb-2">DEVELOPMENT TEAM</p>
          <h2 className="font-display text-xl font-bold text-white tracking-wide">RV COLLEGE OF ENGINEERING</h2>
          <p className="text-muted text-xs font-mono mt-2">Guide: Prof. Mithun T P</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {teamMembers.map(m => (
            <div key={m.usn} className="glass rounded-xl p-4 text-center hover:border-accent/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-display text-xs font-bold">{m.name[0]}</span>
              </div>
              <p className="text-white text-xs font-mono font-medium">{m.name}</p>
              <p className="text-muted text-xs font-mono mt-0.5">{m.dept}</p>
              <p className="text-accent/50 text-xs font-mono mt-1">{m.usn}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-6 text-center text-muted text-xs font-mono">
        © 2024 CrowdGuard AI · RV College of Engineering · Internal Guide: Prof. Mithun T P
      </footer>
    </div>
  )
}
