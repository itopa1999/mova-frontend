import {
  ArrowLeft,
  User,
  Banknote,
  Wand2,
  Calculator,
  BarChart3,
  Receipt,
  Plus,
  Coins,
  Target,
  Wallet,
  RefreshCw,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Lock,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

// ─── Types ────────────────────────────────────────────
interface ServiceItem {
  icon: LucideIcon
  label: string
  description: string
  path: string
  color: string
  comingSoon?: boolean
}

interface ServiceSection {
  title: string
  items: ServiceItem[]
}

// ─── Service catalog ──────────────────────────────────
const SERVICE_SECTIONS: ServiceSection[] = [
  {
    title: 'Money',
    items: [
      {
        icon: Plus,
        label: 'Add Funds',
        description: 'Top up your Mova main balance',
        path: '/add-funds',
        color: '#34D399',
      },
      {
        icon: Target,
        label: 'New Wallet',
        description: 'Create a controlled wallet with a schedule',
        path: '/create-wallet',
        color: '#F59E0B',
      },
      {
        icon: Coins,
        label: 'Releases',
        description: 'See everything released from your wallets',
        path: '/releases',
        color: '#ee1053',
      },
      {
        icon: Banknote,
        label: 'Bank Accounts',
        description: 'Manage the banks you send money to',
        path: '/bank',
        color: '#60A5FA',
      },
    ],
  },
  {
    title: 'Coming soon',
    items: [
      {
        icon: Lock,
        label: 'Trustee Wallet',
        description: 'A wallet that needs a trustee to approve every release',
        path: '/trustee-wallets',
        color: '#8B5CF6',
        comingSoon: true,
      },
    ],
  },
  {
    title: 'Plan & Analyze',
    items: [
      {
        icon: Wand2,
        label: 'Templates',
        description: 'Start with a prefilled wallet — edit anything',
        path: '/templates',
        color: '#A78BFA',
      },
      {
        icon: Calculator,
        label: 'Calculate Release',
        description: 'Preview any schedule before you commit',
        path: '/calculate-release',
        color: '#F472B6',
      },
      {
        icon: BarChart3,
        label: 'Analytics',
        description: 'Track protection, releases, and spending',
        path: '/analytics',
        color: '#FBBF24',
      },
      {
        icon: Receipt,
        label: 'Transactions',
        description: 'Full history of every money movement',
        path: '/transactions',
        color: '#38BDF8',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        icon: User,
        label: 'Profile',
        description: 'Your details, PIN, and preferences',
        path: '/profile',
        color: '#4ADE80',
      },
      {
        icon: Bell,
        label: 'Notifications',
        description: 'Choose what you want to hear about',
        path: '/profile',
        color: '#F59E0B',
      },
      {
        icon: Shield,
        label: 'Security & PIN',
        description: 'Manage your transaction PIN',
        path: '/pin-gate',
        color: '#EF4444',
      },
      {
        icon: Settings,
        label: 'Settings',
        description: 'App preferences and account controls',
        path: '/settings',
        color: '#9CA3AF',
      },
    ],
  },
  {
    title: 'Help & Legal',
    items: [
      {
        icon: Wallet,
        label: 'Wallets',
        description: 'Browse all your controlled wallets',
        path: '/wallets',
        color: '#4ADE80',
      },
      {
        icon: RefreshCw,
        label: 'Automation',
        description: 'See wallets that refill themselves',
        path: '/wallets',
        color: '#8B5CF6',
      },
      {
        icon: HelpCircle,
        label: 'How It Works',
        description: 'A walkthrough of Mova in 30 seconds',
        path: '/how-it-works',
        color: '#60A5FA',
      },
      {
        icon: FileText,
        label: 'Terms & Privacy',
        description: 'What you agree to when you use Mova',
        path: '/terms',
        color: '#A78BFA',
      },
    ],
  },
]

export default function ServicesPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              All Services
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Everything you can do in Mova
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SERVICE_SECTIONS.map((section) => (
            <section key={section.title}>
              <p
                className="mb-3 text-[12px] font-semibold uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                {section.title}
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="relative flex cursor-pointer flex-col items-start rounded-[14px] border p-3 text-left transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                        boxShadow: isDark
                          ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                          : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Coming soon badge */}
                      {item.comingSoon && (
                        <div
                          className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                          style={{
                            backgroundColor: isDark
                              ? `${item.color}26`
                              : `${item.color}14`,
                          }}
                        >
                          <Sparkles
                            size={8}
                            strokeWidth={2.4}
                            style={{ color: item.color }}
                          />
                          <span
                            className="text-[7px] font-bold uppercase tracking-wide"
                            style={{ color: item.color }}
                          >
                            Soon
                          </span>
                        </div>
                      )}

                      <div
                        className="mb-2 flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{
                          backgroundColor: isDark
                            ? `${item.color}20`
                            : `${item.color}12`,
                          color: item.color,
                        }}
                      >
                        <Icon size={17} strokeWidth={2} />
                      </div>

                      <p
                        className="text-[11px] font-semibold leading-tight"
                        style={{ color: themeColors.charcoal }}
                      >
                        {item.label}
                      </p>

                      <p
                        className="mt-1 text-[9.5px] leading-[1.4]"
                        style={{ color: themeColors.mid }}
                      >
                        {item.description}
                      </p>

                      <ChevronRight
                        size={12}
                        style={{
                          color: themeColors.mid,
                          marginTop: 6,
                          opacity: 0.5,
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="mt-8 rounded-[14px] border p-4"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="text-center text-[12px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Missing something? Tell us what you want next at{' '}
            <a
              href="mailto:hello@mova.app"
              className="font-medium underline"
              style={{ color: themeColors.green }}
            >
              hello@mova.app
            </a>
          </p>
        </div>

        <div className="h-6" />
      </div>
    </AppLayout>
  )
}