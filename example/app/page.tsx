'use client'

import { useSigner } from 'neynar-next'
import { useCallback } from 'react'
import QRCode from 'react-qr-code'
import CastForm from './CastForm'
import Feed from './Feed'

export default function HomePage() {
  const { signer, isLoading, signIn } = useSigner()

  const handleClick = useCallback(() => void signIn(), [signIn])

  if (isLoading) return 'Loading...'

  switch (signer?.status) {
    case undefined:
      return <button onClick={handleClick}>Sign In</button>
    case 'generated':
      // This should never happen, unless the server fails while registering the signer
      throw new Error('Unregistered signer')
    case 'pending_approval':
      return <QRCode value={signer.signer_approval_url} />
    case 'approved':
      return (
        <>
          <CastForm />
          <Feed />
        </>
      )
    case 'revoked':
      return <button onClick={handleClick}>Revoked. Sign In Again</button>
  }
}
