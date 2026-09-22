import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Frown,
  CheckCircle,
  HelpCircle,
  LockKeyhole,
  Bell,
  LogIn,
  Banknote,
  Sparkles,
  Megaphone,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import {
  getProfile,
  updateNotificationPreference,
  type NotificationKey,
} from '../../services/app/profile'
import type { ProfileData } from '../../services/app/profile'

// ─── Notification preferences meta ─────────────────────
interface NotificationPreference {
  key: NotificationKey
  label: string
  description: string
  icon: typeof Bell
  accent: string
}

const NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    key: 'login',
    label: 'Login alerts',
    description: 'Get notified when your account is accessed from a new device.',
    icon: LogIn,
    accent: '#60A5FA',
  },
  {
    key: 'release',
    label: 'Release notifications',
    description: 'Know the moment money leaves a wallet — or lands in your bank.',
    icon: Banknote,
    accent: '#4ADE80',
  },
  {
    key: 'updates',
    label: 'Product updates',
    description: 'New features, improvements, and things we think you\u2019ll like.',
    icon: Sparkles,
    accent: '#A78BFA',
  },
  {
    key: 'promotions',
    label: 'Tips & promotions',
    description: 'Occasional tips to save smarter and offers from Mova.',
    icon: Megaphone,
    accent: '#F59E0B',
  },
]

type NotificationPrefsState = Record<NotificationKey, boolean>

