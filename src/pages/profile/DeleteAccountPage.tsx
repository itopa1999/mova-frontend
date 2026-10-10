import { useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function DeleteAccountPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [status, setStatus] = useState('')

  const canSubmit =
    understood && confirmation.trim() === 'DELETE'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) return

    // TODO: Connect this form to the account deletion API.
    // Do not delete the account directly from the frontend.
    // The backend must authenticate the user, verify the request,
    // handle pending transactions and apply retention requirements.

    setStatus(
      'Account deletion is not connected yet. No deletion request has been submitted, and your account remains unchanged.',
    )
  }

  const cardStyle = {
    backgroundColor: themeColors.card,
    borderColor: themeColors.border,
  }

  const headingStyle = {
    color: themeColors.charcoal,
  }

  const mutedStyle = {
    color: themeColors.mid,
  }

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <BackButton
            onClick={() => navigate(-1)}
            variant="subtle"
          />

          <div>
            <h1
              className="text-xl font-bold"
              style={headingStyle}
            >
              Delete account
            </h1>

            <p
              className="mt-0.5 text-xs"
              style={mutedStyle}
            >
              Manage your MOVA account
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
            <Trash2
              size={22}
              className="text-red-600 dark:text-red-400"
            />
          </div>

          <h2 className="mb-2 text-lg font-bold text-red-900 dark:text-red-300">
            Are you sure you want to leave MOVA?
          </h2>

          <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">
            Deleting your account will begin the process of
            closing your MOVA account. This action may affect
            your wallet configurations, automation settings,
            and access to your account history.
          </p>

          <p className="mt-3 text-sm font-medium leading-relaxed text-red-800 dark:text-red-200">
            Please review the information below before
            continuing.
          </p>
        </div>

        {/* Before you delete */}
        <div className="mb-7">
          <h2
            className="mb-4 text-base font-semibold"
            style={headingStyle}
          >
            Before you delete your account
          </h2>

          <div className="space-y-3">
            <div
              className="flex items-start gap-3 rounded-xl border p-4"
              style={cardStyle}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                <Wallet
                  size={19}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <div>
                <h3
                  className="mb-1 text-sm font-semibold"
                  style={headingStyle}
                >
                  Wallets and automation
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={mutedStyle}
                >
                  Your wallet configurations and automation
                  settings may no longer be accessible after
                  closure. Outstanding transactions must be
                  reviewed and handled before closure is
                  completed.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 rounded-xl border p-4"
              style={cardStyle}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                <Clock
                  size={19}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>

              <div>
                <h3
                  className="mb-1 text-sm font-semibold"
                  style={headingStyle}
                >
                  Pending transactions
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={mutedStyle}
                >
                  Check for pending deposits, withdrawals,
                  transfers, or utility payments. Closing an
                  account does not automatically cancel or
                  resolve transactions already in progress.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 rounded-xl border p-4"
              style={cardStyle}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                <FileText
                  size={19}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div>
                <h3
                  className="mb-1 text-sm font-semibold"
                  style={headingStyle}
                >
                  Financial records and personal data
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={mutedStyle}
                >
                  We will handle your personal information
                  according to our Privacy Policy. Certain
                  financial, transaction, or compliance records
                  may need to be retained where required by law
                  or otherwise lawfully necessary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance */}
        <div
          className="mb-7 flex items-start gap-3 rounded-xl border p-4"
          style={cardStyle}
        >
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0"
            style={{ color: themeColors.green }}
          />

          <div>
            <h3
              className="mb-1 text-sm font-semibold"
              style={headingStyle}
            >
              Your request will be reviewed
            </h3>

            <p
              className="text-sm leading-relaxed"
              style={mutedStyle}
            >
              Account closure should be handled securely.
              Additional verification may be required, and
              the process may take time if transactions or
              legal retention obligations remain unresolved.
            </p>
          </div>
        </div>

        {/* Deletion form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="deletion-reason"
              className="mb-2 block text-sm font-semibold"
              style={headingStyle}
            >
              Why are you leaving?
              <span
                className="ml-2 text-xs font-normal"
                style={mutedStyle}
              >
                Optional
              </span>
            </label>

            <select
              id="deletion-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-600"
              style={{
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
                borderColor: themeColors.border,
              }}
            >
              <option value="">Select a reason</option>
              <option value="not-needed">
                I no longer need MOVA
              </option>
              <option value="difficult">
                MOVA is difficult to use
              </option>
              <option value="features">
                Missing features
              </option>
              <option value="privacy">
                Privacy or security concerns
              </option>
              <option value="other-service">
                I use another service
              </option>
              <option value="other">
                Other reason
              </option>
            </select>

            <p
              className="mt-2 text-xs"
              style={mutedStyle}
            >
              Your feedback helps us improve MOVA.
            </p>
          </div>

          {/* Explicit acknowledgement */}
          <label
            className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4"
            style={cardStyle}
          >
            <input
              type="checkbox"
              checked={understood}
              onChange={(event) =>
                setUnderstood(event.target.checked)
              }
              className="mt-1 h-4 w-4 shrink-0 accent-red-600"
            />

            <span
              className="text-sm leading-relaxed"
              style={headingStyle}
            >
              I understand that closing my account may affect
              my access to MOVA, and that some financial or
              transaction records may be retained where
              legally required.
            </span>
          </label>

          {/* Typed confirmation */}
          <div className="mb-6">
            <label
              htmlFor="delete-confirmation"
              className="mb-2 block text-sm font-semibold"
              style={headingStyle}
            >
              Confirm account deletion
            </label>

            <p
              className="mb-3 text-sm leading-relaxed"
              style={mutedStyle}
            >
              Type{' '}
              <span
                className="font-bold"
                style={headingStyle}
              >
                DELETE
              </span>{' '}
              in the field below to confirm that you want to
              proceed.
            </p>

            <input
              id="delete-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              placeholder="Type DELETE"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
              style={{
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
                borderColor: themeColors.border,
              }}
            />
          </div>

          {/* Prototype status */}
          {status && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
            >
              {status}
            </div>
          )}

          {/* Destructive action */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          >
            <Trash2 size={17} />
            Request account deletion
            <ArrowRight size={17} />
          </button>

          <p
            className="mt-3 text-center text-xs leading-relaxed"
            style={mutedStyle}
          >
            Your account will not be deleted by this screen
            until the deletion request is connected to and
            processed by MOVA's backend.
          </p>
        </form>

        {/* Cancel action */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-75"
          style={{
            color: themeColors.charcoal,
            borderColor: themeColors.border,
          }}
        >
          <CheckCircle2 size={17} />
          Keep my account
        </button>

        {/* Support */}
        <div className="mt-8 text-center">
          <div className="mb-2 flex justify-center">
            <AlertTriangle
              size={18}
              style={{ color: themeColors.mid }}
            />
          </div>

          <p
            className="text-sm font-medium"
            style={headingStyle}
          >
            Need help before deciding?
          </p>

          <p
            className="mt-1 text-sm leading-relaxed"
            style={mutedStyle}
          >
            Contact MOVA support if you have questions about
            your account, pending transactions, or personal data.
          </p>

          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="mt-3 text-sm font-semibold underline underline-offset-4"
            style={{ color: themeColors.green }}
          >
            Read our Privacy Policy
          </button>
        </div>
      </section>
    </AuthLayout>
  )
}