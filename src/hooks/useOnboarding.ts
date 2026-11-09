import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  OnboardingStage,
  ONBOARDING_STAGES,
  ONBOARDING_TOTAL_STEPS,
  getNextStage,
  getStageMeta,
  parseOnboardingStage,
} from '../types/onboarding'
import {
  getAuthUser,
  updateAuthUser,
  type AuthUser,
} from '../hooks/auth-session'

/**
 * Shape returned by any onboarding mutation:
 *   POST /auth/verify-account
 *   POST /security/pin/set
 *   POST /legal/accept/agreement|privacy|terms
 *
 * `currentStageValue` is what the user has just COMPLETED.
 * `nextStage` is what they should do NEXT (used for routing).
 */
export interface OnboardingResponsePayload {
  currentStageValue?: number | string | null
  currentStage?: string | null
  nextStage?: string | null
}

export interface OnboardingProgress {
  current: number
  total: number
  percent: number
}

export interface UseOnboardingReturn {
  user: AuthUser | null

  /** What the user has completed. */
  currentStage: OnboardingStage
  currentMeta: ReturnType<typeof getStageMeta>

  /** What the user should do next. */
  nextStage: OnboardingStage
  nextMeta: ReturnType<typeof getStageMeta>

  /** True when `currentStage === Completed`. */
  isComplete: boolean

  /** Step counter for the progress UI (based on `currentStage`). */
  progress: OnboardingProgress

  /** Navigate to the page for a given stage. */
  goToStage: (
    stage: OnboardingStage,
    options?: { replace?: boolean },
  ) => void

  /** Navigate to the page matching the user's next stage (or /dashboard if complete). */
  goToNextStage: () => void

  /** Navigate to /dashboard. */
  goToDashboard: () => void

  /** Persist a stage to sessionStorage and return the parsed value. */
  applyStage: (stage: OnboardingStage | string | number) => OnboardingStage

  /**
   * Persist a stage from a mutation response and route to the correct next page.
   * Automatically sends to /dashboard when the response says `Completed`.
   */
  applyStageFromResponse: (
    response: OnboardingResponsePayload,
  ) => OnboardingStage

  /** Force a re-read from sessionStorage (rarely needed — mutations do this for you). */
  refresh: () => void
}

export function useOnboarding(): UseOnboardingReturn {
  const navigate = useNavigate()

  const [user, setUserState] = useState<AuthUser | null>(() => getAuthUser())

  /**
   * Keep the local state in sync if another tab logs in / updates the user.
   * The `storage` event only fires across tabs, so same-tab mutations are
   * handled by the `applyStage` / `refresh` helpers below.
   */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'userData' || event.key === null) {
        setUserState(getAuthUser())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const refresh = useCallback(() => {
    setUserState(getAuthUser())
  }, [])

  const currentStage = useMemo(
    () => parseOnboardingStage(user?.onboardingStage),
    [user?.onboardingStage],
  )

  const currentMeta = useMemo(() => getStageMeta(currentStage), [currentStage])

  const nextStage = useMemo(() => getNextStage(currentStage), [currentStage])

  const nextMeta = useMemo(() => getStageMeta(nextStage), [nextStage])

  const isComplete = currentStage === OnboardingStage.Completed

  const progress = useMemo<OnboardingProgress>(() => {
    const current = currentMeta.order
    const total = ONBOARDING_TOTAL_STEPS
    return {
      current,
      total,
      percent: Math.min(100, Math.round((current / total) * 100)),
    }
  }, [currentMeta.order])

  const goToStage = useCallback(
    (stage: OnboardingStage, options?: { replace?: boolean }) => {
      const meta = ONBOARDING_STAGES[stage] ?? ONBOARDING_STAGES[OnboardingStage.Register]
      navigate(meta.route, { replace: options?.replace ?? true })
    },
    [navigate],
  )

  const goToNextStage = useCallback(() => {
    if (isComplete) {
      navigate('/dashboard', { replace: true })
      return
    }
    goToStage(nextStage)
  }, [isComplete, nextStage, navigate, goToStage])

  const goToDashboard = useCallback(() => {
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const applyStage = useCallback(
    (stage: OnboardingStage | string | number): OnboardingStage => {
      const parsed = parseOnboardingStage(stage)
      updateAuthUser({ onboardingStage: parsed })
      setUserState(getAuthUser())
      return parsed
    },
    [],
  )

  const applyStageFromResponse = useCallback(
    (response: OnboardingResponsePayload): OnboardingStage => {
      const raw =
        response.currentStageValue ??
        response.currentStage ??
        OnboardingStage.Register

      const parsed = applyStage(raw)

      if (parsed === OnboardingStage.Completed) {
        navigate('/dashboard', { replace: true })
      } else {
        goToStage(getNextStage(parsed))
      }

      return parsed
    },
    [applyStage, navigate, goToStage],
  )

  return {
    user,
    currentStage,
    currentMeta,
    nextStage,
    nextMeta,
    isComplete,
    progress,
    goToStage,
    goToNextStage,
    goToDashboard,
    applyStage,
    applyStageFromResponse,
    refresh,
  }
}