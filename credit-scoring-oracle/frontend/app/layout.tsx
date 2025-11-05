// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/features/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Credit Scoring Oracle | Somnia',
  description: 'ML-powered credit scoring oracle for DeFi on Somnia blockchain',
  keywords: ['credit scoring', 'DeFi', 'blockchain', 'Somnia', 'oracle'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pb-20">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600">
                <p>© 2024 Credit Scoring Oracle. Built for Somnia AI Hackathon.</p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://somnia-dream.socialscan.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Block Explorer
                  </a>
                  <a 
                    href="https://faucet.somnia.network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Faucet
                  </a>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Live on Somnia
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}