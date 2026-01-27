import '../styles/globals.scss'

export const metadata = {
  title: 'Live Patch - Collaborative Spreadsheet',
  description: 'Real-time collaborative spreadsheet application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
