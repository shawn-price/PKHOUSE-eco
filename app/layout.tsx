import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'PKHOUSE ECO',
  description: 'Real Estate Ecosystem Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
