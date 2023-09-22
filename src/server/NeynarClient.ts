import { Hash } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'

type BaseSigner = {
  signer_uuid: string
  public_key: Hash
}

type GeneratedSigner = BaseSigner & {
  status: 'generated'
}

type PendingSigner = BaseSigner & {
  status: 'pending_approval'
  signer_approval_url: string
}

type ApprovedSigner = BaseSigner & {
  status: 'approved'
  fid: number
}

type RevokedSigner = BaseSigner & {
  status: 'revoked'
}

export type Signer =
  | GeneratedSigner
  | PendingSigner
  | ApprovedSigner
  | RevokedSigner

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
    const response = await this.get('signer', { signer_uuid: signerUuid })
    return (await response.json()) as Signer
  }

  async createSigner() {
    const createResponse = await this.post('signer')
    const generatedSigner = (await createResponse.json()) as GeneratedSigner

    const { deadline, signature } = await this.generateSignature(
      generatedSigner.public_key,
    )

    const registerResponse = await this.post('signer/signed_key', {
      signer_uuid: generatedSigner.signer_uuid,
      app_fid: this.fid.toString(),
      deadline,
      signature,
    })

    return (await registerResponse.json()) as PendingSigner
  }

  private get(pathname: string, params: Record<string, string>) {
    const searchParams = new URLSearchParams(params)
    return this.request(`${pathname}?${searchParams.toString()}`)
  }

  private post(pathname: string, body?: Record<string, string | number>) {
    const bodyParams = body
      ? {
          'Content-Type': 'application/json',
          body: JSON.stringify(body),
        }
      : {}
    return this.request(pathname, { method: 'POST', ...bodyParams })
  }

  private request(pathname: string, init?: RequestInit) {
    return fetch(`https://api.neynar.com/v2/farcaster/${pathname}`, {
      ...init,
      headers: {
        ...init?.headers,
        api_key: this.apiKey,
      },
    })
  }

  private async generateSignature(public_key: Hash) {
    const deadline = Math.floor(Date.now() / 1000) + 86400

    const signature = await mnemonicToAccount(this.mnemonic).signTypedData({
      domain: {
        name: 'Farcaster SignedKeyRequestValidator',
        version: '1',
        chainId: 10,
        verifyingContract:
          '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
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
        key: public_key,
        deadline: BigInt(deadline),
      },
    })

    return { deadline, signature }
  }
}
