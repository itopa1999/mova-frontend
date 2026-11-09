// src/content/legal/terms.ts

export interface LegalSection {
  title: string
  content: string
}

export const TERMS_VERSION = '2027-v1'

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using MOVA, you agree to these Terms & Conditions. If you do not agree with any part of these Terms, you must not use our services. These Terms apply to all users of MOVA, including organisers, members, and trustees.',
  },
  {
    title: 'Definitions',
    content:
      'In these Terms, "MOVA", "we", "us", and "our" refer to the MOVA service. "You" and "your" refer to the individual accessing or using MOVA. "Services" refers to all features provided by MOVA, including wallets, savings circles, trustee wallets, transaction processing, automation, and support.',
  },
  {
    title: 'Eligibility and Account Creation',
    content:
      'You must be at least 18 years old, possess the legal capacity to enter into binding contracts, and provide accurate information when creating an account. You are responsible for keeping your account information current. MOVA may refuse, suspend, or terminate accounts that fail to meet eligibility requirements or provide false information.',
  },
  {
    title: 'Account Security',
    content:
      'You must keep your password, transaction PIN, and devices secure. You must notify us immediately if you suspect unauthorised access. You are responsible for all activity that occurs under your account. MOVA may suspend access if we detect suspicious activity until we can verify the account owner.',
  },
  {
    title: 'Wallet Features',
    content:
      'MOVA wallets allow you to set money aside and configure rules for when funds become available. Wallet balances, release schedules, automation settings, and related features are provided as described in the application. Release rules that you confirm will execute as configured; once a release executes, it may not be reversible.',
  },
  {
    title: 'Savings Circles',
    content:
      'Where available, savings circles allow groups to contribute periodically and receive payouts in rotation. Circle participation is governed by the rules set by the circle organiser. MOVA facilitates the mechanics but is not responsible for member behaviour, defaults, or disputes between members. If a member defaults, the circle\'s configured penalty and deposit rules will apply.',
  },
  {
    title: 'Trustee Wallets',
    content:
      'Trustee wallets require the designated trustee to approve each release. By creating a trustee wallet, you confirm that you have the trustee\'s consent to send them notifications and requests. Trustees must accept their role before a trustee wallet becomes fully active.',
  },
  {
    title: 'Transactions and Authorisations',
    content:
      'Transactions initiated from your account are authorised when you provide your transaction PIN or equivalent authentication. You are responsible for every transaction completed with your credentials. MOVA is not responsible for losses arising from unauthorised access where you failed to safeguard your credentials.',
  },
  {
    title: 'Fees and Charges',
    content:
      'Certain transactions, features, or services may incur fees. Applicable fees will be displayed before you confirm a transaction. By completing a transaction, you agree to the associated fees. Fees may change over time; we will communicate material fee changes in advance.',
  },
  {
    title: 'Prohibited Activities',
    content:
      'You must not use MOVA for unlawful purposes, including fraud, money laundering, terrorism financing, or any activity that violates Nigerian or applicable international law. You must not attempt to circumvent security features, interfere with other users\' access, or reverse-engineer the service.',
  },
  {
    title: 'Suspension and Termination',
    content:
      'MOVA may suspend or terminate your access if you breach these Terms, if we are required by law, or if we reasonably believe your account is being used fraudulently or unlawfully. Where permitted, we will notify you of the reason. You may close your account at any time through the in-app settings or by contacting support.',
  },
  {
    title: 'Third-Party Services',
    content:
      'MOVA integrates with third-party providers for payments, identity verification, and related services. Your use of these third-party services may be subject to their own terms and privacy policies. MOVA is not responsible for third-party service failures, but we will assist where reasonably possible in resolving issues.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'MOVA is not liable for indirect, incidental, special, or consequential losses arising from your use of the service. Our total liability for any claim is limited to the fees you have paid to MOVA in the twelve months preceding the event giving rise to the claim, except where the law does not allow such limitation.',
  },
  {
    title: 'Changes to These Terms',
    content:
      'We may update these Terms from time to time. We will publish the updated version and communicate material changes through the app or by email. Your continued use of MOVA after the updated Terms take effect constitutes your acceptance of the changes. If you do not agree with updated Terms, you should stop using MOVA.',
  },
  {
    title: 'Governing Law and Disputes',
    content:
      'These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute arising from or relating to these Terms will be resolved in the courts of competent jurisdiction in Nigeria. Before pursuing formal legal action, you agree to attempt to resolve disputes through our support channels in good faith.',
  },
  {
    title: 'Contact',
    content:
      'For questions about these Terms, contact our support team through the in-app help centre or at support@mova.app. Please do not include your password, transaction PIN, or other secret credentials in your message.',
  },
]