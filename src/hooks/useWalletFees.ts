// src/hooks/useWalletFees.ts

import { useMemo } from 'react'
import {
  calculateWalletFees,
  type PayoutDestination,
  type WalletFeeBreakdown,
} from '../utils/walletFees'

export interface UseWalletFeesParams {
  target: number
  release: number
  destination: PayoutDestination
  overrideReleases?: number
}

export const useWalletFees = ({
  target,
  release,
  destination,
  overrideReleases,
}: UseWalletFeesParams): WalletFeeBreakdown => {
  return useMemo(
    () => calculateWalletFees(target, release, destination, overrideReleases),
    [target, release, destination, overrideReleases]
  )
}

export default useWalletFees