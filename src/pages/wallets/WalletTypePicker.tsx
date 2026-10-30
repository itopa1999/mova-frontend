import { useNavigate } from 'react-router-dom'
import { Calendar, Shield, Users, ChevronRight, UserPlus, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { getCircleInviteDetails } from '../../services/app/createCircle'

export default function WalletTypePicker() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const sheet = useBottomSheet<'join-circle'>()
  const [inviteCode, setInviteCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinCircle = async () => {
    const code = inviteCode.trim()
    if (!code) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: 'Please enter an invite code.' },
        })
      )
      return
    }

    setIsJoining(true)
    try {
      const res = await getCircleInviteDetails(code)

      if (res.is_success && res.data) {
        sheet.close()
        setInviteCode('')
        navigate('/dashboard/circles/consent', {
          state: { inviteCode: code, circleDetails: res.data },
        })
      }
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mb-5 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <div>
            <h1
              className="text-[22px] font-bold tracking-[-0.02em]"
              style={{ color: themeColors.charcoal }}
            >
              Create a wallet
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: themeColors.mid }}>
              Choose how you want this money controlled
            </p>
          </div>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => sheet.open('join-circle')}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              borderColor: themeColors.green,
              color: themeColors.green,
              backgroundColor: isDark ? 'rgba(15, 185, 110, 0.05)' : 'rgba(15, 185, 110, 0.02)',
            }}
          >
            <UserPlus size={18} strokeWidth={2.2} />
            Have an invite code? Join a circle
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/create-wallet/scheduled')}
            className="group flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.985]"
            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.greenLight, color: themeColors.green }}
            >
              <Calendar size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
                  Scheduled wallet
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: themeColors.greenLight, color: themeColors.green }}
                >
                  Auto
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: themeColors.mid }}>
                Set an amount and a release schedule. Money becomes available on your
                chosen dates — no approval needed.
              </p>
              <p className="mt-2.5 text-[11px] leading-[1.5]" style={{ color: themeColors.light }}>
                <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>Good for:</span>{' '}
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
            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.trusteeLight, color: themeColors.trustee }}
            >
              <Shield size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
                  Trustee wallet
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: themeColors.trusteeLight, color: themeColors.trustee }}
                >
                  Needs approval
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: themeColors.mid }}>
                Every release needs approval from someone you trust before money moves
                out. Even you can't bypass it.
              </p>
              <p className="mt-2.5 text-[11px] leading-[1.5]" style={{ color: themeColors.light }}>
                <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>Good for:</span>{' '}
                shared money, joint funds, money you don't want to touch alone
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
            onClick={() => navigate('/dashboard/create-wallet/circle')}
            className="group flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.985]"
            style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.circleLight, color: themeColors.circle }}
            >
              <Users size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
                  Circle wallet
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: themeColors.circleLight, color: themeColors.circle }}
                >
                  Ajo · Group
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.55]" style={{ color: themeColors.mid }}>
                Pool money with people you trust. Each round, one member takes the full
                pot — rotates until everyone has received.
              </p>
              <p className="mt-2.5 text-[11px] leading-[1.5]" style={{ color: themeColors.light }}>
                <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>Good for:</span>{' '}
                ajo, esusu, family savings, group goals
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

      <BottomSheet
        isOpen={sheet.activeSheet === 'join-circle'}
        onClose={sheet.close}
        title="Join a Circle"
        icon={<UserPlus size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={handleJoinCircle}
            disabled={!inviteCode.trim() || isJoining}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            {isJoining ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Joining...
              </>
            ) : (
              'Join Circle'
            )}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] leading-[1.6]" style={{ color: themeColors.mid }}>
            Enter the invite code shared by the circle organizer to join.
          </p>

          <div>
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              Invitation Code
            </label>
            <div
              className="flex items-center rounded-[12px] border px-3 transition-all focus-within:ring-2"
              style={{
                borderColor: inviteCode ? themeColors.green : themeColors.border,
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                boxShadow: inviteCode ? `0 0 0 2px ${themeColors.green}40` : 'none',
              }}
            >
              <KeyRound size={18} style={{ color: themeColors.mid }} />
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. MOVA-ABC123"
                className="w-full border-0 bg-transparent py-3 pl-2 text-[15px] font-semibold tracking-wide outline-none"
                style={{ color: themeColors.charcoal }}
                maxLength={20}
              />
            </div>
          </div>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}