// src/utils/walletFees.ts

export type PayoutDestination = 'bank' | 'wallet' | 'main'

export interface WalletFeeBreakdown {
  releases: number
  creationFee: number
  payoutFeePerRelease: number
  totalPayoutFee: number
  totalMovaCharges: number
  totalUpfrontCharge: number
}

// ─── Tunable constants ────────────────────────────────
export const WALLET_FEE_CONSTANTS = {
  CREATION_FEE_PERCENT: 0.013,   // 1.3%
  CREATION_FEE_FLAT: 5,          // +₦5

  PAYOUT_TIER_1_MAX: 5_000,      // ≤ ₦5,000
  PAYOUT_TIER_2_MAX: 50_000,     // ≤ ₦50,000
  PAYOUT_TIER_1_FEE: 10,
  PAYOUT_TIER_2_FEE: 25,
  PAYOUT_TIER_3_FEE: 50,

  STAMP_DUTY_THRESHOLD: 10_000,  // ≥ ₦10,000
  STAMP_DUTY_AMOUNT: 50,
} as const

// ─── Payout base fee by release tier ──────────────────
const getPayoutBaseFee = (release: number): number => {
  const c = WALLET_FEE_CONSTANTS
  if (release <= c.PAYOUT_TIER_1_MAX) return c.PAYOUT_TIER_1_FEE
  if (release <= c.PAYOUT_TIER_2_MAX) return c.PAYOUT_TIER_2_FEE
  return c.PAYOUT_TIER_3_FEE
}

// ─── Stamp duty (₦50 if release ≥ ₦10,000, else 0) ────
const getStampDuty = (release: number): number => {
  const c = WALLET_FEE_CONSTANTS
  return release >= c.STAMP_DUTY_THRESHOLD ? c.STAMP_DUTY_AMOUNT : 0
}

// ─── Main calculator ──────────────────────────────────
/**
 * Computes the full MOVA fee breakdown for a wallet.
 *
 * @param target       Total wallet target in naira
 * @param release      Amount released per schedule fire
 * @param destination  'bank' charges payout fees; 'wallet'/'main' do not
 * @param overrideReleases  Optional. If the backend preview already returned
 *                          an authoritative release count, pass it here so
 *                          both numbers agree exactly.
 */
export const calculateWalletFees = (
  target: number,
  release: number,
  destination: PayoutDestination,
  overrideReleases?: number
): WalletFeeBreakdown => {
  if (
    !Number.isFinite(target) ||
    !Number.isFinite(release) ||
    target <= 0 ||
    release <= 0
  ) {
    return {
      releases: 0,
      creationFee: 0,
      payoutFeePerRelease: 0,
      totalPayoutFee: 0,
      totalMovaCharges: 0,
      totalUpfrontCharge: 0,
    }
  }

  const c = WALLET_FEE_CONSTANTS

  const releases = overrideReleases ?? Math.ceil(target / release)

  const creationFee =
    Math.floor(target * c.CREATION_FEE_PERCENT) + c.CREATION_FEE_FLAT

  let payoutFeePerRelease = 0
  let totalPayoutFee = 0

  if (destination === 'bank') {
    payoutFeePerRelease = getPayoutBaseFee(release) + getStampDuty(release)
    totalPayoutFee = payoutFeePerRelease * releases
  }

  const totalMovaCharges = creationFee + totalPayoutFee
  const totalUpfrontCharge = target + totalMovaCharges

  return {
    releases,
    creationFee,
    payoutFeePerRelease,
    totalPayoutFee,
    totalMovaCharges,
    totalUpfrontCharge,
  }
}