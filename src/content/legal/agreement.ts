// src/content/legal/agreement.ts

export interface LegalSection {
  title: string
  content: string
}

export const AGREEMENT_VERSION = '2027-v1'

export const AGREEMENT_SECTIONS: LegalSection[] = [
  {
    title: 'Introduction',
    content:
      'Welcome to MOVA. This User Agreement governs your access to and use of MOVA\'s services, including your MOVA account, wallets, transaction features, and any related applications or tools we provide. By creating an account or using our services, you agree to be bound by this Agreement.',
  },
  {
    title: 'Eligibility',
    content:
      'You must be at least 18 years old and legally capable of entering into a binding contract to use MOVA. By registering, you confirm that the information you provide is accurate and that you are not prohibited by law from using our services.',
  },
  {
    title: 'Account Registration',
    content:
      'You agree to provide accurate, current, and complete information when registering. You are responsible for maintaining the confidentiality of your account credentials, transaction PIN, and any devices used to access your account. You must notify us promptly if you suspect unauthorised access.',
  },
  {
    title: 'Services We Provide',
    content:
      'MOVA provides digital wallet and savings features that allow you to set money aside, configure release rules, and manage transactions according to your preferences. Service availability may change over time. We may add, modify, or discontinue features with appropriate notice.',
  },
  {
    title: 'Your Responsibilities',
    content:
      'You agree to use MOVA only for lawful purposes and in accordance with this Agreement. You must not attempt to gain unauthorised access, interfere with other users, use the service for fraud or money laundering, or engage in any activity that violates applicable laws.',
  },
  {
    title: 'Wallets and Release Rules',
    content:
      'When you create a wallet and configure release rules, you instruct MOVA to hold funds and release them according to the parameters you set. You are responsible for reviewing the rules before confirming. Once a rule is active, releases occur as configured, and you may not be able to reverse a release that has already been executed.',
  },
  {
    title: 'Fees and Charges',
    content:
      'Certain services may incur fees. Applicable fees will be displayed before you confirm a transaction. By proceeding with a transaction, you agree to pay the associated fees. Fees are subject to change, and we will notify you of material changes in advance.',
  },
  {
    title: 'Transaction Authorisation',
    content:
      'You are responsible for all transactions initiated from your account, including those authenticated with your transaction PIN. You must keep your PIN confidential and must not share it with anyone. MOVA will not be responsible for losses arising from your failure to safeguard your credentials.',
  },
  {
    title: 'Suspension and Termination',
    content:
      'We may suspend or terminate your access to MOVA if you breach this Agreement, if we are required to do so by law, or if we reasonably believe your account is being used fraudulently or unlawfully. Where permitted, we will notify you of the reason.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'MOVA is not liable for indirect, incidental, or consequential losses arising from your use of the service, except where the law does not allow such limitation. Our total liability for any claim is limited to the amount of fees you have paid to MOVA in the twelve months preceding the claim.',
  },
  {
    title: 'Changes to This Agreement',
    content:
      'We may update this Agreement from time to time. We will publish the updated version and communicate material changes through the app or by email. Continued use of MOVA after the updated Agreement takes effect constitutes your acceptance of the changes.',
  },
  {
    title: 'Governing Law',
    content:
      'This Agreement is governed by the laws of the Federal Republic of Nigeria. Any dispute arising from or relating to this Agreement will be resolved in the courts of competent jurisdiction in Nigeria.',
  },
  {
    title: 'Contact',
    content:
      'For questions about this Agreement, please contact our support team through the in-app help centre or at support@mova.app. Do not include sensitive credentials such as your password or transaction PIN in your message.',
  },
]