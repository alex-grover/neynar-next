import { useContext } from 'react'
import NeynarContext from './NeynarContext'

export default function useSigner() {
  return useContext(NeynarContext)
}
