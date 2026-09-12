import {
  ArrowLeft,
  Mail,
  Phone,
  HelpCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I create a wallet?',
    answer: 'Go to the Wallets page and tap the "Create Wallet" button. Enter a name, target amount, and choose your release schedule.',
  },
  {
    id: 2,
    question: 'How does the controlled wallet work?',
    answer: 'Controlled wallets lock your money and release it in small amounts based on your schedule (daily, weekly, or monthly). This helps you stick to your budget.',
  },
  {
    id: 3,
    question: 'What happens to unused money?',
    answer: 'Unused money can be carried forward to the next day, returned to your main wallet, or kept available for spending.',
  },
  {
    id: 4,
    question: 'How do I add funds?',
    answer: 'Tap the "Add Funds" button on your Dashboard. Choose a payment gateway (Monnify, Paystack, or Flutterwave) and enter the amount.',
  },
  {
    id: 5,
    question: 'Is my money safe?',
    answer: 'Yes! MOVA uses bank-level encryption and security measures to protect your funds and personal information.',
  },
]

export default function SupportPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const supportOptions = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@mova.com',
      action: () => window.open('mailto:support@mova.com'),
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+234 800 000 0000',
      action: () => window.open('tel:+2348000000000'),
    },
  ]

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
          <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
            Help & Support
          </h1>
        </div>

        {/* Contact Options */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {supportOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <button
                key={index}
                type="button"
                onClick={option.action}
                className="flex flex-col items-center rounded-[16px] border p-4 text-center transition-all hover:opacity-80 active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                    color: themeColors.green,
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <p
                  className="text-[11px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {option.label}
                </p>
                <p
                  className="mt-0.5 text-[10px]"
                  style={{ color: themeColors.mid }}
                >
                  {option.value}
                </p>
              </button>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle size={18} style={{ color: themeColors.green }} />
            <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
              Frequently Asked Questions
            </p>
          </div>

          <div
            className="overflow-hidden rounded-[16px] border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            {faqs.map((faq, index) => {
              const isExpanded = expandedFAQ === faq.id
              return (
                <div
                  key={faq.id}
                  style={{
                    borderBottom:
                      index < faqs.length - 1
                        ? `1px solid ${themeColors.border}`
                        : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-all hover:opacity-80"
                  >
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      {faq.question}
                    </span>
                    <ChevronRight
                      size={18}
                      style={{
                        color: themeColors.mid,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <p
                        className="text-[13px] leading-relaxed"
                        style={{ color: themeColors.mid }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="rounded-[16px] border p-4" style={{ borderColor: themeColors.border }}>
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <Sparkles size={16} style={{ color: themeColors.green }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                Quick Tip
              </p>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Most issues can be resolved by checking our FAQ section above.
                For urgent matters, please call our support line.
              </p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Clock size={14} style={{ color: themeColors.mid }} />
          <p className="text-[11px]" style={{ color: themeColors.mid }}>
            Response time: Usually within 2-4 hours
          </p>
          <CheckCircle size={14} style={{ color: themeColors.green }} />
        </div>
      </div>
    </AppLayout>
  )
}