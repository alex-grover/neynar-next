# neynar-next

Create Farcaster apps with Neynar. Built with Next.js in mind, but works with any React client and JavaScript server.

### Features

This repo is a work in progress, use at your own risk! Currently, the following features are supported:

- [x] Sign in
- [x] Get user profile by FID
- [x] Fetch feed by following/channel/FID list
- [x] Cast reactions (like/unlike/recast/unrecast)
- [ ] Read/write casts
- [ ] Search users
- [ ] Follow/unfollow

## Installation

```sh
npm install neynar-next viem
```

## Usage

<details>
<summary>Sign in</summary>

Add the provider:

```tsx
// app/layout.tsx - similar implementation for pages/_app.tsx

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

Set up the client and add the API to your server:

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

The client passes a query param of `?signer_uuid=XXX` and expects a Signer object back from the server.

<details>
<summary>`app` directory</summary>

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

</details>

<details>
<summary>`pages` directory</summary>

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

</details>

It's possible to change the API path via the `NeynarProvider` `api` prop, if desired:

<details>
<summary>Customize API path</summary>

```tsx
// app/layout.tsx

import { PropsWithChildren } from 'react'
import { NeynarProvider } from 'neynar-next'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head />
      <body>
        <NeynarProvider api="/api/neynar/signer">{children}</NeynarProvider>
      </body>
    </html>
  )
}
```

</details>

Then, use the hook in your app:

```tsx
'use client'

import { useSigner } from 'neynar-next'
import { useCallback } from 'react'

export default function LoginButton() {
  const { signer, isLoading, signIn } = useSigner()

  const handleClick = useCallback(() => void signIn(), [signIn])

  switch (signer?.status) {
    case undefined:
      return <button onClick={handleClick}>Sign In</button>
    case 'generated':
      // This should never happen, unless the server fails while registering the signer
      throw new Error('Unregistered signer')
    case 'pending_approval':
      return (
        <>
          {/* See below */}
          <QRCodeModal signer={signer} />
          <button disabled>Loading</button>
        </>
      )
    case 'approved':
      return <div>{data?.username}</div>
    case 'revoked':
      return <button onClick={handleClick}>Revoked. Sign In Again</button>
  }
}
```

After the user clicks the sign in button, you'll need to render a QR code so they can add the signer from the Warpcast mobile app. You can do this with a package like [`react-qr-code`](https://github.com/rosskhanas/react-qr-code):

```tsx
'use client'

import { useSigner } from 'neynar-next'
import QRCode from 'react-qr-code'

export default function QRCodeModal() {
  const { signer } = useSigner()

  if (signer?.status !== 'pending_approval') return null

  return (
    <div className="modal">
      <QRCode value={signer.signer_approval_url} />
    </div>
  )
}
```

</details>

<details>
<summary>Fetch user</summary>

After signing in, you'll likely want to fetch the user's profile so you can display their username and avatar. To do this, we need to create an API route and then fetch the user from the client:

```ts
type Props = {
  params: {
    fid: string
  }
}

export async function GET(request: Request, { params }: Props) {
  const fid = parseInt(params.fid)
  if (!fid) return new Response('fid is invalid', { status: 400 })

  // You can pass an optional viewer FID to get back the mutual following status as well, for example to display on another user's profile page
  // const { searchParams } = new URL(request.url)
  // const viewer = searchParams.get('viewer')

  const user = await neynarClient.getUserByFid(fid /*, viewer */)
  return NextResponse.json(signer)
}
```

This library is agnostic of your client data fetching solution. The example uses [`swr`](https://swr.vercel.app), but you can use [`react-query`](https://tanstack.com/query/v3/) or plain `fetch` if you'd like.

```tsx
'use client'

import { type User } from 'neynar-next/server'
import useSWRImmutable from 'swr/immutable'

export default function UserProfile() {
  const { signer } = useSigner()

  const { data } = useSWRImmutable<User, string>(
    signer?.status === 'approved' ? `/api/users/${signer.fid}` : null,
  )

  if (!data) return null

  return <div>{data.username}</div>
}
```

</details>

<details>
<summary>Fetch feed for user/channel/list of users</summary>

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
  // Or you can get the feed for a channel/specific list of users:
  // const feed = await neynarClient.getChannelFeed(fid)
  // const feed = await neynarClient.getFeedForFids([10259]) // There seems to be a bug on the Neynar end where this fails with more than 1 FID
  return NextResponse.json(feed)
}
```

Then, hit the API from your client:

```tsx
'use client'

import { useSigner } from 'neynar-next'
import { FeedResponse, Signer } from 'neynar-next/server'
import { useCallback } from 'react'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'

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

  if (signerLoading) return 'Loading'
  if (signer?.status !== 'approved') return 'Please sign in to view casts'

  return (
    <>
      {data?.map((page, index) =>
        page.casts.map((cast) => (
          <div key={cast.hash}>{/* render cast */}</div>
        )),
      )}
      {isLoading && 'Loading'}
      {error && <div>{error}</div>}
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

</details>

<details>
<summary>React to cast (like, unlike, recast, undo recast)</summary>

Add the API to your server:

```ts
// app/api/casts/[hash]/{like,recast}/route.ts

import { NextResponse } from 'next/server'
import neynarClient from '@/lib/neynar'

type Props = {
  params: {
    hash: string
  }
}

export async function POST(request: Request, { params }: Props) {
  const searchParams = new URLSearchParams(request.url)
  await neynarClient.likeCast(searchParams.get('signerUuid'), params.hash)
  // await neynarClient.recastCast(searchParams.get('signerUuid'), params.hash)
  return NextResponse.json({}, { status: 201 })
}

export async function DELETE(request: Request, { params }: Props) {
  const searchParams = new URLSearchParams(request.url)
  await neynarClient.unlikeCast(searchParams.get('signerUuid'), params.hash)
  // await neynarClient.unrecastCast(searchParams.get('signerUuid'), params.hash)
  return NextResponse.json({}, { status: 204 })
}
```

Then, hit the API from your client:

```tsx
'use client'

import { useSigner } from 'neynar-next'

type LikeButtonProps = {
  cast: {
    hash: string
  }
}

export default function LikeButton({ cast }: LikeButtonProps) {
  const { signer } = useSigner()

  return (
    <button
      disabled={signer?.status !== 'approved' || isMutating}
      onClick={() =>
        fetch(`/api/casts/${cast.hash}/like?signerUuid=${signer.signer_uuid}`, {
          method: 'POST',
        })
      }
    >
      Like
    </button>
  )
}
```

</details>
