import { Address, Hash } from 'viem'
import { User } from './User'

export type Cast = {
  hash: Hash
  thread_hash: Hash | null
  parent_hash: Hash | null
  parent_url: string | null
  parent_author: {
    fid: number | null
  }
  author: User
  text: string
  timestamp: string
  embeds: Embed[]
  reactions: {
    likes: Like[]
    recasts: Recast[]
  }
  replies: {
    count: number
  }
}

export type CastWithViewerContext = Cast & {
  viewer_context: {
    liked: boolean
    recasted: boolean
  }
}

type Embed = {
  url?: string
  cast_id?: {
    fid: number
    hash: Hash
  }
}

type Like = {
  fid: number
}

type Recast = {
  fid: number
  fname: string
}

export type CastV1 = {
  hash: Hash
  threadHash: Hash | null
  parentHash: Hash | null
  parentUrl: string | null
  parentAuthor: {
    fid: number | null
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
  embeds: Embed[]
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
}

export type CastV1WithViewerContext = CastV1 & {
  viewerContext: {
    liked: boolean
    recasted: boolean
  }
}

export function convertCasts(casts: CastV1[]): Cast[]
export function convertCasts(
  casts: CastV1WithViewerContext[],
): CastWithViewerContext[]
export function convertCasts(
  casts: (CastV1 | CastV1WithViewerContext)[],
): (Cast | CastWithViewerContext)[] {
  return casts.map((castV1) => {
    const cast: Cast = {
      hash: castV1.hash,
      thread_hash: castV1.threadHash,
      parent_hash: castV1.parentHash,
      parent_url: castV1.parentUrl,
      parent_author: castV1.parentAuthor,
      author: {
        fid: castV1.author.fid,
        username: castV1.author.username,
        display_name: castV1.author.displayName,
        pfp_url: castV1.author.pfp.url,
        profile: {
          bio: {
            text: castV1.author.profile.bio.text,
          },
        },
        follower_count: castV1.author.followerCount,
        following_count: castV1.author.followingCount,
        verifications: castV1.author.verifications,
        active_status: castV1.author.activeStatus,
      },
      text: castV1.text,
      timestamp: castV1.timestamp,
      embeds: castV1.embeds,
      reactions: {
        likes: castV1.reactions.fids.map((fid) => ({ fid })),
        recasts: castV1.recasts.fids.map((fid, index) => ({
          fid,
          fname: castV1.recasters[index],
        })),
      },
      replies: castV1.replies,
    }

    if ('viewerContext' in castV1) {
      return {
        ...cast,
        viewer_context: {
          ...castV1.viewerContext,
        },
      }
    }

    return cast
  })
}
