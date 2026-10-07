import {
  ArrowLeft,
  CheckCircle,
  Frown,
  Info,
  Lightbulb,
  Meh,
  MessageSquare,
  Send,
  Smile,
  Star,
  ThumbsUp,
  Wand2,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import {
  submitFeedback,
  type FeedbackExperience,
  type FeedbackImprovement,
} from '../../services/app/feedback'

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const EXPERIENCE_OPTIONS = [
  { id: 'great', icon: Smile, label: 'Great', sub: 'Loving it' },
  { id: 'good', icon: ThumbsUp, label: 'Good', sub: 'Working well' },
  { id: 'okay', icon: Meh, label: 'Okay', sub: 'Could be better' },
  { id: 'poor', icon: Frown, label: 'Not great', sub: 'Needs work' },
] as const

const IMPROVEMENT_OPTIONS = [
  { id: 'features', icon: Wand2, label: 'New features' },
  { id: 'design', icon: MessageSquare, label: 'Look & feel' },
  { id: 'speed', icon: Wrench, label: 'Speed & reliability' },
  { id: 'wallets', icon: Lightbulb, label: 'Wallet rules' },
  { id: 'support', icon: MessageSquare, label: 'Help & support' },
  { id: 'other', icon: Lightbulb, label: 'Something else' },
] as const

const MAX_MESSAGE_LENGTH = 600

const DEFAULT_ACKNOWLEDGMENT =
  'Your feedback helps us make MOVA better for everyone. We read every message.'

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [experience, setExperience] = useState<string>('')
  const [improvements, setImprovements] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [acknowledgmentMessage, setAcknowledgmentMessage] =
    useState<string>(DEFAULT_ACKNOWLEDGMENT)

  const activeStar = hoverRating || rating

  const toggleImprovement = (id: string) => {
    setImprovements((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const canSubmit =
    rating > 0 ||
    experience !== '' ||
    improvements.length > 0 ||
    message.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await submitFeedback({
        rating,
        experience: (experience as FeedbackExperience) || '',
        improvements: improvements as FeedbackImprovement[],
        message: message.trim(),
      })

      if (response.is_success) {
        if (response.data?.acknowledgmentMessage) {
          setAcknowledgmentMessage(response.data.acknowledgmentMessage)
        }
        setSubmitted(true)
      }
      // Errors are already surfaced as toasts by the service.
    } catch (error) {
      console.error('Feedback submit failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /* -------------------------------------------------------------- */
  /*  Success state — matches PIN setup success screen              */
  /* -------------------------------------------------------------- */

  if (submitted) {
    return (
      <AppLayout>
        <section className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center px-6 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <CheckCircle
              size={40}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          <h1
            className="mt-5 text-[22px] font-extrabold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Thank you!
          </h1>

          <p
            className="mt-2 max-w-[300px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {acknowledgmentMessage}
          </p>

          <div className="mt-8 w-full max-w-[380px]">
            <Button type="button" onClick={() => navigate(-1)}>
              Okay
            </Button>
          </div>
        </section>
      </AppLayout>
    )
  }

  /* -------------------------------------------------------------- */
  /*  Form                                                           */
  /* -------------------------------------------------------------- */

  return (
    <AppLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col px-2 py-6"
        style={{ color: themeColors.charcoal }}
      >
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.charcoal,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => {
              const evt = new CustomEvent('showToast', {
                detail: {
                  type: 'info',
                  message:
                    'We read every message. Your feedback shapes what we build next.',
                },
              })
              window.dispatchEvent(evt)
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
            style={{
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              color: themeColors.mid,
            }}
            aria-label="What is this?"
          >
            <Info size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* Header icon */}
        <div className="flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <MessageSquare
              size={30}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>
        </div>

        <h1
          className="mt-5 text-center text-[24px] font-extrabold tracking-[-0.03em]"
          style={{ color: themeColors.charcoal }}
        >
          Help us improve
        </h1>

        <p
          className="mx-auto mt-2 max-w-[340px] text-center text-[14px] leading-[1.5]"
          style={{ color: themeColors.mid }}
        >
          Rate your experience, tell us what to work on, or share a suggestion.
        </p>

        {/* ---------------- Rating ---------------- */}
        <div
          className="mt-7 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Star size={16} style={{ color: themeColors.green }} />
            <p
              className="text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Rate your experience
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = value <= activeStar
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer p-1 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${value} out of 5`}
                >
                  <Star
                    size={30}
                    strokeWidth={1.6}
                    fill={filled ? themeColors.green : 'transparent'}
                    style={{
                      color: filled ? themeColors.green : themeColors.border,
                    }}
                  />
                </button>
              )
            })}
          </div>

          <p
            className="mt-2 text-center text-[12px] font-medium"
            style={{ color: themeColors.mid }}
          >
            {activeStar === 0 && 'Tap a star to rate'}
            {activeStar === 1 && 'We can do better'}
            {activeStar === 2 && 'Not quite there'}
            {activeStar === 3 && 'It is okay'}
            {activeStar === 4 && 'Pretty good'}
            {activeStar === 5 && 'Excellent!'}
          </p>
        </div>

        {/* ---------------- Experience ---------------- */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Smile size={16} style={{ color: themeColors.green }} />
            <p
              className="text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              How is MOVA treating you?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {EXPERIENCE_OPTIONS.map(({ id, icon: Icon, label, sub }) => {
              const isActive = experience === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setExperience(isActive ? '' : id)}
                  className="flex flex-col items-center gap-1.5 rounded-[14px] border px-3 py-3.5 transition-all hover:opacity-95 active:scale-[0.98]"
                  style={{
                    backgroundColor: isActive
                      ? themeColors.greenLight
                      : themeColors.background,
                    borderColor: isActive
                      ? themeColors.green
                      : themeColors.border,
                  }}
                >
                  <Icon
                    size={22}
                    style={{
                      color: isActive
                        ? themeColors.green
                        : themeColors.mid,
                    }}
                  />
                  <span
                    className="text-[13px] font-semibold"
                    style={{
                      color: isActive
                        ? themeColors.green
                        : themeColors.charcoal,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      color: isActive
                        ? themeColors.green
                        : themeColors.mid,
                    }}
                  >
                    {sub}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ---------------- What to improve ---------------- */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb size={16} style={{ color: themeColors.green }} />
            <p
              className="text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              What should we work on?
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {IMPROVEMENT_OPTIONS.map(({ id, icon: Icon, label }) => {
              const isActive = improvements.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleImprovement(id)}
                  className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all hover:opacity-95 active:scale-[0.97]"
                  style={{
                    backgroundColor: isActive
                      ? themeColors.greenLight
                      : themeColors.background,
                    borderColor: isActive
                      ? themeColors.green
                      : themeColors.border,
                    color: isActive
                      ? themeColors.green
                      : themeColors.charcoal,
                  }}
                >
                  <Icon
                    size={14}
                    style={{
                      color: isActive
                        ? themeColors.green
                        : themeColors.mid,
                    }}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ---------------- Message ---------------- */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Send size={16} style={{ color: themeColors.green }} />
            <p
              className="text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Tell us more
            </p>
          </div>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            rows={5}
            placeholder="Share a suggestion, report an issue, or tell us what you love."
            className="w-full resize-none rounded-[12px] border px-3 py-2.5 text-[14px] leading-[1.5] outline-none placeholder:opacity-60"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px]" style={{ color: themeColors.mid }}>
              Optional — but very helpful
            </span>

            <span
              className="text-[11px] font-medium"
              style={{
                color:
                  message.length >= MAX_MESSAGE_LENGTH
                    ? themeColors.red
                    : themeColors.mid,
              }}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-auto space-y-3 pt-8">
          <Button
            type="button"
            loading={isSubmitting}
            loadingText="Sending..."
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <span className="flex items-center justify-center gap-2">
              <Send size={16} strokeWidth={2.5} />
              Send feedback
            </span>
          </Button>

          <p
            className="text-center text-[12px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            We read every message. Thank you for helping us improve.
          </p>
        </div>
      </section>
    </AppLayout>
  )
}