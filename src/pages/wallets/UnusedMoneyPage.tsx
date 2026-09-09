import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

type UnusedOption = 'carry' | 'return' | 'keep'

interface Option {
  id: UnusedOption
  icon: string
  title: string
  desc: string
}

const options: Option[] = [
  {
    id: 'carry',
    icon: '↗️',
    title: 'Carry Forward',
    desc: "Add unused money to tomorrow's allowance.",
  },
  {
    id: 'return',
    icon: '🔒',
    title: 'Return to Wallet',
    desc: 'Move unused money back into the controlled balance.',
  },
  {
    id: 'keep',
    icon: '💸',
    title: 'Keep Available',
    desc: 'Leave unused money in the spending balance.',
  },
]

export default function UnusedMoneyPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [selected, setSelected] = useState<UnusedOption>('return')

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSavePreference = () => {
    console.log('Selected option:', selected)
    navigate('/dashboard')
  }

  return (
    <AppLayout>
      <div className="flex min-h-full flex-col py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
            Unused money
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <h2
            className="mb-6 text-[20px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            What should happen to unused money?
          </h2>

          {/* Summary Card */}
          <div
            className="mb-6 rounded-[16px] p-5"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <p
              className="mb-3.5 text-[14px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Today's Transport allowance
            </p>
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.background }}
              >
                <p className="mb-0.5 text-[11px]" style={{ color: themeColors.mid }}>
                  Released
                </p>
                <p
                  className="amount text-[18px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  {formatCurrency(1000)}
                </p>
              </div>
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.redBackground }}
              >
                <p className="mb-0.5 text-[11px]" style={{ color: themeColors.mid }}>
                  Spent
                </p>
                <p
                  className="amount text-[18px] font-bold"
                  style={{ color: themeColors.red }}
                >
                  {formatCurrency(700)}
                </p>
              </div>
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <p
                  className="mb-0.5 text-[11px] font-semibold"
                  style={{ color: themeColors.green }}
                >
                  Remaining
                </p>
                <p
                  className="amount text-[18px] font-bold"
                  style={{ color: themeColors.green }}
                >
                  {formatCurrency(300)}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-1 flex-col gap-2.5">
            {options.map((o) => {
              const isSelected = selected === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o.id)}
                  className="flex items-center gap-3 rounded-[16px] border-2 p-4 text-left transition-all duration-150"
                  style={{
                    backgroundColor: isSelected ? themeColors.greenLight : themeColors.background,
                    borderColor: isSelected ? themeColors.green : 'transparent',
                  }}
                >
                  <span className="shrink-0 text-[22px]">{o.icon}</span>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {o.title}
                    </p>
                    <p className="mt-0.5 text-[12px]" style={{ color: themeColors.mid }}>
                      {o.desc}
                    </p>
                  </div>
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: isSelected ? themeColors.green : themeColors.border,
                      backgroundColor: isSelected ? themeColors.green : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <Button onClick={handleSavePreference}>
              Save Preference
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}