import { Hash } from 'viem'

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
      mentions: [] // This always seems to be empty
    }
  }
  followerCount: number
  followingCount: number
  verifications: Hash[]
  activeStatus: 'active' | 'inactive'
}

export type UserWithViewerContext = User & {
  viewerContext: {
    following: boolean
    followedBy: boolean
  }
}
