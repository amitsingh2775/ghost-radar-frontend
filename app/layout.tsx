import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  //  Branding updated to Ghost-Radar
  title: 'Ghost-Radar | Local Anonymous Stealth Chat',
  description: 'Connect with people nearby in Tech Parks, Colleges, or Concerts anonymously. No logs, no traces, ephemeral neural signals only.',
  
  //  Targeted Keywords for College, Office & Events
  keywords: [
 
  'anonymous chat room', 
  'private messaging app', 
  'self-destructing chat', 
  'nearby strangers chat', 
  'secret messaging platform', 
  'encrypted anonymous talk', 
  'burn after reading chat', 
  'no login chat app', 
  'location based chat rooms', 
  'proximity chat', 
  'anonymous community platform',
  'ghost messaging',
  'secure private chat',
  'disposable chat room'
],
  authors: [{ name: 'Amit Kumar' }],
  
  openGraph: {
    title: 'Ghost-Radar | Hyper-Local Neural Signals',
    description: 'Talk to nearby peers at colleges, tech hubs, or festivals. Anonymous and auto-destructing messages.',
    url: 'https://ghostradar.in',
    siteName: 'Ghost-Radar',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'Ghost-Radar Stealth Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Ghost-Radar | Anonymous Local Gossip & Networking',
    description: 'The ultimate stealth communication layer for your current location.',
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