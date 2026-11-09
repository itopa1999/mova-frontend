import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../hooks/useOnboarding'
import { OnboardingStage } from '../../types/onboarding'

interface OnboardingGuardProps {
  /**
   * The stage this page represents. Must match the user's **next** stage
   * for the page to render — meaning: "you are here because the previous
   * stage is completed and this is what you have left to do."
   *
   * @example
   *   <OnboardingGuard stage={OnboardingStage.Pin}>
   *     <PinSetupForm />
   *   </OnboardingGuard>
   */
  stage: OnboardingStage
  children: ReactNode
}

export default function OnboardingGuard({
  stage,
  children,
}: OnboardingGuardProps) {
  const navigate = useNavigate()
  const { user, nextStage, isComplete, goToStage } = useOnboarding()

  useEffect(() => {
    // 1. No session → force login
    if (!user) {
      navigate('/auth/login', { replace: true })
      return
    }

    // 2. Onboarding finished → go to app
    if (isComplete) {
      navigate('/dashboard', { replace: true })
      return
    }

    // 3. User is on the wrong step → send to the correct one
    if (nextStage !== stage) {
      goToStage(nextStage)
    }
  }, [user, isComplete, nextStage, stage, navigate, goToStage])

  // Render nothing while the redirect is happening.
  // The three conditions mirror the effect above — keep them in sync.
  const canRender = !!user && !isComplete && nextStage === stage

  if (!canRender) return null

  return <>{children}</>
}