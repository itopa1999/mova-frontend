import {
  HelpCircle,
  Info,
  FileText,
  ShieldCheck,
  Cookie,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const sections = [
    {
      title: 'Information We Collect',
      content:
        'MOVA may collect information you provide when registering, verifying your identity, using our services, or contacting support. This may include your name, email address, phone number, account identifiers, verification information, and financial or transaction information required to provide our services. Where relevant, we may also collect wallet configurations, target amounts, release amounts, schedules, automation settings, transaction history, and template selections. We aim to collect information that is relevant and necessary for the purposes described in this policy.',
    },
    {
      title: 'How We Use Your Information',
      content:
        'We use personal information to create and manage accounts, provide wallet functionality, process eligible transactions, execute configured automation rules, display transaction records, provide customer support, improve reliability, investigate reported problems, prevent fraud, maintain security, and comply with applicable legal obligations. Where automation is enabled, relevant wallet settings and balance information may be processed to determine whether a configured rule can be executed.',
    },
    {
      title: 'Legal Basis for Processing',
      content:
        'Where required by applicable data protection law, MOVA processes personal information on a lawful basis. Depending on the circumstances, this may include providing services you request, complying with legal obligations, pursuing legitimate interests such as security and fraud prevention, or obtaining your consent where required. When processing relies on consent, you may withdraw that consent. Withdrawal does not make earlier lawful processing unlawful and may affect features that depend on the consent you withdraw.',
    },
    {
      title: 'Financial and Transaction Information',
      content:
        'When you fund an account, configure a wallet, request a withdrawal, or make an eligible payment, MOVA may process transaction references, amounts, timestamps, transaction statuses, payment method details, beneficiary information, and related records. We may retain information about pending, failed, reversed, or disputed transactions to investigate problems and maintain accurate records. Banks and payment providers may independently process your information under their own privacy notices and legal obligations.',
    },
    {
      title: 'Wallets and Automation Settings',
      content:
        'Where available, MOVA stores wallet rules and automation settings you configure, including refill triggers, amounts, schedules, minimum-balance restrictions, renewal limits, and enabled or paused status. We process this information to apply your confirmed settings, display your configuration, maintain relevant activity records, and investigate transaction issues. If you use templates, we may record your selected template and related configuration for service operation and improvement.',
    },
    {
      title: 'Payment Providers and Third Parties',
      content:
        'MOVA may share relevant information with payment processors, banks, identity-verification providers, hosting providers, security providers, and other service providers where necessary to deliver services, process transactions, verify information, protect accounts, or comply with legal obligations. We aim to limit shared information to what is reasonably necessary. Third-party providers may process information under their own privacy policies. MOVA does not sell your personal information.',
    },
    {
      title: 'Cookies and Similar Technologies',
      content:
        'MOVA may use cookies or similar technologies to maintain sessions, protect accounts, remember preferences, and support application functionality. Necessary cookies are used where required for the service to function securely. Optional analytics, advertising, or other non-essential tracking technologies will only be used where applicable law requires and the relevant consent has been obtained. The technologies actually used depend on the features enabled in MOVA. We will not describe a tracking technology as active if MOVA does not use it.',
    },
    {
      title: 'Cookie Consent and Your Choices',
      content:
        'Where required, MOVA will display a clear cookie notice and obtain your consent before activating non-essential cookies or similar tracking technologies. You can accept all optional cookies, reject optional cookies, or manage your preferences through the available consent controls. Necessary cookies may remain active where they are required for security or core functionality. You can change or withdraw your optional cookie consent at any time through Cookie Settings, where available. Withdrawing consent does not affect processing that occurred lawfully before withdrawal. Browser settings may also allow you to delete or block cookies, although doing so may affect some features.',
    },
    {
      title: 'Data Security',
      content:
        'MOVA uses appropriate technical and organisational safeguards designed to protect personal information against unauthorized access, loss, alteration, misuse, or disclosure. Safeguards may include access controls, authentication, restricted permissions, monitoring, secure communications, and protected storage. No internet-based service can guarantee absolute security. You are responsible for safeguarding your password, transaction PIN, devices, and authentication credentials. Contact us promptly if you suspect unauthorized access to your account.',
    },
    {
      title: 'Data Sharing and Legal Disclosures',
      content:
        'We may disclose relevant information when necessary to provide our services, comply with a lawful request or legal obligation, investigate suspected fraud, protect users, enforce our terms, or establish or defend legal claims. We assess requests and disclosures in accordance with applicable law. We do not promise that personal information will never be disclosed to a government authority; disclosures may be required by law or valid legal process.',
    },
    {
      title: 'International Data Transfers',
      content:
        'Some service providers may process or store information outside Nigeria. Where personal data is transferred internationally, MOVA will apply the safeguards and transfer requirements required by applicable data protection law. The protections available may depend on the destination, the service provider, and the legal mechanism used for the transfer.',
    },
    {
      title: 'Data Retention',
      content:
        'We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including service delivery, security, dispute resolution, accounting, and compliance with legal obligations. Transaction records may need to be retained after an account is closed. Retention periods depend on the type of information, its purpose, and applicable requirements. When information is no longer required, we will take appropriate steps to delete it or securely dispose of it, subject to applicable law.',
    },
    {
      title: 'Your Data Protection Rights',
      content:
        'Subject to applicable law, you may have the right to request access to your personal information, correct inaccurate information, request deletion, restrict or object to certain processing, request data portability, and withdraw consent where processing relies on consent. You may also have the right to raise a complaint with the relevant data protection authority. These rights are subject to applicable conditions and exceptions. For example, some financial or transaction records may need to be retained even after an account is closed.',
    },
    {
      title: 'Account Closure and Data Deletion',
      content:
        'You may request account closure or deletion of personal information through the available account controls or by contacting support. We will assess and process your request in accordance with applicable law. Closing your account does not necessarily result in the immediate deletion of every record, particularly where retention is legally required or necessary to resolve a dispute, investigate fraud, or protect legal rights. We will not retain information longer than permitted or necessary for an applicable purpose.',
    },
    {
      title: 'Children and Age Restrictions',
      content:
        'MOVA is intended for individuals who are at least 18 years old. Individuals under 18 are not permitted to register for or use MOVA. We do not knowingly seek to collect personal information from children through an account that is not eligible to use the service. If you believe a person under 18 has provided personal information to MOVA, contact us so we can review the matter and take appropriate action in accordance with applicable law.',
    },
    {
      title: 'Privacy Incidents',
      content:
        'If we identify a personal data breach, we will assess the incident and take appropriate steps to contain it, investigate its impact, and reduce further risk. We will notify the relevant authority and affected individuals where required by applicable law. If you suspect a privacy or security incident involving your account, contact us promptly and provide details that may help us investigate.',
    },
    {
      title: 'Changes to This Privacy Policy',
      content:
        'We may update this Privacy Policy when our services, data practices, service providers, or legal obligations change. We will publish the updated policy and communicate material changes through appropriate channels where required. The updated version will state its effective date. Where the law requires consent for a new processing purpose, we will seek that consent before undertaking the relevant processing.',
    },
    {
      title: 'Contact and Privacy Complaints',
      content:
        'For privacy questions, access or deletion requests, cookie preferences, or complaints, contact us through the official support channel published in the MOVA application or on the official MOVA website. You may also contact the relevant data protection authority if you believe your rights have been infringed. Please do not include your password, transaction PIN, or other secret authentication credentials in your message.',
    },
  ]

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
        <div className="mb-6 flex items-center gap-3">
          <BackButton
            onClick={() => navigate(-1)}
            variant="subtle"
          />

          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Privacy Policy
          </h1>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border p-4">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0"
            style={{ color: themeColors.green }}
          />

          <div>
            <h2
              className="mb-1 text-sm font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Your privacy matters
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              This policy explains how MOVA collects, uses, shares,
              protects, and retains personal information, including
              your choices about optional cookies and tracking.
            </p>
          </div>
        </div>

        <p
          className="mb-6 text-sm"
          style={{ color: themeColors.mid }}
        >
          Last updated: October 2026
        </p>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="flex items-start gap-4"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="mb-2 text-base font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {section.title}
                </h2>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: themeColors.mid }}
                >
                  {section.content}
                </p>

                {section.title === 'Cookie Consent and Your Choices' && (
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new Event('mova:open-cookie-settings'),
                      )
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{
                      color: themeColors.charcoal,
                      borderColor: themeColors.border,
                    }}
                  >
                    <Cookie
                      size={16}
                      style={{ color: themeColors.green }}
                    />
                    Manage cookie preferences
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.mid }}
          >
            Related
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <FileText
                  size={16}
                  style={{ color: themeColors.green }}
                />
                Terms & Conditions
              </span>

              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/how-it-works')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <HelpCircle
                  size={16}
                  style={{ color: themeColors.green }}
                />
                How it works
              </span>

              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/about')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <Info
                  size={16}
                  style={{ color: themeColors.green }}
                />
                About MOVA
              </span>

              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}