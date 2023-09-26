'use client'

import { useSigner } from 'neynar-next'
import { FormEvent, useCallback, useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function CastForm() {
  const { signer } = useSigner()

  const [state, setState] = useState<State>('idle')

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      async function postCast() {
        if (signer?.status !== 'approved') return

        setState('loading')

        const data = new FormData(event.currentTarget)
        const text = data.get('text')

        if (typeof text !== 'string') throw new Error()

        const params = new URLSearchParams({ signerUuid: signer.signer_uuid })

        try {
          await fetch(`/api/casts?${params.toString()}`, {
            method: 'POST',
            body: text,
          })
          setState('success')
        } catch {
          setState('error')
        }
      }

      void postCast()
    },
    [signer],
  )
  return (
    <form onSubmit={handleSubmit}>
      <textarea name="text" required />
      <button type="submit" disabled={state === 'loading'}>
        Post
      </button>
      {state === 'success' && 'Cast posted!'}
      {state === 'error' && 'An error occurred'}
    </form>
  )
}
