import { NextResponse } from 'next/server'
import neynarClient from '@/lib/neynar'

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
