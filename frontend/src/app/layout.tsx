import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrowdGuard AI — Predictive Crowd Panic Detection',
  description: 'AI-Powered Predictive Crowd Panic Detection & Containment System — RV College of Engineering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="scanlines grid-bg min-h-screen">
        {children}
      </body>
    </html>
  )
}
