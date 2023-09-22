'use client'

import { useContext } from 'react'
import NeynarContext from './NeynarContext'

export default function useNeynar() {
  return useContext(NeynarContext)
}
