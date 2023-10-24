import { Address } from 'viem'

export type ActiveStatus = 'active' | 'inactive'

export type User = {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  profile: {
    bio: {
      text: string
    }
  }
  follower_count: number
  following_count: number
  verifications: Address[]
  active_status: ActiveStatus
}

export type UserWithViewerContext = User & {
  viewer_context: {
    following: boolean
    followed_by: boolean
  }
}

export type UserV1 = {
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
  activeStatus: ActiveStatus
}

export type UserV1WithViewerContext = UserV1 & {
  viewerContext: {
    following: boolean
    followedBy: boolean
  }
}

export function convertUser(user: UserV1): User
export function convertUser(
  user: UserV1WithViewerContext,
): UserWithViewerContext
export function convertUser(
  userV1: UserV1 | UserV1WithViewerContext,
): User | UserWithViewerContext {
  const user: User = {
    fid: userV1.fid,
    username: userV1.username,
    display_name: userV1.displayName,
    pfp_url: userV1.pfp.url,
    profile: {
      bio: {
        text: userV1.profile.bio.text,
      },
    },
    follower_count: userV1.followerCount,
    following_count: userV1.followingCount,
    verifications: userV1.verifications,
    active_status: userV1.activeStatus,
  }

  if ('viewerContext' in userV1) {
    return {
      ...user,
      viewer_context: {
        following: userV1.viewerContext.following,
        followed_by: userV1.viewerContext.followedBy,
      },
    }
  }

  return user
}
