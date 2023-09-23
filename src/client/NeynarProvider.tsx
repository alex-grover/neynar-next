import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { type Signer } from '../server'
import NeynarContext from './NeynarContext'

const STORAGE_KEY = 'farcaster-signer'

type NeynarProviderProps = PropsWithChildren<{
  api?: string
}>

// TODO: error handling
export default function NeynarProvider({
  api = '/api/signer',
  children,
}: NeynarProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [signer, setSigner] = useState<Signer | null>(null)

  // Load existing user upon page load
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) {
      setIsLoading(false)
      return
    }
    // TODO: validate stored data shape
    const signer = JSON.parse(storedData) as Signer
    setSigner(signer)
    setIsLoading(false)
  }, [])

  // Poll for updates while signer is in pending status
  useEffect(() => {
    if (signer?.status !== 'pending_approval') return

    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      intervalId = setInterval(async () => {
        // TODO: allow customizing how params are passed
        const response = await fetch(`${api}?signer_uuid=${signer.signer_uuid}`)

        const updatedSigner = (await response.json()) as Signer
        if (updatedSigner.status !== 'approved') return

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSigner))
        setSigner(updatedSigner)
        clearInterval(intervalId)
      }, 2000)
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        startPolling()
      } else {
        clearInterval(intervalId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    startPolling()

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [api, signer])

  const signIn = useCallback(async () => {
    setIsLoading(true)
    setSigner(null)

    const response = await fetch(api, { method: 'POST' })
    const signer = (await response.json()) as Signer

    localStorage.setItem(STORAGE_KEY, JSON.stringify(signer))
    setIsLoading(false)
    setSigner(signer)
  }, [api])

  return (
    <NeynarContext.Provider value={{ signer, isLoading, signIn }}>
      {children}
    </NeynarContext.Provider>
  )
}
