import { Hash } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { Cast, GeneratedSigner, PendingSigner, Signer, User } from './types'

type Pagination = {
  cursor?: string
  limit?: number
}

export type FeedResponse = {
  casts: Cast[]
  next: {
    cursor: string
  }
}

export default class NeynarClient {
  private readonly apiKey: string
  private readonly fid: bigint
  private readonly mnemonic: string

  constructor(apiKey: string, fid: bigint, mnemonic: string) {
    this.apiKey = apiKey
    this.fid = fid
    this.mnemonic = mnemonic
  }

  async getSigner(signerUuid: string) {
    return this.get<Signer>('signer', { signer_uuid: signerUuid })
  }

  async createSigner() {
    const generatedSigner = await this.post<GeneratedSigner>('signer')

    const { deadline, signature } = await this.generateSignature(
      generatedSigner.public_key,
    )

    return this.post<PendingSigner>('signer/signed_key', {
      signer_uuid: generatedSigner.signer_uuid,
      app_fid: this.fid.toString(),
      deadline,
      signature,
    })
  }

  async getUserByFid(fid: number) {
    return this.get<{ result: { user: User } }>(
      'user',
      { fid: fid.toString() },
      1,
    )
  }

  async getFollowingFeed(fid: number, { cursor, limit }: Pagination = {}) {
    const params: Record<string, string> = {
      fid: fid.toString(),
    }
    if (cursor) params.cursor = cursor
    if (limit) params.limit = limit.toString()

    return this.get<FeedResponse>('feed', params)
  }

  async getChannelFeed(parentUrl: string, { cursor, limit }: Pagination = {}) {
    const params: Record<string, string> = {
      feed_type: 'filter',
      filter_type: 'parent_url',
      parent_url: parentUrl,
    }
    if (cursor) params.cursor = cursor
    if (limit) params.limit = limit.toString()

    return this.get<FeedResponse>('feed', params)
  }

  private async get<Response>(
    pathname: string,
    params: Record<string, string>,
    version: 1 | 2 = 2,
  ) {
    const searchParams = new URLSearchParams(params)
    const response = await this.request(
      `${pathname}?${searchParams.toString()}`,
      version,
    )
    return (await response.json()) as Response
  }

  private async post<Response>(
    pathname: string,
    body?: Record<string, string | number>,
  ) {
    const bodyParams = body
      ? {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      : {}
    const response = await this.request(pathname, 2, {
      method: 'POST',
      ...bodyParams,
    })

    return (await response.json()) as Response
  }

  private request(pathname: string, version: 1 | 2, init?: RequestInit) {
    return fetch(`https://api.neynar.com/v${version}/farcaster/${pathname}`, {
      ...init,
      headers: {
        ...init?.headers,
        api_key: this.apiKey,
      },
    })
  }

  private async generateSignature(publicKey: Hash) {
    const deadline = Math.floor(Date.now() / 1000) + 86400

    const signature = await mnemonicToAccount(this.mnemonic).signTypedData({
      domain: {
        name: 'Farcaster SignedKeyRequestValidator',
        version: '1',
        chainId: 10,
        verifyingContract:
          '0x00000000fc700472606ed4fa22623acf62c60553' as const,
      },
      types: {
        SignedKeyRequest: [
          { name: 'requestFid', type: 'uint256' },
          { name: 'key', type: 'bytes' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'SignedKeyRequest',
      message: {
        requestFid: this.fid,
        key: publicKey,
        deadline: BigInt(deadline),
      },
    })

    return { deadline, signature }
  }
}
