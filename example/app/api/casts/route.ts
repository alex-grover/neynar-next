import neynarClient from '@/lib/neynar'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fid = parseInt(searchParams.get('fid') ?? '')
  if (!fid) return new Response('fid query param is required', { status: 400 })

  const feed = await neynarClient.getFollowingFeed(fid)

  return NextResponse.json(feed)
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const signerUuid = searchParams.get('signerUuid')
  if (!signerUuid)
    return new Response('signerUuid query param is required', { status: 400 })

  const text = await request.text()

  await neynarClient.postCast(signerUuid, text)

  return new Response(null, { status: 201 })
}
