import NeynarClient from 'neynar-next/server'

const neynarClient = new NeynarClient(
  process.env.NEYNAR_API_KEY!,
  BigInt(process.env.FARCASTER_FID!),
  process.env.FARCASTER_MNEMONIC!,
)

export default neynarClient
