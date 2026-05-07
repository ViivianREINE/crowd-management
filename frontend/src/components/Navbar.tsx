'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Activity, Upload, LayoutDashboard } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: Shield },
  { href: '/upload', label: 'Analyze', icon: Upload },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Navbar() {
  const path = usePathname()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center glow-accent">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <span className="font-display text-sm font-bold text-accent tracking-widest text-glow-accent">
            CROWDGUARD<span className="text-white/40">·AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200
                ${path === href
                  ? 'bg-accent/10 text-accent border border-accent/30 glow-accent'
                  : 'text-muted hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-safe animate-pulse" />
          <span className="text-xs text-safe font-mono tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  )
}
