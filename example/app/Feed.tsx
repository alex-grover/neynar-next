'use client'

import { useSigner } from 'neynar-next'
import { useEffect, useState } from 'react'
import { type Cast, type FeedResponse } from 'neynar-next/server'

export default function Feed() {
  const { signer } = useSigner()

  // Just loads the first page for now. You may want to use a library like `swr` to help with pagination and caching.
  const [isLoading, setIsLoading] = useState(false)
  const [casts, setCasts] = useState<Cast[]>([])

  useEffect(() => {
    async function getFeed() {
      if (signer?.status !== 'approved') return null

      setIsLoading(true)

      const params = new URLSearchParams({ fid: signer.fid.toString() })
      const response = await fetch(`/api/casts?${params.toString()}`)
      const json = (await response.json()) as FeedResponse

      setCasts(json.casts)
      setIsLoading(false)
    }

    void getFeed()
  }, [signer?.status])

  if (isLoading) return 'Loading...'

  return (
    <>
      {casts.map((cast) => (
        <div key={cast.hash}>
          <strong>Author: {cast.author.username}</strong>
          <div>Cast: {cast.text}</div>
        </div>
      ))}
    </>
  )
}
