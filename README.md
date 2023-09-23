# neynar-next

Create Farcaster apps with Next.js and Neynar

### Features

This repo is a work in progress, use at your own risk! Currently, the following features are supported:

- [x] Sign in
- [ ] Read/write casts
- [ ] Search users
- [ ] Follow/unfollow
- [ ] Cast reactions

## Installation

```sh
npm install neynar-next viem
```

## Usage

Add the provider:

```tsx
// app/layout.tsx

import { PropsWithChildren } from 'react'
import { NeynarProvider } from 'neynar-next'

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
```

Add the API to your server:

```ts
// lib/neynar.ts

import NeynarClient from 'neynar-next/server'

const neynarClient = new NeynarClient(
  process.env.NEYNAR_API_KEY!,
  process.env.FARCASTER_FID!,
  process.env.FARCASTER_MNEMONIC!,
)

export default neynarClient
```

### `app` directory

```ts
// app/api/signer/route.ts

import { NextResponse } from 'next/server'
import { neynarClient } from '@/lib/neynar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const signerUuid = searchParams.get('signer_uuid')
  if (!signerUuid)
    return new Response('signer_uuid query param is required', { status: 400 })
  const signer = await neynarClient.getSigner(signerUuid)
  return NextResponse.json(signer)
}

export async function POST() {
  const signer = await neynarClient.createSigner()
  return NextResponse.json(signer)
}
```

### `pages` directory

```ts
// pages/api/signer.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { neynarClient } from '@/lib/neynar'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET': {
      const signer = await neynarClient.getSigner(req.query.signer_uuid)
      res.status(200).json(signer)
      break
    }
    case 'POST': {
      const signer = await neynarClient.createSigner()
      res.status(201).json(signer)
    }
    default:
      res.status(405).end()
  }
}
```

Then, use the hook in your app:

```tsx
'use client'

import { useCallback } from 'react'
import { useNeynar } from 'neynar-next'

export default function LoginButton() {
  const { signer, isLoading, signIn } = useNeynar()

  const handleClick = useCallback(() => void signIn(), [signIn])

  if (signer === null) return <button onClick={handleClick}>Sign In</button>
  if (isLoading || signer.status === 'pending_approval')
    return <button disabled>Loading</button>
  if (signer.status === 'approved')
    return <div>Signed in as FID {signer.fid}</div>
  if (signer.status === 'revoked')
    return <button onClick={handleClick}>Revoked. Sign In Again</button>

  // This should never happen, unless the server fails while registering the signer
  throw new Error(`Unknown signer status: ${signer.status}`)
}
```

## Configuration

TODO: customizing the api route
