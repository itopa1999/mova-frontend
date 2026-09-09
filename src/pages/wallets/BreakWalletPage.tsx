import { ChevronLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function BreakWalletPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleRequestWithdrawal = () => {
    console.log('Withdrawal requested')
    navigate('/dashboard')
  }

  const handleKeepProtected = () => {
    console.log('Keep money protected')
    navigate('/dashboard')
  }

  return (
    <AppLayout>
      <div className="flex min-h-full flex-col" style={{ color: themeColors.charcoal }}>
        {/* Warning Header */}
        <div
          className="shrink-0 border-b px-5 pb-5 pt-12"
          style={{
            backgroundColor: '#FFF8F0',
            borderColor: '#FDDCB5',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            >
              <ChevronLeft size={22} style={{ color: themeColors.charcoal }} />
            </button>
            <div
              className="rounded-[10px] p-2"
              style={{ backgroundColor: '#FEE8C8' }}
            >
              <Shield size={20} style={{ color: themeColors.warning }} />
            </div>
            <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
              Break this wallet?
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Wallet Info Card */}
          <div
            className="mb-5 rounded-[16px] p-5"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
              borderLeft: `4px solid ${themeColors.warning}`,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[18px]"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                🚕
              </div>
              <div>
                <p className="text-[16px] font-bold" style={{ color: themeColors.charcoal }}>
                  Transport
                </p>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase"
                  style={{
                    backgroundColor: `${themeColors.warning}20`,
                    color: themeColors.warning,
                  }}
                >
                  Protected
                </span>
              </div>
            </div>
            <p className="mb-2 text-[13px]" style={{ color: themeColors.mid }}>
              Protected amount
            </p>
            <p
              className="amount text-[28px] font-extrabold"
              style={{ color: themeColors.charcoal }}
            >
              {formatCurrency(22000)}
            </p>
          </div>

          {/* Warning Message */}
          <div
            className="mb-4 rounded-[14px] p-4"
            style={{ backgroundColor: themeColors.warningBackground }}
          >
            <p
              className="mb-1 text-[14px] font-semibold"
              style={{ color: '#92400E' }}
            >
              ⚠️ This money was protected for your transport budget.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#92400E' }}>
              To help prevent impulse decisions, withdrawals from this wallet have
              a cooling-off period.
            </p>
          </div>

          {/* Withdrawal Details */}
          <div
            className="mb-6 rounded-[16px] p-5"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[14px]" style={{ color: themeColors.mid }}>
                Withdrawal requested
              </p>
              <p
                className="amount text-[16px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(10000)}
              </p>
            </div>
            <div
              className="mb-3.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[14px]" style={{ color: themeColors.mid }}>
                Available after
              </p>
              <div
                className="rounded-[8px] px-2.5 py-1"
                style={{ backgroundColor: themeColors.warningBackground }}
              >
                <p className="text-[14px] font-bold" style={{ color: themeColors.warning }}>
                  24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRequestWithdrawal}
              className="w-full rounded-[14px] border-none px-4 py-4 text-[16px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: themeColors.warning,
                color: '#FFFFFF',
              }}
            >
              Request Withdrawal
            </button>

            <Button variant="secondary" onClick={handleKeepProtected}>
              Keep My Money Protected
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}