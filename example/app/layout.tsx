import { NeynarProvider } from 'neynar-next'
import { PropsWithChildren } from 'react'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head />
      <body>
        <NeynarProvider>{children}</NeynarProvider>
      </body>
    </html>
  )
}
