export interface AuthUser {
  userPublicId: string
  email: string
  phone: string
  fullName: string
  platform: string
  profilePicture: string | null
  balance: number
  onboardingStage: number
}

const STORAGE_KEY = 'userData'

export function getAuthUser(): AuthUser | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.userPublicId) return null
    return parsed as AuthUser
  } catch {
    return null
  }
}

export function setAuthUser(user: AuthUser): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function updateAuthUser(patch: Partial<AuthUser>): AuthUser | null {
  const current = getAuthUser()
  if (!current) return null
  const next = { ...current, ...patch }
  setAuthUser(next)
  return next
}

export function clearAuthUser(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null
}