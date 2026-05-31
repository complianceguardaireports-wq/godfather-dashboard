import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'THE GODFATHER PROTOCOL',
  description: '106-Agent Autonomous AI Company Command Center',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#050510', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
