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
  alternates: {
    canonical: '/',
  },
  
  // Title updated with Range and Security focus
  title: 'Ghost-Radar | Secure E2EE Local Anonymous Chat (500m-3km)',
  description: 'Ultra-secure, End-to-End Encrypted anonymous chat. Connect with people in a 500m to 3km radius. No logs, no traces, just ephemeral local signals.',
  
  keywords: [
    // Distance & Location Based
    '500m radius chat', '1km nearby chat', '3km range local talk', 'location based anonymous chat',
    'proximity chat rooms', 'hyperlocal stealth communication',
    
    // Security & Encryption
    'E2EE anonymous chat', 'end-to-end encrypted messaging', 'secure stealth channel', 
    'zero log private chat', 'encrypted local gossip', 'private communication channel',
    
    // Core Niche
    'anonymous chat room', 'self-destructing chat', 'nearby strangers chat', 
    'secret messaging platform', 'burn after reading chat', 'no login chat app', 
    'ghost messaging', 'stealth communication app'
  ],
  authors: [{ name: 'Amit Kumar' }],
  
  openGraph: {
    title: 'Ghost-Radar | Encrypted Local Neural Signals (Range: 3KM)',
    description: 'Secure E2EE communication within 500m to 3km. Anonymous talk for colleges and tech parks with no traces left behind.',
    url: 'https://ghostradar.in',
    siteName: 'Ghost-Radar',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'Ghost-Radar E2EE Stealth Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Ghost-Radar | Secure 3KM Range Anonymous Networking',
    description: 'The ultimate E2EE stealth communication layer for your local vicinity.',
    images: ['/og-image.png'],
  },

  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ghost-Radar',
  },

  icons: {
    icon: [
      { url: '/favicon.ico' }, 
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D', 
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body className="font-mono antialiased bg-[#0D0D0D] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  )
}