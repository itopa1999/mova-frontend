export const OnboardingStage = {
  Register: 1,
  Verify: 2,
  Pin: 3,
  Agreement: 4,
  Privacy: 5,
  Terms: 6,
  Completed: 7,
} as const

export type OnboardingStage =
  (typeof OnboardingStage)[keyof typeof OnboardingStage]

export type OnboardingStageKey = keyof typeof OnboardingStage

export interface OnboardingStageMeta {
  stage: OnboardingStage
  key: OnboardingStageKey
  label: string
  route: string
  order: number
  isPublic: boolean
}

export const ONBOARDING_STAGES: Record<OnboardingStage, OnboardingStageMeta> = {
  [OnboardingStage.Register]: {
    stage: OnboardingStage.Register,
    key: 'Register',
    label: 'Create account',
    route: '/register',
    order: 1,
    isPublic: true,
  },
  [OnboardingStage.Verify]: {
    stage: OnboardingStage.Verify,
    key: 'Verify',
    label: 'Verify your contact',
    route: '/auth/verify-email',
    order: 2,
    isPublic: true,
  },
  [OnboardingStage.Pin]: {
    stage: OnboardingStage.Pin,
    key: 'Pin',
    label: 'Set transaction PIN',
    route: '/auth/pin-setup',
    order: 3,
    isPublic: false,
  },
  [OnboardingStage.Agreement]: {
    stage: OnboardingStage.Agreement,
    key: 'Agreement',
    label: 'User agreement',
    route: '/onboarding/agreement',
    order: 4,
    isPublic: false,
  },
  [OnboardingStage.Privacy]: {
    stage: OnboardingStage.Privacy,
    key: 'Privacy',
    label: 'Privacy policy',
    route: '/onboarding/privacy',
    order: 5,
    isPublic: false,
  },
  [OnboardingStage.Terms]: {
    stage: OnboardingStage.Terms,
    key: 'Terms',
    label: 'Terms of service',
    route: '/onboarding/terms',
    order: 6,
    isPublic: false,
  },
  [OnboardingStage.Completed]: {
    stage: OnboardingStage.Completed,
    key: 'Completed',
    label: 'Complete',
    route: '/dashboard',
    order: 7,
    isPublic: false,
  },
}

export const ONBOARDING_TOTAL_STEPS = OnboardingStage.Completed

export function parseOnboardingStage(
  value: OnboardingStage | string | number | null | undefined,
): OnboardingStage {
  if (value === null || value === undefined) return OnboardingStage.Register

  if (typeof value === 'number') {
    if (value in ONBOARDING_STAGES) return value as OnboardingStage
    return OnboardingStage.Register
  }

  const normalized = value.trim().toLowerCase()
  const found = Object.values(ONBOARDING_STAGES).find(
    (meta) => meta.key.toLowerCase() === normalized,
  )
  return found?.stage ?? OnboardingStage.Register
}

export function getStageMeta(stage: OnboardingStage): OnboardingStageMeta {
  return ONBOARDING_STAGES[stage] ?? ONBOARDING_STAGES[OnboardingStage.Register]
}

export function getNextStage(stage: OnboardingStage): OnboardingStage {
  if (stage >= OnboardingStage.Completed) return OnboardingStage.Completed
  return (stage + 1) as OnboardingStage
}