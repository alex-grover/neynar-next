import { Hash } from 'viem'

export type Cast = {
  hash: Hash
  thread_hash: Hash | null
  parent_hash: Hash | null
  parent_url: string | null
  parent_author: {
    fid: number | null
  }
  author: {
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
    verifications: Hash[]
    active_status: 'active'
  }
  text: string
  timestamp: string
  embeds: Embed[]
  reactions: {
    likes: Like[]
    recasts: Recast[]
  }
  replies: {
    count: 2
  }
}

type Embed = {
  url: string
}

type Like = {
  fid: number
}

type Recast = {
  fid: number
  fname: string
}
