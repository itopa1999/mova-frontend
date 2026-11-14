
// src/content/legal/privacy.ts

export interface LegalSection {
  title: string
  content: string
}

export const PRIVACY_VERSION = '2027-v1'

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: 'Information We Collect',
    content:
      'MOVA may collect information you provide when registering, verifying your identity, using our services, or contacting support. This may include your name, email address, phone number, account identifiers, identity verification information, and financial or transaction information required to provide our services. We may also collect wallet configurations, target amounts, release amounts, schedules, automation settings, transaction history, payment references, linked account details, and template selections. Where you participate in a Trustee Wallet or Circle, we may collect information about your role, membership, invitations, contributions, approvals, payout arrangements, and related activities. We aim to collect information that is relevant and necessary for the purposes described in this policy.',
  },
  {
    title: 'Information About Trustees and Beneficiaries',
    content:
      'Where Trustee Wallets are available, MOVA may collect information about the account holder who creates the arrangement, the designated trustee, and the intended beneficiary. This may include names, contact details, account identifiers, invitation status, role information, consent or acceptance records, wallet settings, release requests, approval decisions, and related transaction records. We process this information to create and administer the arrangement, send relevant notifications, authenticate trustee actions, maintain activity records, prevent misuse, and resolve reported issues. If you provide another person\'s information when inviting them, you confirm that you have an appropriate lawful basis to provide that information and request that MOVA contact them about the invitation.',
  },
  {
    title: 'Information About Circle and AJo Members',
    content:
      'Where Circle or AJo features are available, MOVA may collect information about organisers, moderators, members, and intended payout recipients. This may include names, contact details, account identifiers, membership and invitation records, Circle settings, contribution amounts, contribution schedules, payment statuses, payout order, payout history, and other information required to administer the Circle. We may also record membership acceptance, changes to membership, missed contributions, reported defaults, and actions taken under the Circle rules. This information is used to operate the Circle, display relevant activity to authorised participants, process contributions and payouts, maintain transaction records, prevent fraud, and investigate disputes.',
  },
  {
    title: 'Information You Provide About Other People',
    content:
      'Some MOVA features allow you to invite or designate another person as a trustee, beneficiary, Circle member, or payout recipient. When you provide another person\'s name, phone number, email address, or other information, you are responsible for ensuring that you have an appropriate lawful basis to provide it. We use this information to deliver invitations, administer the relevant feature, verify participation where necessary, and communicate service-related information. We may also receive information directly from the invited person when they accept an invitation, create an account, complete verification, or interact with the relevant feature.',
  },
  {
    title: 'How We Use Your Information',
    content:
      'We use personal information to create and manage accounts, provide wallet functionality, process eligible transactions, execute configured automation rules, display transaction records, provide customer support, improve reliability, investigate reported problems, prevent fraud, maintain security, and comply with applicable legal obligations. Where automation is enabled, relevant wallet settings and balance information may be processed to determine whether a configured rule can be executed. We also use relevant information to administer Trustee Wallets and Circles, manage invitations and membership, record trustee approvals, track contributions, calculate or display payout schedules, send notifications, investigate defaults and disputes, and maintain records of actions taken by users.',
  },
  {
    title: 'Legal Basis for Processing',
    content:
      'Where required by applicable data protection law, MOVA processes personal information on a lawful basis. Depending on the circumstances, this may include providing services you request or have agreed to, complying with legal obligations, pursuing legitimate interests such as security and fraud prevention, protecting users and the platform, or obtaining your consent where required. For information about trustees, beneficiaries, and Circle members, the relevant lawful basis may depend on the role of the individual and the purpose for which their information is processed. Where processing relies on consent, you may withdraw that consent. Withdrawal does not make earlier lawful processing unlawful and may affect features that depend on the consent you withdraw. Some information may still need to be processed or retained to fulfil contractual obligations, comply with legal requirements, or resolve disputes.',
  },
  {
    title: 'Financial and Transaction Information',
    content:
      'When you fund an account, configure a wallet, request a withdrawal, contribute to a Circle, approve a trustee release, or receive an eligible payout, MOVA may process transaction references, amounts, timestamps, transaction statuses, payment method details, recipient information, and related records. We may retain information about pending, failed, reversed, or disputed transactions to investigate problems and maintain accurate records. Banks and payment providers may independently process your information under their own privacy notices and legal obligations.',
  },
  {
    title: 'Wallets and Automation Settings',
    content:
      'Where available, MOVA stores wallet rules and automation settings you configure, including target amounts, release amounts, schedules, refill triggers, minimum-balance restrictions, renewal limits, and enabled or paused status. We process this information to apply your confirmed settings, display your configuration, maintain relevant activity records, and investigate transaction issues. If you use templates, we may record your selected template and related configuration for service operation and improvement.',
  },
  {
    title: 'Trustee Wallet Processing',
    content:
      'When a Trustee Wallet is created or used, MOVA may process information about the wallet creator, trustee, beneficiary, funding arrangements, release requests, approval or rejection decisions, timestamps, notifications, and payout destinations. This information allows us to establish the relationship between the relevant participants, administer the trustee workflow, authenticate actions, maintain an audit trail, and investigate suspected misuse or disputes. Where trustee approval is required, we may record whether a request was approved, rejected, or left pending. We may make relevant information available to the account holder, trustee, or beneficiary according to their role, permissions, and the feature settings. We do not assume that every participant is entitled to view all information relating to the arrangement.',
  },
  {
    title: 'Circle and AJo Processing',
    content:
      'When you create, join, organise, or participate in a Circle, MOVA may process information about the Circle name or identifier, organiser, moderator, authorised members, invitations, membership acceptance, contribution obligations, payment status, payout order, payout recipient, and transaction history. We use this information to operate the Circle, enforce access permissions, display relevant contribution and payout information, send reminders and notifications, and maintain records of member activity. Depending on the permissions and functionality of the Circle, certain information may be visible to its organiser, moderator, or other authorised members. We aim to limit access to information according to the relevant feature permissions.',
  },
  {
    title: 'Missed Contributions, Defaults, and Disputes',
    content:
      'Where a Circle member misses a contribution or a dispute is reported, MOVA may process records relating to the missed payment, outstanding contribution, payment reminders, applicable Circle rules, reported conduct, complaints, evidence submitted, and actions taken to investigate or resolve the issue. This information may be used to administer the Circle, determine the status of a contribution, apply disclosed feature rules, investigate suspected fraud, respond to complaints, and maintain records for legal or compliance purposes. We may share relevant information with authorised Circle participants where necessary to administer the Circle or address a dispute, subject to applicable permissions and data protection requirements.',
  },
  {
    title: 'Communications and Notifications',
    content:
      'MOVA may use your contact details and account activity to send service-related communications. These may include account security alerts, verification messages, transaction confirmations, wallet release notifications, trustee invitations, trustee approval requests, Circle invitations, contribution reminders, payout updates, and support responses. Some notifications may contain information about another participant or a financial activity involving you. We aim to send information only to the intended recipient and through the communication channels enabled for the relevant feature. You may not be able to disable essential service or security notifications while continuing to use features that depend on them.',
  },
  {
    title: 'Payment Providers and Third Parties',
    content:
      'MOVA may share relevant information with payment processors, banks, identity-verification providers, hosting providers, security providers, communication providers, and other service providers where necessary to deliver services, process transactions, verify information, protect accounts, or comply with legal obligations. For example, payment and payout information may be shared with a payment provider to process a wallet funding transaction, Circle contribution, or payout to a linked account. Identity and contact information may be shared with verification or communication providers where required to perform the relevant service. We aim to limit shared information to what is reasonably necessary. Third-party providers may process information under their own privacy policies. MOVA does not sell your personal information.',
  },
  {
    title: 'Information Shared With Other MOVA Users',
    content:
      'Certain MOVA features require information to be visible to other authorised participants. For example, a trustee may receive information about a wallet and release request they are expected to review. A Circle organiser or moderator may need to view membership and contribution statuses to administer the Circle. Circle members may be shown relevant payout order, contribution status, or transaction information to understand the operation of their Circle. The information visible to another user depends on the feature, the user\'s role, and the permissions configured by MOVA. We do not intend to make private account credentials, passwords, transaction PINs, or unrelated personal account information visible to other users.',
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
      'MOVA uses appropriate technical and organisational safeguards designed to protect personal information against unauthorised access, loss, alteration, misuse, or disclosure. Safeguards may include access controls, authentication, restricted permissions, monitoring, secure communications, and protected storage. Access to trustee, beneficiary, and Circle information should be limited according to the roles and permissions required to operate the relevant feature. No internet-based service can guarantee absolute security. You are responsible for safeguarding your password, transaction PIN, devices, and authentication credentials. Contact us promptly if you suspect unauthorised access to your account.',
  },
  {
    title: 'Data Sharing and Legal Disclosures',
    content:
      'We may disclose relevant information when necessary to provide our services, comply with a lawful request or legal obligation, investigate suspected fraud, protect users, enforce our terms, or establish or defend legal claims. This may include sharing relevant transaction, identity, wallet, trustee, or Circle records with competent authorities, financial institutions, payment providers, professional advisers, or other parties where legally permitted or required. We assess requests and disclosures in accordance with applicable law. We do not promise that personal information will never be disclosed to a government authority; disclosures may be required by law or valid legal process.',
  },
  {
    title: 'International Data Transfers',
    content:
      'Some service providers may process or store information outside Nigeria. Where personal data is transferred internationally, MOVA will apply the safeguards and transfer requirements required by applicable data protection law. This may include information relating to account activity, identity verification, payment transactions, wallet settings, trustee arrangements, and Circle participation. The protections available may depend on the destination, the service provider, and the legal mechanism used for the transfer.',
  },
  {
    title: 'Data Retention',
    content:
      'We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including service delivery, account administration, security, dispute resolution, accounting, and compliance with legal obligations. Transaction records, wallet configurations, trustee approvals, Circle membership records, contribution histories, payout records, and dispute information may need to be retained after an account is closed. Retention periods depend on the type of information, its purpose, and applicable requirements. When information is no longer required, we will take appropriate steps to delete it or securely dispose of it, subject to applicable law.',
  },
  {
    title: 'Your Data Protection Rights',
    content:
      'Subject to applicable law, you may have the right to request access to your personal information, correct inaccurate information, request deletion, restrict or object to certain processing, request data portability, and withdraw consent where processing relies on consent. You may also have the right to raise a complaint with the relevant data protection authority. These rights are subject to applicable conditions and exceptions. For example, some financial, transaction, security, trustee, or Circle records may need to be retained even after an account is closed. Where your information relates to another participant, MOVA may need to protect that person\'s rights and information when responding to your request.',
  },
  {
    title: 'Account Closure and Data Deletion',
    content:
      'You may request account closure or deletion of personal information through the available account controls or by contacting support. We will assess and process your request in accordance with applicable law. Closing your account does not necessarily result in the immediate deletion of every record, particularly where retention is legally required or necessary to resolve a dispute, investigate fraud, complete pending transactions, maintain financial records, or protect legal rights. Closing an account also does not automatically remove records relating to a Trustee Wallet or Circle where those records are necessary to maintain the transaction history or protect the rights of other participants. We will not retain information longer than permitted or necessary for an applicable purpose.',
  },
  {
    title: 'Automated Processing',
    content:
      'MOVA uses automated systems to support certain service functions, including applying wallet schedules, checking transaction statuses, sending notifications, and processing configured release instructions. Where available, automated systems may also support the administration of Circle contribution schedules and payout workflows. These processes use relevant account, wallet, and transaction information to carry out instructions or operate the requested feature. Where applicable law provides rights relating to automated decision-making or profiling, you may exercise those rights through our support channels. We will provide further information where a particular automated process has a significant effect on your rights or interests and applicable law requires it.',
  },
  {
    title: 'Children and Age Restrictions',
    content:
      'MOVA is intended for individuals who are at least 18 years old. Individuals under 18 are not permitted to register for or use MOVA. We do not knowingly seek to collect personal information from children through an account that is not eligible to use the service. If you believe a person under 18 has provided personal information to MOVA, contact us so we can review the matter and take appropriate action in accordance with applicable law.',
  },
  {
    title: 'Privacy Incidents',
    content:
      'If we identify a personal data breach, we will assess the incident and take appropriate steps to contain it, investigate its impact, and reduce further risk. We will notify the relevant authority and affected individuals where required by applicable law. If you suspect a privacy or security incident involving your account, a Trustee Wallet, or a Circle, contact us promptly and provide details that may help us investigate.',
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
