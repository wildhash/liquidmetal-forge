import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liquid Metal Forge - Self-Healing Dashboard',
  description: 'Real-time monitoring and visualization of autonomous self-healing system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