const DEFAULT_PREFS: NotificationPrefsState = {
  login: true,
  release: true,
  updates: true,
  promotions: false,
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [imageFailed, setImageFailed] = useState(false)

  // ─── Notification prefs state ──────────────────────
  const [prefs, setPrefs] = useState<NotificationPrefsState>(DEFAULT_PREFS)
  const [pendingKeys, setPendingKeys] = useState<Set<NotificationKey>>(new Set())

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getProfile()
        if (response.is_success && response.data) {
          setProfile(response.data)

          // Hydrate notification prefs from the server
          if (response.data.notifications) {
            setPrefs({
              login: response.data.notifications.login,
              release: response.data.notifications.release,
              updates: response.data.notifications.updates,
              promotions: response.data.notifications.promotions,
            })
          }

          sessionStorage.setItem(
            'userData',
            JSON.stringify({
              fullName: response.data.fullName,
              email: response.data.email,
              phone: response.data.phone,
              profilePicture: response.data.profilePicture,
              balance: response.data.balance,
              hasPinSet: response.data.hasPinSet,
            })
          )
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // ─── Toggle handler ────────────────────────────────
  const handleToggleNotification = async (key: NotificationKey) => {
    const previous = prefs[key]
    const next = !previous

    // Optimistic update
    setPrefs((p) => ({ ...p, [key]: next }))
    setPendingKeys((s) => new Set(s).add(key))

    try {
      const result = await updateNotificationPreference(key, next)

      if (!result.is_success) {
        // Roll back
        setPrefs((p) => ({ ...p, [key]: previous }))
      }
    } catch {
      setPrefs((p) => ({ ...p, [key]: previous }))
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Something went wrong. Please try again.',
          },
        })
      )
    } finally {
      setPendingKeys((s) => {
        const n = new Set(s)
        n.delete(key)
        return n
      })
    }
  }

  const handleRequestChange = async () => {
    if (!requestMessage.trim()) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Please describe what you want to change.',
          },
        })
      )
      return
    }

    setIsRequesting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRequesting(false)
    setShowRequestForm(false)
    setRequestMessage('')

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message:
            "Your change request has been submitted! We'll review it shortly.",
        },
      })
    )
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const memberSince = '2026-09-01'
  const initial = profile?.fullName
    ? profile.fullName.charAt(0).toUpperCase()
    : 'U'

  const profilePicture = profile?.profilePicture || null
  const showProfilePicture = Boolean(profilePicture) && !imageFailed

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: themeColors.green,
              borderTopColor: 'transparent',
            }}
          />
        </div>
      </AppLayout>
    )
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.15)'
                : 'rgba(15, 185, 110, 0.08)',
              color: themeColors.mid,
            }}
          >
            <Frown size={32} strokeWidth={1.5} />
          </div>
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Failed to load profile
          </p>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            We couldn't fetch your profile. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Try again
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-[20px] border p-6 text-center"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-[40px] font-extrabold"
            style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
          >
            {showProfilePicture ? (
              <img
                src={profilePicture!}
                alt={profile.fullName}
                className="h-full w-full object-cover"
                draggable={false}
                onError={() => setImageFailed(true)}
              />
            ) : (
              initial
            )}
          </div>

          <h2
            className="mt-4 text-[22px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {profile.fullName}
          </h2>

          <div
            className="mt-4 flex items-center justify-center gap-2 text-[14px]"
            style={{ color: themeColors.mid }}
          >
            <Mail size={16} />
            {profile.email}
          </div>

          <div
            className="mt-1 flex items-center justify-center gap-2 text-[14px]"
            style={{ color: themeColors.mid }}
          >
            <Phone size={16} />
            {profile.phone}
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-2 text-[12px]"
            style={{ color: themeColors.light }}
          >
            <Calendar size={14} />
            Member since {formatDate(memberSince)}
          </div>

          {!showRequestForm && (
            <button
              type="button"
              onClick={() => setShowRequestForm(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
            >
              <HelpCircle size={18} />
              Request Profile Change
            </button>
          )}

          {showRequestForm && (
            <div className="mt-6 text-left">
              <label
                className="mb-2 block text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Describe what you'd like to change
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="e.g., Update my phone number to +234 800 000 0001"
                className="min-h-[80px] w-full resize-none rounded-[14px] border bg-transparent px-4 py-3 text-[14px] outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                  boxShadow: `0 0 0 2px ${themeColors.green}`,
                }}
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false)
                    setRequestMessage('')
                  }}
                  className="flex-1 rounded-[14px] border px-4 py-2.5 text-[14px] font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: themeColors.border,
                    color: themeColors.mid,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestChange}
                  disabled={isRequesting}
                  className="flex-1 rounded-[14px] px-4 py-2.5 text-[14px] font-semibold transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  {isRequesting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-2"
                        style={{
                          borderColor: '#FFFFFF',
                          borderTopColor: 'transparent',
                        }}
                      />
                      Submitting...
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Notification Settings ─── */}
        <div
          className="mt-4 rounded-[16px] border"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div
            className="flex items-center gap-3 border-b px-4 py-4"
            style={{ borderColor: themeColors.border }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <Bell size={17} strokeWidth={2.2} />
            </div>
            <div>
              <p
                className="text-[15px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Notifications
              </p>
              <p className="text-[11px]" style={{ color: themeColors.mid }}>
                Choose what you want to hear about
              </p>
            </div>
          </div>

          <div className="p-2">
            {NOTIFICATION_PREFERENCES.map((pref, index) => {
              const Icon = pref.icon
              const isOn = prefs[pref.key]
              const isPending = pendingKeys.has(pref.key)
              const isLast = index === NOTIFICATION_PREFERENCES.length - 1

              return (
                <div
                  key={pref.key}
                  className="flex items-center gap-3 rounded-[12px] px-2 py-3"
                  style={{
                    borderBottom: isLast
                      ? 'none'
                      : `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? `${pref.accent}26`
                        : `${pref.accent}1A`,
                      color: pref.accent,
                    }}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {pref.label}
                    </p>
                    <p
                      className="mt-0.5 text-[11px] leading-[1.45]"
                      style={{ color: themeColors.mid }}
                    >
                      {pref.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-label={pref.label}
                    disabled={isPending}
                    onClick={() => handleToggleNotification(pref.key)}
                    className="relative flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 disabled:cursor-wait disabled:opacity-60"
                    style={{
                      backgroundColor: isOn
                        ? themeColors.green
                        : isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <span
                      className="absolute flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{
                        width: 22,
                        height: 22,
                        left: isOn ? 24 : 2,
                      }}
                    >
                      {isPending && (
                        <Loader2
                          size={12}
                          className="animate-spin"
                          style={{ color: themeColors.green }}
                        />
                      )}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Message */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <Shield
              size={18}
              style={{ color: themeColors.green }}
              className="mt-0.5 shrink-0"
            />
            <div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Need to update your details?
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: themeColors.mid }}
              >
                To protect your account, profile changes require verification.
                Submit a request and we'll help you update your information.
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: themeColors.green }} />
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Email Verified
              </p>
            </div>
          </div>
          <div
            className="rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center gap-2">
              {profile.hasPinSet ? (
                <>
                  <CheckCircle size={16} style={{ color: themeColors.green }} />
                  <p className="text-[12px]" style={{ color: themeColors.mid }}>
                    PIN Set
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/pin-gate')}
                  className="flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-[12px] font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  <LockKeyhole size={14} />
                  Set PIN
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}