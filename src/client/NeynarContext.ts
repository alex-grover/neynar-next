'use client'

import { createContext } from 'react'
import { type Signer } from '../server'

export type NeynarContextType = {
  signer: Signer | null
  isLoading: boolean
  signIn: () => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/require-await
async function notInitialized() {
  throw new Error('Not initialized')
}

const NeynarContext = createContext<NeynarContextType>({
  signer: null,
  isLoading: false,
  signIn: notInitialized,
})

export default NeynarContext
