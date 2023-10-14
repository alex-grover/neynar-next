import { Address } from 'viem'

export type User = {
  fid: number
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

export type UserWithViewerContext = User & {
  viewerContext: {
    following: boolean
    followedBy: boolean
  }
}
