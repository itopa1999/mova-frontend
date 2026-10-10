import {
  HelpCircle,
  Info,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function TermsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const sections = [
    {
      title: 'Acceptance of Terms',
      content:
        'By creating an account or using MOVA, you agree to these Terms & Conditions and applicable policies referenced in this document. If you do not agree, you must stop using MOVA. These terms apply to your use of the application, website, wallets, automation features, and other services provided by MOVA.',
    },
    {
      title: 'Eligibility and Age Requirement',
      content:
        'You must be at least 18 years old and legally capable of entering into a binding agreement to register for or use MOVA. Individuals under 18 years of age are not permitted to use the service. By registering, you confirm that you meet this requirement and that the information you provide is accurate. MOVA may request age or identity verification and may restrict or close an account that does not meet these requirements, subject to applicable law.',
    },
    {
      title: 'Account Registration and Information',
      content:
        'You must provide accurate, complete, and current information when creating and maintaining your account. You are responsible for updating your information when it changes. You must not impersonate another person, submit false information, create accounts for fraudulent purposes, or use another person’s identity without lawful authority. MOVA may request additional information where reasonably necessary for verification, security, fraud prevention, or legal compliance.',
    },
    {
      title: 'Account Security',
      content:
        'You are responsible for protecting your password, transaction PIN, authentication credentials, registered email address, phone number, and devices used to access MOVA. Do not share your credentials with unauthorized persons. You must notify MOVA promptly if you suspect unauthorized access, compromised credentials, or suspicious transactions. MOVA may temporarily restrict access or require additional verification where reasonably necessary to protect your account.',
    },
    {
      title: 'Wallets and Access Controls',
      content:
        'MOVA provides wallet configurations and rules designed to help you control access to your money. Depending on the features available, you may configure target amounts, release amounts, schedules, and other wallet restrictions. You are responsible for reviewing your configuration before confirming it. Wallet restrictions are intended to help you manage access to funds but do not guarantee a particular financial outcome or prevent every possible transaction outside MOVA.',
    },
    {
      title: 'Templates and Suggested Configurations',
      content:
        'Templates are optional wallet configurations provided for convenience. Suggested amounts, schedules, and categories are recommendations, not financial, investment, tax, or legal advice. You must review and adjust any template before using it. MOVA does not guarantee that a template is suitable for your income, expenses, obligations, or financial circumstances.',
    },
    {
      title: 'Automation and Scheduled Transactions',
      content:
        'Where available, automation executes the wallet rules you configure, including eligible refills from your main balance. By enabling automation, you authorize MOVA to carry out the transactions described in your confirmed configuration, subject to the applicable terms and available functionality. Transactions may be skipped, delayed, or unsuccessful because of insufficient funds, minimum-balance restrictions, renewal limits, provider downtime, technical failures, account restrictions, or legal requirements. You should review your automation settings regularly. You may pause, edit, or disable automation where the relevant controls are available. Applicable fees will be disclosed before you confirm a charge.',
    },
    {
      title: 'Payments and Third-Party Providers',
      content:
        'MOVA may rely on third-party payment processors, banks, and other financial service providers to process eligible deposits, transfers, withdrawals, and utility payments. Such transactions may be subject to the relevant provider’s terms, verification procedures, transaction limits, processing times, and service availability. MOVA does not control every aspect of a third-party provider’s operations. Transactions may be delayed, declined, reversed, or temporarily unavailable. You agree to provide accurate payment information and use payment methods you are authorized to use.',
    },
    {
      title: 'Fees, Charges, and Pricing',
      content:
        'Certain MOVA services or transactions may attract service fees or third-party processing charges. Applicable charges will be presented through the relevant interface before you confirm a charge or transaction. You are responsible for reviewing the displayed fees and total amount before proceeding. Fees may vary according to the service, transaction amount, payment provider, or applicable pricing schedule. MOVA will communicate material changes to its own fees where required by applicable law. Third-party charges may be governed by the relevant provider’s terms.',
    },
    {
      title: 'Available Balances and Transaction Processing',
      content:
        'The balances displayed in MOVA are intended to reflect the information available to the application and may be affected by pending transactions, provider processing times, reversals, or technical delays. A transaction is not necessarily completed merely because it has been initiated or displayed as pending. You should rely on the transaction status and available confirmation records. MOVA may investigate discrepancies and correct demonstrable errors in accordance with applicable law and its operational procedures.',
    },
    {
      title: 'Failed, Delayed, or Reversed Transactions',
      content:
        'Transactions may fail, be delayed, or be reversed because of incorrect details, insufficient funds, payment provider failures, network interruptions, security checks, or other circumstances. If a transaction appears incorrect or remains unresolved, contact MOVA support with the relevant transaction reference and supporting information. Any refund, reversal, or correction will be handled in accordance with the transaction circumstances, applicable provider procedures, and applicable law. MOVA does not guarantee a particular resolution time where third-party processing is involved.',
    },
    {
      title: 'Transaction Records and Disputes',
      content:
        'You should review your wallet activity and transaction records regularly and report suspected errors, unauthorized transactions, or discrepancies as soon as reasonably possible. When submitting a complaint, provide the relevant transaction reference, date, amount, and supporting information. MOVA may request additional details to investigate a complaint. Nothing in these terms removes any rights or remedies available to you under applicable law.',
    },
    {
      title: 'Acceptable Use and Prohibited Activities',
      content:
        'You must use MOVA lawfully and only for legitimate purposes. You must not use the service for fraud, money laundering, terrorist financing, scams, unauthorized transactions, identity theft, or other unlawful activities. You must not attempt unauthorized access, interfere with system security, exploit vulnerabilities, manipulate transaction records, reverse-engineer restricted components, or disrupt the service. MOVA may investigate suspected violations and take proportionate action, subject to applicable law.',
    },
    {
      title: 'Fraud Prevention and Verification',
      content:
        'MOVA may perform identity checks, transaction monitoring, security reviews, and other verification procedures where reasonably necessary to protect users, prevent fraud, meet provider requirements, or comply with applicable law. MOVA may request supporting documents or temporarily restrict transactions while a legitimate security or compliance concern is investigated. Where legally required, MOVA may report suspicious activity to the appropriate authorities. Restrictions will be handled in accordance with applicable legal obligations.',
    },
    {
      title: 'Service Availability and Maintenance',
      content:
        'MOVA aims to provide a reliable service but does not guarantee uninterrupted availability or error-free operation. Access may be affected by maintenance, internet connectivity, technical faults, security incidents, or failures involving third-party providers. Where reasonably practicable, MOVA may provide notice of planned maintenance or material service interruptions. You should not rely on MOVA as your only means of accessing money needed for an urgent or essential expense.',
    },
    {
      title: 'Account Suspension and Closure',
      content:
        'MOVA may suspend, restrict, or terminate access to an account where reasonably necessary because of suspected fraud, security risks, material violations of these terms, verification failures, or legal or regulatory obligations. Where appropriate and legally permitted, MOVA will communicate the reason for a restriction and any available steps to resolve it. Account closure does not automatically eliminate outstanding obligations or pending transactions. The handling of remaining funds and unresolved transactions will be subject to applicable law and the relevant payment arrangements.',
    },
    {
      title: 'Privacy and Data Protection',
      content:
        'MOVA processes personal information in connection with account registration, service delivery, security, transaction processing, and other legitimate operational purposes. Personal information will be handled in accordance with the MOVA Privacy Policy and applicable data protection laws. You should review the Privacy Policy to understand what information is collected, how it is used, when it may be shared, how long it may be retained, and what rights may be available to you.',
    },
    {
      title: 'Limitation of Liability',
      content:
        'To the extent permitted by applicable law, MOVA is not responsible for losses caused by circumstances beyond its reasonable control, including third-party provider outages, network failures, or inaccurate information supplied by you. MOVA does not guarantee that every scheduled transaction will execute successfully or that the service will always be available. Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including any applicable statutory consumer rights.',
    },
    {
      title: 'Indemnity',
      content:
        'To the extent permitted by applicable law, you may be responsible for losses, claims, or reasonable costs directly arising from your fraud, unlawful use of MOVA, or material breach of these terms. This provision does not make you responsible for losses caused by MOVA’s own breach of its legal obligations, negligence, misconduct, or other circumstances for which liability cannot lawfully be excluded.',
    },
    {
      title: 'Changes to These Terms',
      content:
        'MOVA may update these Terms & Conditions to reflect changes in its services, operational practices, payment arrangements, or legal requirements. Material changes will be communicated through appropriate channels where required by applicable law. Updated terms will state their effective date. Where consent is legally required, MOVA will obtain it before applying the relevant changes. Your continued use of the service after changes take effect may constitute acceptance where legally permitted.',
    },
    {
      title: 'Complaints and Dispute Resolution',
      content:
        'If you have a complaint about MOVA, contact the support channel provided in the application or on the official MOVA website. Include sufficient details to help investigate the matter. MOVA will review complaints and communicate the outcome or next steps within a reasonable period, subject to the complexity of the matter and any applicable requirements. You retain any rights to refer a dispute to a competent regulator, ombudsman, court, or other authorized body where applicable.',
    },
    {
      title: 'Governing Law',
      content:
        'These terms are intended to operate in accordance with the laws of the Federal Republic of Nigeria, subject to applicable conflict-of-law rules and any mandatory legal protections available to you. Nothing in this section removes any non-waivable rights or remedies provided by applicable law.',
    },
    {
      title: 'Contact MOVA',
      content:
        'If you have questions about these Terms & Conditions, account restrictions, transactions, or complaints, contact MOVA through the official support contact published in the application or on the official MOVA website. Please do not send your password, transaction PIN, or other secret authentication credentials when contacting support.',
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
            Terms & Conditions
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
              Important information
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              Please read these terms carefully before using MOVA.
              You must be at least 18 years old to create an account
              or use our services.
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
              onClick={() => navigate('/privacy')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <FileCheck2
                  size={16}
                  style={{ color: themeColors.green }}
                />
                Privacy Policy
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