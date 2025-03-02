import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ICSS/SPT 2025 タイムテーブル',
  description: 'ICSS/SPT 2025年研究会のタイムテーブル - セッションの選択と共有が簡単にできます',
  keywords: 'ICSS, SPT, 2025, タイムテーブル, 研究会, スケジュール, セッション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 