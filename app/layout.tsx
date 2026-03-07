import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ghostradar.in'),
  alternates: { canonical: '/' },
  title: 'Ghost-Radar | Local Anonymous Chat & Nearby Strangers Chat (3KM Range)',
  description: 'Connect with people nearby anonymously. Ghost-Radar is a secure local chat app for colleges and tech parks. Bina identity bataye aas-pass ke logo se chat karein.',
  keywords: ['nearby chat', 'anonymous chat with strangers', 'local chat room', '3km radius chat', 'aas pass ke logo se chat', 'ghost radar chat', 'stealth messaging'],
  authors: [{ name: 'Amit Kumar' }],
  openGraph: {
    title: 'Ghost-Radar | Secure 3KM Range Anonymous Networking',
    description: 'Talk to people around you without revealing your identity. No logs, no traces, 100% private.',
    url: 'https://ghostradar.in',
    siteName: 'Ghost-Radar',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D', 
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geistMono.variable}>
      <head>
        {/* Google Trust Schema - Essential for SEO Authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Ghost-Radar",
              "url": "https://ghostradar.in",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "All",
              "description": "Secure local anonymous chat application for proximity-based networking within a 3km radius.",
              "author": { "@type": "Person", "name": "Amit Kumar" }
            }),
          }}
        />
      </head>
      <body className="font-mono antialiased bg-[#0D0D0D] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  )
}