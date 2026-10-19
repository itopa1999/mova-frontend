import {
  ChevronRight,
  Moon,
  BarChart3,
  HelpCircle,
  LockKeyhole,
  Calculator,
  History,
  Banknote,
  Plus,
  Shield,
  FileText,
  KeyRound,
  Info,
  Wand2,
  ArrowUpRight,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import { logoutUser } from '../../services/app/logout'

interface SettingsItem {
  icon: React.ReactNode
  label: string
  sub?: string
  onClick?: () => void
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setTimeout(() => navigate('/welcome'), 1500)
      setIsLoggingOut(false)
    }
  }

  const securityItems: SettingsItem[] = [
    {
      icon: <LockKeyhole size={18} />,
      label: 'PIN',
      sub: 'Set up',
      onClick: () => navigate('/dashboard/pin-gate'),
    },
    {
      icon: <KeyRound size={18} />,
      label: 'Change Password',
      sub: 'Update your login password',
      onClick: () => navigate('/dashboard/change-password'),
    },
  ]

  const settingsItems: SettingsItem[] = [
    {
      icon: <Moon size={18} />,
      label: 'Dark Mode',
      sub: isDark ? 'On' : 'Off',
      onClick: toggleTheme,
    },
    {
      icon: <Wand2 size={18} />,
      label: 'Wallet Templates',
      sub: 'Browse preset wallets',
      onClick: () => navigate('/dashboard/templates'),
    },
    {
      icon: <Calculator size={18} />,
      label: 'Calculate Release',
      sub: 'Plan your releases',
      onClick: () => navigate('/dashboard/calculate-release'),
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Analytics',
      sub: 'Monthly insights',
      onClick: () => navigate('/dashboard/analytics'),
    },
    {
      icon: <Banknote size={18} />,
      label: 'Bank Accounts',
      sub: 'Manage your linked banks',
      onClick: () => navigate('/dashboard/bank'),
    },
    {
      icon: <Plus size={18} />,
      label: 'Add Funds',
      sub: 'Add money to your balance',
      onClick: () => navigate('/dashboard/add-funds'),
    },
    {
      icon: <History size={18} />,
      label: 'Transaction History',
      sub: 'View all transactions',
      onClick: () => navigate('/dashboard/transactions'),
    },
  ]

  const legalItems: SettingsItem[] = [
    {
      icon: <Info size={18} />,
      label: 'About Mova',
      sub: 'What we do and why',
      onClick: () => navigate('/about'),
    },
    {
      icon: <FileText size={18} />,
      label: 'Terms of Service',
      sub: 'Read our terms',
      onClick: () => navigate('/legal/terms'),
    },
    {
      icon: <Shield size={18} />,
      label: 'Privacy Policy',
      sub: 'How we protect your data',
      onClick: () => navigate('/legal/privacy'),
    },
    {
      icon: <Trash2 size={18} />,
      label: 'Delete Account',
      sub: 'Request permanent account deletion',
      onClick: () => navigate('/dashboard/delete-account'),
    },
    {
      icon: <HelpCircle size={18} />,
      label: 'Help & Support',
      onClick: () => navigate('/support'),
    },
    {
      icon: <Sparkles size={18} />,
      label: 'Help us improve',
      sub: 'Share feedback or report an issue',
      onClick: () => navigate('/dashboard/feedback'),
    },
  ]

  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'User'
  const email = userData.email || 'user@email.com'
  const profilePicture = userData.profilePicture || null
  const initial = fullName.charAt(0).toUpperCase()
  const showProfilePicture = Boolean(profilePicture) && !imageFailed

  // ✅ NEW: full-bleed group renderer — no horizontal padding on the button itself.
  // We use an inner div with px-4 to keep the text indented, so the
  // button fills 100% width and its hover/click area touches the edges.
  const renderGroup = (items: SettingsItem[]) => (
    <div
      className="overflow-hidden rounded-[16px] border"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="block w-full cursor-pointer text-left transition-all hover:opacity-80"
          style={{
            borderBottom:
              index < items.length - 1
                ? `1px solid ${themeColors.border}`
                : 'none',
          }}
        >
          {/* Inner padding ensures text is indented, but the button
              itself is full width. This is the key change. */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span style={{ color: themeColors.mid }}>{item.icon}</span>
              <div className="text-left">
                <p
                  className="text-[14px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  {item.label}
                </p>
                {item.sub && (
                  <p
                    className="text-[11px]"
                    style={{
                      color:
                        item.label === 'PIN'
                          ? themeColors.green
                          : themeColors.mid,
                      fontWeight: item.label === 'PIN' ? 600 : 400,
                    }}
                  >
                    {item.sub}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight size={16} style={{ color: themeColors.mid }} />
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <AppLayout>
      <div
        className="flex h-full flex-col"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Header */}
        <div
          className="shrink-0 border-b px-5 pb-4 pt-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} variant="subtle" />
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Settings
            </h1>
          </div>

          <div className="flex items-center gap-3.5">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: themeColors.green }}
            >
              {showProfilePicture ? (
                <img
                  src={profilePicture}
                  alt={fullName}
                  className="h-full w-full object-cover"
                  draggable={false}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span className="text-[22px] font-extrabold text-white">
                  {initial}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p
                className="text-[18px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {fullName}
              </p>
              <p className="text-[13px]" style={{ color: themeColors.mid }}>
                {email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard/profile')}
              className="cursor-pointer rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
            >
              Edit
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/withdraw')}
            className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-[14px] border px-4 py-3.5 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.12)'
                : 'rgba(15, 185, 110, 0.08)',
              borderColor: isDark
                ? 'rgba(15, 185, 110, 0.35)'
                : 'rgba(15, 185, 110, 0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(15, 185, 110, 0.2)'
                    : 'rgba(15, 185, 110, 0.15)',
                  color: themeColors.green,
                }}
              >
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </span>
              <div className="text-left">
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Withdraw money
                </p>
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Send to your bank or pay bills
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: themeColors.green }} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {/* Security Section */}
          <div>
            <p
              className="mb-2.5 px-5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Security
            </p>
            {renderGroup(securityItems)}
          </div>

          {/* Settings Section */}
          <div>
            <p
              className="mb-2.5 px-5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Settings
            </p>
            {renderGroup(settingsItems)}
          </div>

          {/* Legal & Support Section */}
          <div>
            <p
              className="mb-2.5 px-5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Legal & Support
            </p>
            {renderGroup(legalItems)}
          </div>

          {/* Logout Button */}
          <div className="px-5">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 w-full cursor-pointer rounded-[14px] border-none px-4 py-3.5 text-[15px] font-semibold transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: '#FFF0F0',
                color: themeColors.red,
              }}
            >
              {isLoggingOut ? (
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2"
                    style={{
                      borderColor: themeColors.red,
                      borderTopColor: 'transparent',
                    }}
                  />
                  Logging out...
                </div>
              ) : (
                'Log Out'
              )}
            </button>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </AppLayout>
  )
}