
export const NextSteps = {
  EmailVerification: 'Email Verification',
  BvnVerification: 'BVN Verification',
  CreateTransactionPin: 'Create Transaction PIN',
  CompleteProfile: 'Complete Profile',
} as const

export type NextStep = (typeof NextSteps)[keyof typeof NextSteps]

/**
 * Maps a backend `nextStep` value to a frontend route.
 * Add entries here as new steps are introduced.
 */
export const stepToRoute: Record<string, string> = {
  [NextSteps.EmailVerification]: '/verify-email',
  [NextSteps.BvnVerification]: '/verify-bvn',
  [NextSteps.CreateTransactionPin]: '/pin-setup',
  [NextSteps.CompleteProfile]: '/complete-profile',
}