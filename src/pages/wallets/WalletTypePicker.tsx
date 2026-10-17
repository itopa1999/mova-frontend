import { useNavigate } from 'react-router-dom'
import { Calendar, Shield, ChevronRight } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function WalletTypePicker() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mb-6 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <div>
            <h1
              className="text-[22px] font-bold tracking-[-0.02em]"
              style={{ color: themeColors.charcoal }}
            >
              Create a wallet
            </h1>
            <p
              className="mt-0.5 text-[13px]"
              style={{ color: themeColors.mid }}
            >
              Choose how you want this money controlled
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/create-wallet/scheduled')}
            className="group flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.985]"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <Calendar size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Scheduled wallet
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.2)'
                      : 'rgba(15, 185, 110, 0.1)',
                    color: themeColors.green,
                  }}
                >
                  Auto
                </span>
              </div>

              <p
                className="mt-1.5 text-[12.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                Set an amount and a release schedule. Money becomes available on
                your chosen dates — no approval needed.
              </p>

              <p
                className="mt-2.5 text-[11px] leading-[1.5]"
                style={{ color: themeColors.light }}
              >
                <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
                  Good for:
                </span>{' '}
                rent, transport, allowances, recurring bills
              </p>
            </div>

            <ChevronRight
              size={18}
              className="mt-3 shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: themeColors.mid }}
            />
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/create-wallet/trustee')}
            className="group flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.985]"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.08)',
                color: '#60A5FA',
              }}
            >
              <Shield size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Trustee wallet
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(96, 165, 250, 0.2)'
                      : 'rgba(96, 165, 250, 0.1)',
                    color: '#60A5FA',
                  }}
                >
                  Needs approval
                </span>
              </div>

              <p
                className="mt-1.5 text-[12.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                Every release needs approval from someone you trust before
                money moves out. Even you can't bypass it.
              </p>

              <p
                className="mt-2.5 text-[11px] leading-[1.5]"
                style={{ color: themeColors.light }}
              >
                <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
                  Good for:
                </span>{' '}
                shared money, joint funds, money you don't want to touch alone
              </p>
            </div>

            <ChevronRight
              size={18}
              className="mt-3 shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: themeColors.mid }}
            />
          </button>
        </div>
      </div>
    </AppLayout>
  )
}