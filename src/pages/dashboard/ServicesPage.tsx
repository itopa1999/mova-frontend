import {
  Plus,
  Target,
  Shield,
  Banknote,
  Wand2,
  Calculator,
  BarChart3,
  Receipt,
  Coins,
  UserCheck,
  Users,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

/* ───────────── Types ───────────── */

interface ServiceItem {
  icon: LucideIcon
  label: string
  description: string
  path: string
  color: string
}

interface ServiceSection {
  title: string
  items: ServiceItem[]
}

/* ───────────── Service catalog ───────────── */

const SERVICE_SECTIONS: ServiceSection[] = [
  {
    title: 'Money',
    items: [
      {
        icon: Plus,
        label: 'Add Funds',
        description: 'Top up your Mova main balance',
        path: '/dashboard/add-funds',
        color: '#34D399',
      },
      {
        icon: Target,
        label: 'New Wallet',
        description: 'Create a scheduled wallet',
        path: '/dashboard/create-wallet',
        color: '#F59E0B',
      },
      {
        icon: Shield,
        label: 'Trustee Wallet',
        description: 'Every release needs approval',
        path: '/dashboard/create-wallet/trustee',
        color: '#8B5CF6',
      },
      {
        icon: Users,
        label: 'Savings Circle',
        description: 'Save together — one member takes the pot',
        path: '/dashboard/create-wallet/circle',
        color: '#8B5CF6',
      },
      {
        icon: CircleDollarSign,
        label: 'My Circles',
        description: 'See all your active and draft circles',
        path: '/dashboard/wallets',
        color: '#A78BFA',
      },
      {
        icon: Banknote,
        label: 'Bank Accounts',
        description: 'Manage the banks you send to',
        path: '/dashboard/bank',
        color: '#60A5FA',
      },
    ],
  },
  {
    title: 'Tools & Activity',
    items: [
      {
        icon: Wand2,
        label: 'Templates',
        description: 'Start with a prefilled wallet',
        path: '/dashboard/templates',
        color: '#A78BFA',
      },
      {
        icon: Calculator,
        label: 'Calculate Release',
        description: 'Preview any schedule first',
        path: '/dashboard/calculate-release',
        color: '#F472B6',
      },
      {
        icon: BarChart3,
        label: 'Analytics',
        description: 'See money held, released, and spent',
        path: '/dashboard/analytics',
        color: '#FBBF24',
      },
      {
        icon: Receipt,
        label: 'Transactions',
        description: 'Full history of money movements',
        path: '/dashboard/transactions',
        color: '#38BDF8',
      },
      {
        icon: Coins,
        label: 'Releases',
        description: 'Everything released from your wallets',
        path: '/dashboard/releases',
        color: '#ee1053',
      },
      {
        icon: UserCheck,
        label: 'Trustees',
        description: 'Manage the people who approve releases',
        path: '/dashboard/trustees',
        color: '#8B5CF6',
      },
    ],
  },
]

/* ───────────── Page ───────────── */

export default function ServicesPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Services
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
                className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                {section.title}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="flex cursor-pointer flex-col items-start rounded-[16px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                        boxShadow: isDark
                          ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                          : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        className="mb-3 flex h-11 w-11 items-center justify-center rounded-[12px]"
                        style={{
                          backgroundColor: isDark
                            ? `${item.color}26`
                            : `${item.color}14`,
                          color: item.color,
                        }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>

                      <p
                        className="text-[13px] font-semibold leading-tight"
                        style={{ color: themeColors.charcoal }}
                      >
                        {item.label}
                      </p>

                      <p
                        className="mt-1 text-[11px] leading-[1.45]"
                        style={{ color: themeColors.mid }}
                      >
                        {item.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}