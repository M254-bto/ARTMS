import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KeyNest — Property Management Without the Chaos',
  description:
    'Track tenants, monitor rent payments, manage maintenance requests, and gain complete visibility into your properties from one simple platform.',
  keywords: 'property management, tenant management, rent tracking, maintenance, landlord software, Kenya',
  openGraph: {
    title: 'KeyNest — Property Management Without the Chaos',
    description: 'One platform for tenants, rent, and maintenance.',
    type: 'website',
  },
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
