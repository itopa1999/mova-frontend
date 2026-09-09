import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  HelpCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  // Get user data from session
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'User'
  const email = userData.email || 'user@email.com'
  const phone = userData.phone || '+234 800 000 0000'
  const initial = fullName.charAt(0).toUpperCase()

  const [isRequesting, setIsRequesting] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  const handleRequestChange = async () => {
    if (!requestMessage.trim()) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Please describe what you want to change.',
        },
      })
      window.dispatchEvent(errorEvent)
      return
    }

    setIsRequesting(true)

    // Mock API call to submit change request
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsRequesting(false)
    setShowRequestForm(false)
    setRequestMessage('')

    const successEvent = new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: 'Your change request has been submitted! We\'ll review it shortly.',
      },
    })
    window.dispatchEvent(successEvent)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const memberSince = '2026-09-01'

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
          {/* Avatar */}
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-[40px] font-extrabold"
            style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
          >
            {initial}
          </div>

          {/* Name */}
          <h2
            className="mt-4 text-[22px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {fullName}
          </h2>

          {/* Email */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[14px]" style={{ color: themeColors.mid }}>
            <Mail size={16} />
            {email}
          </div>

          {/* Phone */}
          <div className="mt-1 flex items-center justify-center gap-2 text-[14px]" style={{ color: themeColors.mid }}>
            <Phone size={16} />
            {phone}
          </div>

          {/* Member Since */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px]" style={{ color: themeColors.light }}>
            <Calendar size={14} />
            Member since {formatDate(memberSince)}
          </div>

          {/* Request Change Button */}
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

          {/* Request Form */}
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
                className="min-h-[80px] w-full rounded-[14px] border bg-transparent px-4 py-3 text-[14px] outline-none transition-all resize-none focus:ring-2"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                  ringColor: themeColors.green,
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

        {/* Info Message */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <Shield size={18} style={{ color: themeColors.green }} className="mt-0.5 shrink-0" />
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
              <Clock size={16} style={{ color: themeColors.warning }} />
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                PIN Not Set
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}