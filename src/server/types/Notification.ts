import { Address, Hash } from 'viem'

export type Notification = {
  hash: Hash
  parentHash: Hash | null
  parentUrl: string | null
  parentAuthor: {
    fid: string | null
  }
  author: {
    fid: number
    custodyAddress: Address
    username: string
    displayName: string
    pfp: {
      url: string
    }
    profile: {
      bio: {
        text: string
        mentions: [] // Known bug - this is always empty
      }
    }
    followerCount: number
    followingCount: number
    verifications: Address[]
    activeStatus: 'active' | 'inactive'
  }
  text: string
  timestamp: string
  embeds: { url: string }[]
  type: 'cast-mention' | 'cast-reply'
  reactions: {
    count: number
    fids: number[]
  }
  recasts: {
    count: number
    fids: number[]
  }
  recasters: string[]
  replies: {
    count: number
  }
  threadHash: Hash | null
}

export type NotificationWithViewerContext = Notification & {
  viewerContext: {
    liked: boolean
    recasted: boolean
  }
}
