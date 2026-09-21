import {
  ChevronRight,
  ChevronLeft,
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
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import AppLayout from '../../components/layout/AppLayout'
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
      const response = await logoutUser()

      sessionStorage.removeItem('userData')
      sessionStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userData')
      localStorage.removeItem('isLoggedIn')

      if (response.is_success) {
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (error) {
      console.error('Logout error:', error)
      sessionStorage.removeItem('userData')
      sessionStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userData')
      localStorage.removeItem('isLoggedIn')

      setTimeout(() => {
        navigate('/')
      }, 1500)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const securityItems: SettingsItem[] = [
    {
      icon: <LockKeyhole size={18} />,
      label: 'PIN',
      sub: 'Set up',
      onClick: () => navigate('/pin-gate'),
    },
    {
      icon: <KeyRound size={18} />,
      label: 'Change Password',
      sub: 'Update your login password',
      onClick: () => navigate('/change-password'),
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
      onClick: () => navigate('/templates'),
    },
    {
      icon: <Calculator size={18} />,
      label: 'Calculate Release',
      sub: 'Plan your releases',
      onClick: () => navigate('/calculate-release'),
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'View Analytics',
      sub: 'Monthly insights',
      onClick: () => navigate('/analytics'),
    },
    {
      icon: <Banknote size={18} />,
      label: 'Bank Accounts',
      sub: 'Manage your linked banks',
      onClick: () => navigate('/bank'),
    },
    {
      icon: <Plus size={18} />,
      label: 'Add Funds',
      sub: 'Add money to your balance',
      onClick: () => navigate('/add-funds'),
    },
    {
      icon: <History size={18} />,
      label: 'Transaction History',
      sub: 'View all transactions',
      onClick: () => navigate('/transactions'),
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
      onClick: () => navigate('/terms'),
    },
    {
      icon: <Shield size={18} />,
      label: 'Privacy Policy',
      sub: 'How we protect your data',
      onClick: () => navigate('/privacy'),
    },
    {
      icon: <HelpCircle size={18} />,
      label: 'Help & Support',
      onClick: () => navigate('/support'),
    },
  ]

  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'User'
  const email = userData.email || 'user@email.com'
  const profilePicture = userData.profilePicture || null
  const initial = fullName.charAt(0).toUpperCase()

  const showProfilePicture = Boolean(profilePicture) && !imageFailed

  return (
    <AppLayout>
      <div
        className="flex h-full flex-col"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Header */}
        <div
          className="shrink-0 border-b px-5 pt-4 pb-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
              }}
            >
              <ChevronLeft
                size={20}
                style={{ color: themeColors.charcoal }}
              />
            </button>

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
                  src={profilePicture!}
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

              <p
                className="text-[13px]"
                style={{ color: themeColors.mid }}
              >
                {email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/profile')}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Security Section */}
          <div>
            <p
              className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Security
            </p>

            <div
              className="overflow-hidden rounded-[16px] border"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              {securityItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-all hover:opacity-80"
                  style={{
                    borderBottom:
                      index < securityItems.length - 1
                        ? `1px solid ${themeColors.border}`
                        : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: themeColors.mid }}>
                      {item.icon}
                    </span>

                    <div className="text-left">
                      <p
                        className="text-[14px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        {item.label}
                      </p>

                      {item.sub && (
                        <p
                          className="text-[11px] font-semibold"
                          style={{ color: themeColors.green }}
                        >
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    style={{ color: themeColors.mid }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <p
              className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Settings
            </p>

            <div
              className="overflow-hidden rounded-[16px] border"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              {settingsItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-all hover:opacity-80"
                  style={{
                    borderBottom:
                      index < settingsItems.length - 1
                        ? `1px solid ${themeColors.border}`
                        : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: themeColors.mid }}>
                      {item.icon}
                    </span>

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
                          style={{ color: themeColors.mid }}
                        >
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    style={{ color: themeColors.mid }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Legal & Support Section */}
          <div>
            <p
              className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.05em]"
              style={{ color: themeColors.mid }}
            >
              Legal & Support
            </p>

            <div
              className="overflow-hidden rounded-[16px] border"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              {legalItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-all hover:opacity-80"
                  style={{
                    borderBottom:
                      index < legalItems.length - 1
                        ? `1px solid ${themeColors.border}`
                        : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: themeColors.mid }}>
                      {item.icon}
                    </span>

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
                          style={{ color: themeColors.mid }}
                        >
                          {item.sub}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    style={{ color: themeColors.mid }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-7 w-full cursor-pointer rounded-[14px] border-none px-4 py-3.5 text-[15px] font-semibold transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="h-4" />
        </div>
      </div>
    </AppLayout>
  )
}