import { Hash } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import {
  Cast,
  GeneratedSigner,
  PendingSigner,
  Signer,
  User,
  UserWithViewerContext,
} from './types'

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

// TODO: type non-success responses
export type PostCastResponse = {
  success: true
  cast: {
    hash: Hash
    author: { fid: number }
    text: string
  }
}

// Abbreviated type definition, just covering the cases we're using
type JsonValue = string | number | null
type Json = Record<string, JsonValue | JsonValue[] | Json[]>

export default class NeynarClient {
  private readonly apiKey: string
  private readonly fid: bigint
  private readonly mnemonic: string

  constructor(apiKey: string, fid: bigint, mnemonic: string) {
    this.apiKey = apiKey
    this.fid = fid
    this.mnemonic = mnemonic
  }

  getSigner(signerUuid: string) {
    const params = new URLSearchParams({ signer_uuid: signerUuid })
    return this.get<Signer>('signer', params)
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

  getUserByFid(fid: number, viewer?: null): Promise<User>
  getUserByFid(fid: number, viewer: number): Promise<UserWithViewerContext>
  async getUserByFid(fid: number, viewer?: number | null) {
    const params = new URLSearchParams({ fid: fid.toString() })
    if (viewer) params.set('viewerFid', viewer.toString())
    const response = await this.get<{
      result: { user: User | UserWithViewerContext }
    }>('user', params, 1)
    return response.result.user
  }

  getUserByUsername(username: string, viewer?: null): Promise<User>
  getUserByUsername(
    username: string,
    viewer: number,
  ): Promise<UserWithViewerContext>
  async getUserByUsername(username: string, viewer?: number | null) {
    const params = new URLSearchParams({ username })
    if (viewer) params.set('viewerFid', viewer.toString())
    const response = await this.get<{
      result: { user: User | UserWithViewerContext }
    }>('user-by-username', params, 1)
    return response.result.user
  }

  getFollowingFeed(fid: number, { cursor, limit }: Pagination = {}) {
    const params = new URLSearchParams({
      fid: fid.toString(),
    })
    if (cursor) params.set('cursor', cursor)
    if (limit) params.set('limit', limit.toString())

    return this.get<FeedResponse>('feed', params)
  }

  getChannelFeed(parentUrl: string, { cursor, limit }: Pagination = {}) {
    const params = new URLSearchParams({
      feed_type: 'filter',
      filter_type: 'parent_url',
      parent_url: parentUrl,
    })
    if (cursor) params.set('cursor', cursor)
    if (limit) params.set('limit', limit.toString())

    return this.get<FeedResponse>('feed', params)
  }

  getFeedForFids(fids: number[], { cursor, limit }: Pagination = {}) {
    const params = new URLSearchParams({
      feed_type: 'filter',
      filter_type: 'fids',
      fids: fids.join(','),
    })
    if (cursor) params.set('cursor', cursor)
    if (limit) params.set('limit', limit.toString())

    return this.get<FeedResponse>('feed', params)
  }

  postCast(
    signerUuid: string,
    text: string,
    extra?: { embeds?: { url: string }[]; parent?: string },
  ) {
    const params: Json = {
      signer_uuid: signerUuid,
      text,
    }
    if (extra?.embeds) params.embeds = extra.embeds
    if (extra?.parent) params.parent = extra.parent
    return this.post<PostCastResponse>('cast', params)
  }

  deleteCast(signerUuid: string, hash: Hash) {
    return this.delete('cast', { signer_uuid: signerUuid, target_hash: hash })
  }

  likeCast(signerUuid: string, hash: Hash) {
    return this.post('reaction', {
      signer_uuid: signerUuid,
      target: hash,
      reaction_type: 'like',
    })
  }

  unlikeCast(signerUuid: string, hash: Hash) {
    return this.delete('reaction', {
      signer_uuid: signerUuid,
      target: hash,
      reaction_type: 'like',
    })
  }

  recastCast(signerUuid: string, hash: Hash) {
    return this.post('reaction', {
      signer_uuid: signerUuid,
      target: hash,
      reaction_type: 'recast',
    })
  }

  unrecastCast(signerUuid: string, hash: Hash) {
    return this.delete('reaction', {
      signer_uuid: signerUuid,
      target: hash,
      reaction_type: 'recast',
    })
  }

  private async get<Response>(
    pathname: string,
    params: URLSearchParams,
    version: 1 | 2 = 2,
  ) {
    const response = await this.request(
      `${pathname}?${params.toString()}`,
      version,
    )
    return (await response.json()) as Response
  }

  private async post<Response>(pathname: string, body?: Json) {
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

  private async delete<Response>(
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
      method: 'DELETE',
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
