export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased scroll-smooth" style={{ colorScheme: 'dark' }}>
      <body className="bg-slate-950 min-h-screen font-sans selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  )
}