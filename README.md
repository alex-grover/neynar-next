# 🪐 neynar-next [![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/alex-grover/neynar-next/ci.yml?branch=main)](https://github.com/alex-grover/neynar-next/actions/workflows/ci.yml?query=branch%3Amain) [![npm](https://img.shields.io/npm/v/neynar-next)](https://www.npmjs.com/package/neynar-next)

> [!IMPORTANT]  
> This project has been superseded by the official [Neynar Node.js SDK](https://github.com/neynarxyz/nodejs-sdk). It's suggested to use that going forward. Please get in touch if you need help migrating!

Create Farcaster apps with Neynar. Built with Next.js in mind, but works with any React client and JavaScript server.

**NOTE**: The approach to signers used below results in a new signer being created per app, as the signers are stored in the user's localStorage. This requires users to pay to register each device separately. It's possible to mitigate this issue by having the user authenticate separately (i.e. with SIWE) and then persisting the signer UUID and user ID in your backend so other clients can reuse it. I'm currently exploring how that approach could be incorporated into this library in the future.

### Features

This repo is a work in progress, use at your own risk! Currently, the following features are supported:

- [x] Sign in
- [x] Get user profile by FID or username
- [x] Fetch feed by following/channel/FID list
- [x] Get cast and thread
- [x] Post casts
- [x] Cast reactions (like/unlike/recast/unrecast)
- [x] Get notifications (mentions and replies)
- [ ] Search users
- [ ] Follow/unfollow

## Installation

### Quick Start

To quickly scaffold a project with a simple feed and cast posting functionality:

```shell
npx degit alex-grover/neynar-next/example my-farcaster-app
```

All you need to do is add your FID, Farcaster mnemonic, and Neynar API key to the project's .env and you'll be up and running!

### Manual Installation

```sh
npm install neynar-next viem
```

## Usage

This library has 2 parts: a client-side context/provider to manage the signer, and a server class that simplifies making requests to Neynar.

It's necessary to run Neynar API requests through your own server in order to keep your API key secret. However, beyond proxying requests from your frontend, the server implementation is quite lightweight. It's designed to be compatible with the Next.js Edge runtime to minimize any latency to the user.

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
  BigInt(process.env.FARCASTER_FID!),
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

export const runtime = 'edge'

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

  if (isLoading) return 'Loading...'

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
      return <div>Signed in as FID {signer?.fid}</div>
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
// app/api/users/[fid]/route.ts

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
  // Or fetch by username
  // await neynarClient.getUserByUsername('alexgrover.eth' /*, viewer */)
  return NextResponse.json(user)
}
```

This library is agnostic of your client data fetching solution. The example uses [`swr`](https://swr.vercel.app), but you can use [`react-query`](https://tanstack.com/query/v3/) or plain `fetch` if you'd like.

```tsx
'use client'

import { useSigner } from 'neynar-next'
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
<summary>Get cast or thread</summary>

Add the API to your server:

```ts
// app/api/casts/[hash]/route.ts

type Props = {
  params: {
    hash: string
  }
}

export async function GET(request: Request, { params }: Props) {
  const hash = params.hash
  if (!hash || !hash.startsWith('0x'))
    return new Response('hash is invalid', { status: 400 })

  const { cast } = await neynarClient.getCast('hash', hash)
  // Or fetch by url
  // await neynarClient.getCast('url', 'https://warpcast.com/...')

  // Or fetch thread
  // You can pass an optional viewer FID to get back whether that FID has reacted to the cast already
  // const { searchParams } = new URL(request.url)
  // const viewer = searchParams.get('viewer')
  // await neynarClient.getCastsInThread('0x...' /* , { viewer } */)
  return NextResponse.json(cast)
}
```

Then, hit the API from your client:

```tsx
'use client'

import { type Cast } from 'neynar-next/server'
import useSWR from 'swr'

export default function CastDetailPage() {
  const { data } = useSWR<Cast, string>(`/api/casts/0x...`)

  if (!data) return null

  return <div>{data.text}</div>
}
```

</details>

<details>
<summary>Post or delete a cast</summary>

Add the API to your server:

```ts
// app/api/casts/route.ts

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!searchParams.get('signerUuid'))
    return new Response('signerUuid query param is required', { status: 400 })

  const data = Object.fromEntries((await request.formData()).entries())
  if (!data.text) const { signerUuid, text } = parseResult.data
  await neynarClient.postCast(
    signerUuid,
    text,
    // { embeds: [{ url: '' }], parent: '' }
  )

  return NextResponse.json({}, { status: 201 })
}

// To delete a cast, use the same approach with `neynarClient.deleteCast(signerUuid, castHash)`
```

Then, hit the API from your client:

```tsx
'use client'

import { useSigner } from 'neynar-next'

export default function CastForm() {
  const { signer } = useSigner()

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (signer?.status !== 'approved') return

      const params = new URLSearchParams({ signerUuid: arg.signer.signer_uuid })
      void fetch(`/api/casts?${params.toString()}`, {
        method: 'POST',
        body: new FormData(event.currentTarget),
      })
    },
    [signer, trigger],
  )

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="text" />
      <button type="submit">Post</button>
    </form>
  )
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

<details>
<summary>Get notifications (mentions and replies)</summary>

Add the API to your server:

```ts
// app/api/users/[fid]/notifications/route.ts
type Props = {
  params: {
    fid: string
  }
}

export async function GET(request: Request, { params }: Props) {
  const fid = parseInt(params.fid)
  if (!fid) return new Response('fid is invalid', { status: 400 })

  // Optional viewer context and pagination params
  // const { searchParams } = new URL(request.url)
  // const viewer = searchParams.get('viewer')
  // const cursor = searchParams.get('cursor')
  // const limit = searchParams.get('limit')

  const { result } = await neynarClient.getMentionsAndReplies(
    fid /*, { viewer, cursor, limit } */,
  )
  return NextResponse.json(result)
}
```

Then, hit the API from your client:

```tsx
'use client'

import { type Notification } from 'neynar-next/server'
import useSWR from 'swr/immutable'

export default function Notifications() {
  const { data } = useSWR<{ notifications: Notification[] }, string>(
    signer?.status === 'approved'
      ? `/api/users/${signer.fid}/notifications`
      : null,
  )

  if (!data) return null

  return (
    <div>
      {data.notifications.map((notification) => (
        <div>{notification.text}</div>
      ))}
    </div>
  )
}
```

</details>
