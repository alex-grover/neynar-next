# neynar-next

Create Farcaster apps with Next.js and Neynar

### Features

This repo is a work in progress, use at your own risk! Currently, the following features are supported:

- [x] Sign in
- [x] Fetch feed
- [ ] Read/write casts
- [ ] Search users
- [ ] Follow/unfollow
- [ ] Cast reactions

## Installation

```sh
npm install neynar-next viem
```

## Usage

### Sign in

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

#### `app` directory

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

  // If you also want the user's username + profile, or you can fetch separately
  if (signer.status === 'approved') {
    const user = await neynarClient.getUserByFid(signer.fid)
    return NextResponse.json({ ...signer, user })
  }

  return NextResponse.json(signer)
}

export async function POST() {
  const signer = await neynarClient.createSigner()
  return NextResponse.json(signer)
}
```

#### `pages` directory

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

import { useSigner } from 'neynar-next'
import { useCallback } from 'react'

export default function LoginButton() {
  const { signer, isLoading, signIn } = useSigner()

  const handleClick = useCallback(() => void signIn(), [signIn])

  if (isLoading || signer?.status === 'pending_approval')
    return <button disabled>Loading</button> // TODO: display QR code
  if (signer === null) return <button onClick={handleClick}>Sign In</button>
  if (signer.status === 'approved')
    return <div>Signed in as FID {signer.fid}</div>
  if (signer.status === 'revoked')
    return <button onClick={handleClick}>Revoked. Sign In Again</button>

  // This should never happen, unless the server fails while registering the signer
  throw new Error(`Unknown signer status: ${signer.status}`)
}
```

### Fetch feed

Add the API to your server:

```ts
// app/api/casts/route.ts

import { NextResponse } from 'next/server'
import { neynarClient } from '@/lib/neynar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fid = parseInt(searchParams.get('fid'))
  if (!fid) return new Response('fid query param is required', { status: 400 })
  const feed = await neynarClient.getFollowingFeed(fid)
  return NextResponse.json(feed)
}
```

Then, hit the API from your client. This library is agnostic of your data fetching solution. The example uses [`swr`](https://swr.vercel.app), but you can use [`react-query`](https://tanstack.com/query/v3/) or plain `fetch` if you'd like.

```tsx
'use client'

import { useSigner } from 'neynar-next'
import { FeedResponse, Signer } from 'neynar-next/server'
import { useCallback } from 'react'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import LoadingSpinner from '@/components/loading-spinner'
import CastPage from './cast-page'
import styles from './casts.module.css'

export default function Casts() {
  const { signer, isLoading: signerLoading } = useSigner()
  const { data, isLoading, error, size, setSize } = useSWRInfinite<
    FeedResponse,
    string
  >(getKey(signer))

  const loadMore = useCallback(
    () => setSize((current) => current + 1),
    [setSize],
  )

  if (signerLoading)
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    )
  if (signer?.status !== 'approved') return 'Please sign in to view casts'

  return (
    <>
      {data?.map((page, index) =>
        page.casts.map((cast) => (
          <div key={cast.hash}>{/* render cast */}</div>
        )),
      )}
      {isLoading && (
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
      )}
      {error && <div className={styles.container}>{error}</div>}
      <button onClick={loadMore}>Load More</button>
    </>
  )
}

const API_URL = '/api/casts'

function getKey(signer: Signer | null): SWRInfiniteKeyLoader<FeedResponse> {
  return (pageIndex, previousPageData) => {
    if (signer?.status !== 'approved') return null
    const params = new URLSearchParams({ fid: signer.fid.toString() })

    if (pageIndex === 0) return `${API_URL}?${params.toString()}`

    if (previousPageData && !previousPageData.next.cursor) return null

    if (previousPageData?.next.cursor)
      params.set('cursor', previousPageData.next.cursor)
    return `${API_URL}?${params.toString()}`
  }
}
```

## Configuration

TODO: customizing the api route
