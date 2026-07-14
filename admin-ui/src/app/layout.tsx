import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SheGymZ Admin',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
}

const themeScript = `
  try {
    if (localStorage.getItem('shegymz-admin-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-zinc-50 text-zinc-900 antialiased transition-colors dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  )
}
