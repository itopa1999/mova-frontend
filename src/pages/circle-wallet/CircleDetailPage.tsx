// import { useState, useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import {
//   Users,
//   Trophy,
//   Clock,
//   CheckCircle,
//   UserPlus,
//   ChevronRight,
//   Calendar,
//   Crown,
//   User,
//   AlertTriangle,
//   XCircle,
//   Info,
//   Settings,
//   Play,
//   Trash2,
//   ChevronUp,
//   ChevronDown,
//   RefreshCw,
//   ArrowRight,
//   Wallet,
//   Shield,
//   Lock,
//   Repeat,
//   Loader2,
//   Banknote,
//   Copy,
//   Check,
//   UserCheck,
//   ArrowDownToLine,
// } from 'lucide-react'

// import AppLayout from '../../components/layout/AppLayout'
// import BackButton from '../../components/ui/BackButton'
// import PinModal from '../../components/ui/PinModal'
// import { useTheme } from '../../hooks/useTheme'
// import { colors, darkColors } from '../../styles/tokens'
// import { formatCurrency, formatUSDate } from '../../utils/formatting'

// /* ───────────── Types ───────────── */

// type CircleStatus =
//   | 'Draft'
//   | 'Active'
//   | 'Completed'
//   | 'Cancelled'
//   | 'Suspended'

// type RotationStrategy = 'FixedOrder' | 'RandomDraw' | 'ModeratorSet'

// type MemberJoinStatus = 'Invited' | 'Accepted' | 'Declined'

// type MemberContributionStatus =
//   | 'Paid'
//   | 'Pending'
//   | 'Missed'
//   | 'Defaulted'
//   | 'NotStarted'

// type TabType = 'overview' | 'members' | 'manage'

// interface CircleMember {
//   id: string
//   name: string
//   initials: string
//   isYou: boolean
//   isModerator: boolean
//   position: number | null
//   joinStatus: MemberJoinStatus
//   contributionStatus: MemberContributionStatus
//   hasReceived: boolean
//   receivedAt: Date | null
//   isRecipientThisRound: boolean
//   canRemove: boolean
// }

// interface CircleDetail {
//   id: string
//   name: string
//   status: CircleStatus
//   /** Set by backend — true if the current user owns/created this circle */
//   isModerator: boolean
//   category: { id: number; name: string; icon: string }
//   contributionAmount: number
//   frequency: 'Daily' | 'Weekly' | 'Monthly'
//   frequencyDescription: string
//   memberCount: number
//   currentRound: number
//   totalRounds: number
//   roundPool: number
//   roundCollected: number
//   roundCollectedCount: number
//   nextCollectionDate: Date | null
//   nextPayoutDate: Date | null
//   rotationStrategy: RotationStrategy
//   startDate: Date
//   startedAt: Date | null
//   completedAt: Date | null
//   penaltyEnabled: boolean
//   penaltyAmount: number
//   penaltySource: 'deposit' | 'round'
//   gracePeriodHours: number
//   depositAmount: number
//   startPolicy: 'wait_for_all' | 'start_with_joined'
//   /** Public invite link the moderator can share */
//   inviteLink: string
//   members: CircleMember[]
// }

// /* ───────────── Sample data ─────────────
//  * Set `isModerator` to `true` or `false` to preview both views.
//  * In production, this comes from the backend response.
//  */

// const SAMPLE_CIRCLE: CircleDetail = {
//   id: 'circle_1',
//   name: 'Lagos Rent Circle 2026',
//   status: 'Active',
//   isModerator: true,
//   category: { id: 1, name: 'Rent', icon: 'home' },
//   contributionAmount: 50000,
//   frequency: 'Weekly',
//   frequencyDescription: 'Every Monday',
//   memberCount: 5,
//   currentRound: 2,
//   totalRounds: 5,
//   roundPool: 250000,
//   roundCollected: 150000,
//   roundCollectedCount: 3,
//   nextCollectionDate: new Date(Date.now() + 3 * 864e5),
//   nextPayoutDate: new Date(Date.now() + 3 * 864e5),
//   rotationStrategy: 'FixedOrder',
//   startDate: new Date(Date.now() - 7 * 864e5),
//   startedAt: new Date(Date.now() - 7 * 864e5),
//   completedAt: null,
//   penaltyEnabled: true,
//   penaltyAmount: 5000,
//   penaltySource: 'deposit',
//   gracePeriodHours: 24,
//   depositAmount: 50000,
//   startPolicy: 'wait_for_all',
//   inviteLink: 'https://mova.app/circles/join/circle_1',
//   members: [
//     {
//       id: '1',
//       name: 'You',
//       initials: 'YO',
//       isYou: true,
//       isModerator: true,
//       position: 1,
//       joinStatus: 'Accepted',
//       contributionStatus: 'Paid',
//       hasReceived: true,
//       receivedAt: new Date(Date.now() - 7 * 864e5),
//       isRecipientThisRound: false,
//       canRemove: false,
//     },
//     {
//       id: '2',
//       name: 'Ada Obi',
//       initials: 'AO',
//       isYou: false,
//       isModerator: false,
//       position: 2,
//       joinStatus: 'Accepted',
//       contributionStatus: 'Paid',
//       hasReceived: false,
//       receivedAt: null,
//       isRecipientThisRound: true,
//       canRemove: false,
//     },
//     {
//       id: '3',
//       name: 'Bola Adeyemi',
//       initials: 'BA',
//       isYou: false,
//       isModerator: false,
//       position: 3,
//       joinStatus: 'Accepted',
//       contributionStatus: 'Paid',
//       hasReceived: false,
//       receivedAt: null,
//       isRecipientThisRound: false,
//       canRemove: false,
//     },
//     {
//       id: '4',
//       name: 'Chidi Eze',
//       initials: 'CE',
//       isYou: false,
//       isModerator: false,
//       position: 4,
//       joinStatus: 'Accepted',
//       contributionStatus: 'Pending',
//       hasReceived: false,
//       receivedAt: null,
//       isRecipientThisRound: false,
//       canRemove: false,
//     },
//     {
//       id: '5',
//       name: 'Deji Ola',
//       initials: 'DO',
//       isYou: false,
//       isModerator: false,
//       position: 5,
//       joinStatus: 'Accepted',
//       contributionStatus: 'Pending',
//       hasReceived: false,
//       receivedAt: null,
//       isRecipientThisRound: false,
//       canRemove: false,
//     },
//   ],
// }

// const MEMBER_PREVIEW_COUNT = 3

// /* ───────────── Helpers ───────────── */

// const getCircleStatusStyle = (
//   status: CircleStatus,
//   themeColors: typeof colors | typeof darkColors,
//   isDark: boolean
// ) => {
//   switch (status) {
//     case 'Active':
//       return {
//         bg: themeColors.circleLight,
//         text: themeColors.circle,
//       }
//     case 'Draft':
//       return {
//         bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
//         text: '#F59E0B',
//       }
//     case 'Completed':
//       return {
//         bg: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(96, 165, 250, 0.1)',
//         text: '#60A5FA',
//       }
//     case 'Cancelled':
//       return {
//         bg: isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)',
//         text: '#9CA3AF',
//       }
//     case 'Suspended':
//       return {
//         bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
//         text: '#EF4444',
//       }
//   }
// }

// const getContributionStyle = (
//   status: MemberContributionStatus,
//   themeColors: typeof colors | typeof darkColors,
//   isDark: boolean
// ) => {
//   switch (status) {
//     case 'Paid':
//       return {
//         bg: themeColors.circleLight,
//         text: themeColors.circle,
//       }
//     case 'Pending':
//       return {
//         bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
//         text: '#F59E0B',
//       }
//     case 'Missed':
//       return {
//         bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
//         text: '#EF4444',
//       }
//     case 'Defaulted':
//       return {
//         bg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)',
//         text: '#DC2626',
//       }
//     case 'NotStarted':
//     default:
//       return {
//         bg: isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)',
//         text: '#9CA3AF',
//       }
//   }
// }

// const formatTimeLeft = (date: Date): string => {
//   const ms = date.getTime() - Date.now()
//   if (ms <= 0) return 'Due now'
//   const days = Math.floor(ms / 864e5)
//   if (days > 0) return `In ${days} ${days === 1 ? 'day' : 'days'}`
//   const hours = Math.floor(ms / 36e5)
//   if (hours > 0) return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`
//   const minutes = Math.floor(ms / 6e4)
//   return `In ${minutes} min`
// }

// /* ───────────── Component ───────────── */

// export default function CircleDetailPage() {
//   const navigate = useNavigate()
//   const { circleId } = useParams<{ circleId: string }>()
//   const { isDark } = useTheme()
//   const themeColors = isDark ? darkColors : colors

//   // In production: fetch based on circleId and backend isModerator flag
//   const [circle, setCircle] = useState<CircleDetail | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   const [activeTab, setActiveTab] = useState<TabType>('overview')
//   const [showAllMembers, setShowAllMembers] = useState(false)

//   const [isPinOpen, setIsPinOpen] = useState(false)
//   const [isContributing, setIsContributing] = useState(false)
//   const [isStarting, setIsStarting] = useState(false)
//   const [copied, setCopied] = useState(false)

//   /* ─── Load circle ─── */

//   useEffect(() => {
//     // DUMMY: simulate fetch
//     const t = setTimeout(() => {
//       setCircle(SAMPLE_CIRCLE)
//       setIsLoading(false)
//     }, 400)
//     return () => clearTimeout(t)
//   }, [circleId])

//   /* ─── Derived ─── */

//   const isModerator = circle?.isModerator ?? false
//   const myMember = circle?.members.find((m) => m.isYou)
//   const isDraft = circle?.status === 'Draft'
//   const isActive = circle?.status === 'Active'
//   const isCompleted = circle?.status === 'Completed'
//   const isCancelled = circle?.status === 'Cancelled'

//   const acceptedMembers =
//     circle?.members.filter((m) => m.joinStatus === 'Accepted') ?? []
//   const pendingInvites =
//     circle?.members.filter((m) => m.joinStatus === 'Invited') ?? []
//   const joinedCount = acceptedMembers.length
//   const isFull = circle ? joinedCount >= circle.memberCount : false
//   const startDatePassed = circle
//     ? new Date(circle.startDate) <= new Date()
//     : false

//   const readyToStart =
//     isModerator &&
//     isDraft &&
//     isFull &&
//     (circle?.startPolicy === 'start_with_joined' || startDatePassed)

//   const myContributionPending =
//     isActive &&
//     myMember?.contributionStatus === 'Pending' &&
//     myMember?.joinStatus === 'Accepted'

//   const myRoundReceived =
//     isActive && myMember?.isRecipientThisRound === true

//   const unpaidMembers =
//     isActive && isModerator
//       ? circle?.members.filter(
//           (m) =>
//             m.joinStatus === 'Accepted' &&
//             m.contributionStatus === 'Pending'
//         ) ?? []
//       : []

//   const collectionPct = circle
//     ? circle.roundPool > 0
//       ? Math.min(
//           100,
//           Math.round((circle.roundCollected / circle.roundPool) * 100)
//         )
//       : 0
//     : 0

//   const canReorder =
//     isModerator &&
//     isDraft &&
//     (circle?.rotationStrategy === 'FixedOrder' ||
//       circle?.rotationStrategy === 'ModeratorSet')

//   const visibleTabs: TabType[] = isModerator
//     ? ['overview', 'members', 'manage']
//     : ['overview', 'members']

//   /* ─── Handlers ─── */

//   const handleContribute = () => {
//     setIsPinOpen(true)
//   }

//   const handleVerifyPin = async (pin: string) => {
//     setIsContributing(true)
//     try {
//       // DUMMY: simulate contribution API
//       await new Promise((r) => setTimeout(r, 900))
//       if (pin.length !== 6) throw new Error('Invalid PIN. Please try again.')

//       // Refresh locally — in production, refetch from API
//       if (circle && myMember) {
//         setCircle({
//           ...circle,
//           roundCollected: circle.roundCollected + circle.contributionAmount,
//           roundCollectedCount: circle.roundCollectedCount + 1,
//           members: circle.members.map((m) =>
//             m.id === myMember.id
//               ? { ...m, contributionStatus: 'Paid' }
//               : m
//           ),
//         })
//       }

//       window.dispatchEvent(
//         new CustomEvent('showToast', {
//           detail: {
//             type: 'success',
//             message: 'Contribution recorded',
//           },
//         })
//       )

//       setIsPinOpen(false)
//     } catch (err) {
//       window.dispatchEvent(
//         new CustomEvent('showToast', {
//           detail: {
//             type: 'error',
//             message:
//               err instanceof Error ? err.message : 'Contribution failed',
//           },
//         })
//       )
//       throw err
//     } finally {
//       setIsContributing(false)
//     }
//   }

//   const handleStartCircle = async () => {
//     if (!circle) return
//     setIsStarting(true)
//     try {
//       await new Promise((r) => setTimeout(r, 800))
//       setCircle({
//         ...circle,
//         status: 'Active',
//         currentRound: 1,
//         startedAt: new Date(),
//       })
//       window.dispatchEvent(
//         new CustomEvent('showToast', {
//           detail: {
//             type: 'success',
//             message: 'Circle started — round 1 is underway',
//           },
//         })
//       )
//     } finally {
//       setIsStarting(false)
//     }
//   }

//   const handleCopyInvite = async () => {
//     if (!circle) return
//     try {
//       await navigator.clipboard.writeText(circle.inviteLink)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//       window.dispatchEvent(
//         new CustomEvent('showToast', {
//           detail: { type: 'success', message: 'Invite link copied' },
//         })
//       )
//     } catch {
//       window.dispatchEvent(
//         new CustomEvent('showToast', {
//           detail: { type: 'error', message: 'Could not copy link' },
//         })
//       )
//     }
//   }

//   const moveMember = (fromIndex: number, direction: -1 | 1) => {
//     if (!circle || !canReorder) return
//     const toIndex = fromIndex + direction
//     if (toIndex < 0 || toIndex >= acceptedMembers.length) return

//     const reordered = [...acceptedMembers]
//     ;[reordered[fromIndex], reordered[toIndex]] = [
//       reordered[toIndex],
//       reordered[fromIndex],
//     ]

//     // Rebuild with new positions
//     const updated = reordered.map((m, idx) => ({
//       ...m,
//       position: idx + 1,
//     }))

//     // Preserve any invited members at the end
//     const updatedMap = new Map(updated.map((m) => [m.id, m]))
//     setCircle({
//       ...circle,
//       members: circle.members.map((m) => updatedMap.get(m.id) ?? m),
//     })
//   }

//   /* ─── Render states ─── */

//   if (isLoading) {
//     return (
//       <AppLayout>
//         <div className="flex min-h-[400px] items-center justify-center py-5">
//           <Loader2
//             size={32}
//             className="animate-spin"
//             style={{ color: themeColors.circle }}
//           />
//         </div>
//       </AppLayout>
//     )
//   }

//   if (!circle) {
//     return (
//       <AppLayout>
//         <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
//           <AlertTriangle
//             size={32}
//             style={{ color: themeColors.mid }}
//           />
//           <p
//             className="mt-4 text-[15px] font-semibold"
//             style={{ color: themeColors.charcoal }}
//           >
//             Circle not found
//           </p>
//         </div>
//       </AppLayout>
//     )
//   }

//   const circleStatusStyle = getCircleStatusStyle(
//     circle.status,
//     themeColors,
//     isDark
//   )

//   const visibleMembers = showAllMembers
//     ? circle.members
//     : circle.members.slice(0, MEMBER_PREVIEW_COUNT)
//   const hasMoreMembers = circle.members.length > MEMBER_PREVIEW_COUNT

//   /* ─── Render ─── */

//   return (
//     <AppLayout>
//       <div className="py-5" style={{ color: themeColors.charcoal }}>
//         {/* ─── Header ─── */}
//         <div className="mb-5 flex items-start gap-3">
//           <BackButton onClick={() => navigate('/dashboard/circles')} />
//           <div className="min-w-0 flex-1">
//             <div className="flex flex-wrap items-center gap-2">
//               <h1
//                 className="truncate text-[18px] font-bold"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 {circle.name}
//               </h1>
//               {isModerator ? (
//                 <span
//                   className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
//                   style={{
//                     backgroundColor: themeColors.circle,
//                     color: '#FFFFFF',
//                   }}
//                 >
//                   <Crown size={10} strokeWidth={2.5} />
//                   Moderator
//                 </span>
//               ) : (
//                 <span
//                   className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
//                   style={{
//                     backgroundColor: isDark
//                       ? 'rgba(255,255,255,0.08)'
//                       : 'rgba(0,0,0,0.05)',
//                     color: themeColors.mid,
//                   }}
//                 >
//                   <User size={10} strokeWidth={2.5} />
//                   Member
//                 </span>
//               )}
//             </div>
//             <div className="mt-1 flex flex-wrap items-center gap-2">
//               <span
//                 className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
//                 style={{
//                   backgroundColor: circleStatusStyle.bg,
//                   color: circleStatusStyle.text,
//                 }}
//               >
//                 {circle.status}
//               </span>
//               <span
//                 className="text-[12px]"
//                 style={{ color: themeColors.mid }}
//               >
//                 {circle.memberCount} members ·{' '}
//                 {formatCurrency(circle.contributionAmount)}{' '}
//                 {circle.frequency.toLowerCase()}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* ─── Contextual alert banner ─── */}
//         {readyToStart && (
//           <div
//             className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
//             style={{
//               backgroundColor: themeColors.circleLight,
//               borderColor: themeColors.circleMid,
//             }}
//           >
//             <Play
//               size={16}
//               style={{
//                 color: themeColors.circle,
//                 marginTop: 2,
//                 flexShrink: 0,
//               }}
//             />
//             <div className="flex-1">
//               <p
//                 className="text-[13px] font-semibold"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 Ready to start
//               </p>
//               <p
//                 className="mt-0.5 text-[11.5px] leading-[1.55]"
//                 style={{ color: themeColors.mid }}
//               >
//                 All {circle.memberCount} members have joined. Start round 1 to
//                 begin contributions.
//               </p>
//               <button
//                 type="button"
//                 onClick={handleStartCircle}
//                 disabled={isStarting}
//                 className="mt-2 flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
//                 style={{
//                   backgroundColor: themeColors.circle,
//                   color: '#FFFFFF',
//                 }}
//               >
//                 {isStarting ? (
//                   <>
//                     <Loader2 size={12} className="animate-spin" />
//                     Starting...
//                   </>
//                 ) : (
//                   <>
//                     <Play size={12} strokeWidth={2.5} />
//                     Start circle
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {myContributionPending && !readyToStart && (
//           <div
//             className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
//             style={{
//               backgroundColor: themeColors.circleLight,
//               borderColor: themeColors.circleMid,
//             }}
//           >
//             <Clock
//               size={16}
//               style={{
//                 color: themeColors.circle,
//                 marginTop: 2,
//                 flexShrink: 0,
//               }}
//             />
//             <div className="flex-1">
//               <p
//                 className="text-[13px] font-semibold"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 Your contribution is due
//               </p>
//               <p
//                 className="mt-0.5 text-[11.5px] leading-[1.55]"
//                 style={{ color: themeColors.mid }}
//               >
//                 Round {circle.currentRound} · Pay{' '}
//                 {formatCurrency(circle.contributionAmount)} to stay on schedule.
//                 {circle.penaltyEnabled && (
//                   <>
//                     {' '}
//                     Late payment adds a{' '}
//                     {formatCurrency(circle.penaltyAmount)} penalty.
//                   </>
//                 )}
//               </p>
//             </div>
//           </div>
//         )}

//         {unpaidMembers.length > 0 && !myContributionPending && (
//           <div
//             className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
//             style={{
//               backgroundColor: isDark
//                 ? 'rgba(245, 158, 11, 0.1)'
//                 : 'rgba(245, 158, 11, 0.05)',
//               borderColor: isDark
//                 ? 'rgba(245, 158, 11, 0.25)'
//                 : 'rgba(245, 158, 11, 0.15)',
//             }}
//           >
//             <AlertTriangle
//               size={16}
//               style={{
//                 color: '#F59E0B',
//                 marginTop: 2,
//                 flexShrink: 0,
//               }}
//             />
//             <div className="flex-1">
//               <p
//                 className="text-[13px] font-semibold"
//                 style={{ color: '#D97706' }}
//               >
//                 {unpaidMembers.length}{' '}
//                 {unpaidMembers.length === 1 ? 'member has' : 'members have'}{' '}
//                 not paid
//               </p>
//               <p
//                 className="mt-0.5 text-[11.5px] leading-[1.55]"
//                 style={{ color: themeColors.mid }}
//               >
//                 {unpaidMembers.map((m) => m.name).join(', ')} — the round cannot
//                 complete until everyone pays.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ─── Hero ─── */}
//         <div
//           className="mb-4 overflow-hidden rounded-[20px] border p-5"
//           style={{
//             backgroundColor: themeColors.circleLight,
//             borderColor: themeColors.circleMid,
//           }}
//         >
//           {isDraft ? (
//             <>
//               <div className="mb-1 flex items-center justify-between">
//                 <span
//                   className="text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: themeColors.circle }}
//                 >
//                   Waiting to start
//                 </span>
//                 <Users size={16} style={{ color: themeColors.circle }} />
//               </div>
//               <p
//                 className="mt-2 text-[28px] font-bold leading-none"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 {joinedCount} of {circle.memberCount}
//               </p>
//               <p
//                 className="mt-1 text-[12px]"
//                 style={{ color: themeColors.mid }}
//               >
//                 members joined
//               </p>
//               <div
//                 className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
//                 style={{
//                   backgroundColor: isDark
//                     ? 'rgba(255,255,255,0.08)'
//                     : 'rgba(0,0,0,0.06)',
//                 }}
//               >
//                 <div
//                   className="h-full rounded-full transition-all duration-500"
//                   style={{
//                     width: `${Math.min(
//                       100,
//                       Math.round((joinedCount / circle.memberCount) * 100)
//                     )}%`,
//                     backgroundColor: themeColors.circle,
//                   }}
//                 />
//               </div>
//               <p
//                 className="mt-3 text-[11.5px] leading-[1.55]"
//                 style={{ color: themeColors.mid }}
//               >
//                 Round 1 starts {formatUSDate(circle.startDate)}. Each member
//                 contributes{' '}
//                 <strong style={{ color: themeColors.charcoal }}>
//                   {formatCurrency(circle.contributionAmount)}
//                 </strong>{' '}
//                 {circle.frequency.toLowerCase()}.
//               </p>
//             </>
//           ) : isCompleted ? (
//             <>
//               <div className="mb-1 flex items-center justify-between">
//                 <span
//                   className="text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: themeColors.circle }}
//                 >
//                   Completed
//                 </span>
//                 <CheckCircle size={16} style={{ color: themeColors.circle }} />
//               </div>
//               <p
//                 className="mt-2 text-[28px] font-bold leading-none"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 {formatCurrency(circle.roundPool * circle.totalRounds)}
//               </p>
//               <p
//                 className="mt-1 text-[12px]"
//                 style={{ color: themeColors.mid }}
//               >
//                 Total pooled across {circle.totalRounds} rounds
//               </p>
//             </>
//           ) : isCancelled ? (
//             <>
//               <div className="mb-1 flex items-center justify-between">
//                 <span
//                   className="text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: '#9CA3AF' }}
//                 >
//                   Cancelled
//                 </span>
//                 <XCircle size={16} style={{ color: '#9CA3AF' }} />
//               </div>
//               <p
//                 className="mt-2 text-[14px] font-semibold leading-tight"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 This circle was cancelled
//               </p>
//               <p
//                 className="mt-1 text-[12px] leading-[1.55]"
//                 style={{ color: themeColors.mid }}
//               >
//                 Contributions and deposits are being refunded to all members.
//               </p>
//             </>
//           ) : (
//             <>
//               <div className="mb-1 flex items-center justify-between">
//                 <span
//                   className="text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: themeColors.circle }}
//                 >
//                   Round {circle.currentRound} of {circle.totalRounds}
//                 </span>
//                 <Trophy size={16} style={{ color: themeColors.circle }} />
//               </div>
//               <p
//                 className="mt-2 text-[28px] font-bold leading-none"
//                 style={{ color: themeColors.charcoal }}
//               >
//                 {formatCurrency(circle.roundCollected)}
//               </p>
//               <p
//                 className="mt-1 text-[12px]"
//                 style={{ color: themeColors.mid }}
//               >
//                 Collected of {formatCurrency(circle.roundPool)} pool
//               </p>

//               <div
//                 className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
//                 style={{
//                   backgroundColor: isDark
//                     ? 'rgba(255,255,255,0.08)'
//                     : 'rgba(0,0,0,0.06)',
//                 }}
//               >
//                 <div
//                   className="h-full rounded-full transition-all duration-500"
//                   style={{
//                     width: `${collectionPct}%`,
//                     backgroundColor: themeColors.circle,
//                   }}
//                 />
//               </div>
//               <div className="mt-2 flex items-center justify-between text-[11px]">
//                 <span style={{ color: themeColors.mid }}>
//                   {circle.roundCollectedCount} of {circle.memberCount} paid
//                 </span>
//                 <span style={{ color: themeColors.mid }}>
//                   {collectionPct}%
//                 </span>
//               </div>

//               {myContributionPending ? (
//                 <button
//                   type="button"
//                   onClick={handleContribute}
//                   className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
//                   style={{
//                     backgroundColor: themeColors.circle,
//                     color: '#FFFFFF',
//                   }}
//                 >
//                   <Banknote size={16} strokeWidth={2.2} />
//                   Contribute {formatCurrency(circle.contributionAmount)}
//                 </button>
//               ) : myRoundReceived ? (
//                 <div
//                   className="mt-4 flex items-center gap-2 rounded-[14px] border p-3"
//                   style={{
//                     backgroundColor: themeColors.card,
//                     borderColor: themeColors.border,
//                   }}
//                 >
//                   <Trophy size={16} style={{ color: themeColors.circle }} />
//                   <div className="flex-1">
//                     <p
//                       className="text-[12px] font-semibold"
//                       style={{ color: themeColors.charcoal }}
//                     >
//                       You're receiving this round
//                     </p>
//                     <p
//                       className="text-[11px]"
//                       style={{ color: themeColors.mid }}
//                     >
//                       Payout on {formatUSDate(circle.nextPayoutDate!)}
//                     </p>
//                   </div>
//                 </div>
//               ) : myMember?.contributionStatus === 'Paid' ? (
//                 <div
//                   className="mt-4 flex items-center gap-2 rounded-[14px] border p-3"
//                   style={{
//                     backgroundColor: themeColors.card,
//                     borderColor: themeColors.border,
//                   }}
//                 >
//                   <CheckCircle
//                     size={16}
//                     style={{ color: themeColors.circle }}
//                   />
//                   <p
//                     className="text-[12px] font-semibold"
//                     style={{ color: themeColors.charcoal }}
//                   >
//                     You've paid this round
//                   </p>
//                 </div>
//               ) : null}
//             </>
//           )}
//         </div>

//         {/* ─── Stats grid ─── */}
//         {isActive && (
//           <div className="mb-4 grid grid-cols-2 gap-2.5">
//             <StatCard
//               icon={Calendar}
//               label="Next collection"
//               value={
//                 circle.nextCollectionDate
//                   ? formatTimeLeft(circle.nextCollectionDate)
//                   : '—'
//               }
//               hint={
//                 circle.nextCollectionDate
//                   ? formatUSDate(circle.nextCollectionDate)
//                   : ''
//               }
//               themeColors={themeColors}
//             />
//             <StatCard
//               icon={Trophy}
//               label="Payout"
//               value={
//                 circle.nextPayoutDate
//                   ? formatTimeLeft(circle.nextPayoutDate)
//                   : '—'
//               }
//               hint={circle.rotationStrategy === 'RandomDraw' ? 'Drawn at start' : 'Fixed rotation'}
//               themeColors={themeColors}
//             />
//           </div>
//         )}

//         {/* ─── Tabs ─── */}
//         <div
//           className="mb-4 flex border-b"
//           style={{ borderColor: themeColors.border }}
//         >
//           {visibleTabs.map((tab) => (
//             <button
//               key={tab}
//               type="button"
//               onClick={() => setActiveTab(tab)}
//               className="relative flex-1 py-3 text-center text-[13px] font-semibold capitalize transition-all"
//               style={{
//                 color:
//                   activeTab === tab ? themeColors.circle : themeColors.mid,
//                 borderBottom:
//                   activeTab === tab
//                     ? `2px solid ${themeColors.circle}`
//                     : 'none',
//               }}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* ══════════════ TAB: OVERVIEW ══════════════ */}
//         {activeTab === 'overview' && (
//           <div className="space-y-3">
//             {/* Your position card (only for members) */}
//             {myMember && myMember.joinStatus === 'Accepted' && (
//               <div
//                 className="rounded-[14px] border p-3.5"
//                 style={{
//                   backgroundColor: themeColors.card,
//                   borderColor: themeColors.border,
//                 }}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <UserCheck
//                       size={14}
//                       style={{ color: themeColors.circle }}
//                     />
//                     <p
//                       className="text-[11px] font-semibold uppercase tracking-wider"
//                       style={{ color: themeColors.mid }}
//                     >
//                       Your position
//                     </p>
//                   </div>
//                   <p
//                     className="text-[16px] font-bold"
//                     style={{ color: themeColors.charcoal }}
//                   >
//                     {myMember.position
//                       ? `#${myMember.position} of ${circle.memberCount}`
//                       : 'Pending'}
//                   </p>
//                 </div>

//                 <div
//                   className="mt-2 flex items-center gap-2 border-t pt-2"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   {myMember.hasReceived ? (
//                     <>
//                       <CheckCircle
//                         size={12}
//                         style={{ color: themeColors.circle }}
//                       />
//                       <p
//                         className="text-[11.5px]"
//                         style={{ color: themeColors.mid }}
//                       >
//                         You received your payout{' '}
//                         {myMember.receivedAt &&
//                           formatUSDate(myMember.receivedAt)}
//                       </p>
//                     </>
//                   ) : myMember.isRecipientThisRound ? (
//                     <>
//                       <Trophy
//                         size={12}
//                         style={{ color: themeColors.circle }}
//                       />
//                       <p
//                         className="text-[11.5px] font-semibold"
//                         style={{ color: themeColors.circle }}
//                       >
//                         You're receiving this round
//                       </p>
//                     </>
//                   ) : (
//                     <>
//                       <Clock
//                         size={12}
//                         style={{ color: themeColors.mid }}
//                       />
//                       <p
//                         className="text-[11.5px]"
//                         style={{ color: themeColors.mid }}
//                       >
//                         Your payout is upcoming
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Rules summary */}
//             <div
//               className="rounded-[14px] border p-3.5"
//               style={{
//                 backgroundColor: themeColors.card,
//                 borderColor: themeColors.border,
//               }}
//             >
//               <p
//                 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider"
//                 style={{ color: themeColors.mid }}
//               >
//                 Circle rules
//               </p>

//               <div className="space-y-2.5">
//                 <RuleRow
//                   icon={Banknote}
//                   label="Contribution"
//                   value={`${formatCurrency(
//                     circle.contributionAmount
//                   )} · ${circle.frequencyDescription}`}
//                   themeColors={themeColors}
//                 />
//                 {circle.depositAmount > 0 && (
//                   <RuleRow
//                     icon={Lock}
//                     label="Security deposit"
//                     value={`${formatCurrency(circle.depositAmount)} per member`}
//                     themeColors={themeColors}
//                   />
//                 )}
//                 {circle.penaltyEnabled && (
//                   <RuleRow
//                     icon={AlertTriangle}
//                     label="Late penalty"
//                     value={`${formatCurrency(circle.penaltyAmount)} · ${
//                       circle.penaltySource === 'deposit'
//                         ? 'from deposit'
//                         : 'added to contribution'
//                     }`}
//                     themeColors={themeColors}
//                   />
//                 )}
//                 <RuleRow
//                   icon={Clock}
//                   label="Grace period"
//                   value={`${circle.gracePeriodHours} hours`}
//                   themeColors={themeColors}
//                 />
//                 <RuleRow
//                   icon={Repeat}
//                   label="Rotation"
//                   value={
//                     circle.rotationStrategy === 'FixedOrder'
//                       ? 'Fixed order'
//                       : circle.rotationStrategy === 'RandomDraw'
//                       ? 'Random draw'
//                       : 'Moderator sets order'
//                   }
//                   themeColors={themeColors}
//                 />
//               </div>
//             </div>

//             {/* Invite link (moderator only, when there are pending slots) */}
//             {isModerator && joinedCount < circle.memberCount && (
//               <div
//                 className="rounded-[14px] border p-3.5"
//                 style={{
//                   backgroundColor: themeColors.circleLight,
//                   borderColor: themeColors.circleMid,
//                 }}
//               >
//                 <div className="flex items-center gap-2">
//                   <UserPlus
//                     size={14}
//                     style={{ color: themeColors.circle }}
//                   />
//                   <p
//                     className="text-[12px] font-semibold"
//                     style={{ color: themeColors.charcoal }}
//                   >
//                     Invite more members
//                   </p>
//                 </div>
//                 <p
//                   className="mt-1 text-[11.5px] leading-[1.55]"
//                   style={{ color: themeColors.mid }}
//                 >
//                   {circle.memberCount - joinedCount} more{' '}
//                   {circle.memberCount - joinedCount === 1 ? 'slot' : 'slots'}{' '}
//                   available. Share the invite link.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={handleCopyInvite}
//                   className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
//                   style={{
//                     borderColor: themeColors.circle,
//                     color: themeColors.circle,
//                     backgroundColor: 'transparent',
//                   }}
//                 >
//                   {copied ? (
//                     <>
//                       <Check size={12} strokeWidth={2.5} />
//                       Copied!
//                     </>
//                   ) : (
//                     <>
//                       <Copy size={12} strokeWidth={2.5} />
//                       Copy invite link
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {/* Recent rounds */}
//             {isActive && circle.currentRound > 1 && (
//               <div
//                 className="rounded-[14px] border p-3.5"
//                 style={{
//                   backgroundColor: themeColors.card,
//                   borderColor: themeColors.border,
//                 }}
//               >
//                 <p
//                   className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: themeColors.mid }}
//                 >
//                   Past rounds
//                 </p>
//                 {Array.from({ length: circle.currentRound - 1 }).map((_, i) => {
//                   const roundNum = i + 1
//                   const recipient = circle.members.find(
//                     (m) => m.position === roundNum
//                   )
//                   return (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between border-b py-2 last:border-b-0"
//                       style={{ borderColor: themeColors.border }}
//                     >
//                       <div className="flex items-center gap-2">
//                         <div
//                           className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
//                           style={{
//                             backgroundColor: themeColors.circleLight,
//                             color: themeColors.circle,
//                           }}
//                         >
//                           {roundNum}
//                         </div>
//                         <div>
//                           <p
//                             className="text-[12px] font-medium"
//                             style={{ color: themeColors.charcoal }}
//                           >
//                             {recipient?.name ?? `Member #${roundNum}`}
//                           </p>
//                           <p
//                             className="text-[10px]"
//                             style={{ color: themeColors.mid }}
//                           >
//                             Round {roundNum}
//                           </p>
//                         </div>
//                       </div>
//                       <p
//                         className="text-[12px] font-semibold"
//                         style={{ color: themeColors.charcoal }}
//                       >
//                         {formatCurrency(circle.roundPool)}
//                       </p>
//                     </div>
//                   )
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {/* ══════════════ TAB: MEMBERS ══════════════ */}
//         {activeTab === 'members' && (
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <p
//                 className="text-[11px] font-semibold uppercase tracking-wider"
//                 style={{ color: themeColors.mid }}
//               >
//                 Rotation order · {acceptedMembers.length} of{' '}
//                 {circle.memberCount} joined
//               </p>
//               {isModerator && (
//                 <button
//                   type="button"
//                   onClick={handleCopyInvite}
//                   className="flex items-center gap-1 text-[11px] font-semibold"
//                   style={{ color: themeColors.circle }}
//                 >
//                   {copied ? (
//                     <>
//                       <Check size={12} /> Copied
//                     </>
//                   ) : (
//                     <>
//                       <UserPlus size={12} /> Invite
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>

//             <div
//               className="overflow-hidden rounded-[14px] border"
//               style={{
//                 backgroundColor: themeColors.card,
//                 borderColor: themeColors.border,
//               }}
//             >
//               {visibleMembers.map((member, i) => (
//                 <MemberRow
//                   key={member.id}
//                   member={member}
//                   index={i}
//                   total={visibleMembers.length}
//                   canReorder={canReorder}
//                   isModerator={isModerator}
//                   themeColors={themeColors}
//                   isDark={isDark}
//                   onMoveUp={() => moveMember(i, -1)}
//                   onMoveDown={() => moveMember(i, 1)}
//                 />
//               ))}
//             </div>

//             {hasMoreMembers && (
//               <button
//                 type="button"
//                 onClick={() => setShowAllMembers((v) => !v)}
//                 className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
//                 style={{
//                   borderColor: themeColors.border,
//                   color: themeColors.charcoal,
//                   backgroundColor: 'transparent',
//                 }}
//               >
//                 {showAllMembers ? (
//                   <>
//                     Show less
//                     <ChevronUp size={12} />
//                   </>
//                 ) : (
//                   <>
//                     Show all {circle.members.length} members
//                     <ChevronDown size={12} />
//                   </>
//                 )}
//               </button>
//             )}

//             {/* Pending invitations section */}
//             {pendingInvites.length > 0 && (
//               <div>
//                 <p
//                   className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: themeColors.mid }}
//                 >
//                   Pending invitations · {pendingInvites.length}
//                 </p>
//                 <div
//                   className="overflow-hidden rounded-[14px] border"
//                   style={{
//                     backgroundColor: themeColors.card,
//                     borderColor: themeColors.border,
//                   }}
//                 >
//                   {pendingInvites.map((member, i) => (
//                     <MemberRow
//                       key={member.id}
//                       member={member}
//                       index={i}
//                       total={pendingInvites.length}
//                       canReorder={false}
//                       isModerator={isModerator}
//                       themeColors={themeColors}
//                       isDark={isDark}
//                       onMoveUp={() => {}}
//                       onMoveDown={() => {}}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ══════════════ TAB: MANAGE (moderator only) ══════════════ */}
//         {activeTab === 'manage' && isModerator && (
//           <div className="space-y-3">
//             {/* Admin actions */}
//             <div
//               className="rounded-[14px] border p-3.5"
//               style={{
//                 backgroundColor: themeColors.card,
//                 borderColor: themeColors.border,
//               }}
//             >
//               <p
//                 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider"
//                 style={{ color: themeColors.mid }}
//               >
//                 Admin actions
//               </p>
//               <div className="space-y-2">
//                 <button
//                   type="button"
//                   onClick={() => navigate(`/dashboard/circles/${circleId}/edit`)}
//                   disabled={!isDraft}
//                   className="flex w-full items-center justify-between rounded-[10px] border px-3 py-3 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
//                   style={{
//                     borderColor: themeColors.border,
//                     color: themeColors.charcoal,
//                     backgroundColor: 'transparent',
//                   }}
//                 >
//                   <span className="flex items-center gap-2">
//                     <Settings size={14} />
//                     Edit rules
//                   </span>
//                   <ChevronRight size={14} />
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleCopyInvite}
//                   className="flex w-full items-center justify-between rounded-[10px] border px-3 py-3 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
//                   style={{
//                     borderColor: themeColors.border,
//                     color: themeColors.charcoal,
//                     backgroundColor: 'transparent',
//                   }}
//                 >
//                   <span className="flex items-center gap-2">
//                     <UserPlus size={14} />
//                     Invite more members
//                   </span>
//                   <ChevronRight size={14} />
//                 </button>
//               </div>
//             </div>

//             {/* Danger zone */}
//             {!isCancelled && !isCompleted && (
//               <div
//                 className="rounded-[14px] border p-3.5"
//                 style={{
//                   backgroundColor: isDark
//                     ? 'rgba(239, 68, 68, 0.06)'
//                     : 'rgba(239, 68, 68, 0.03)',
//                   borderColor: isDark
//                     ? 'rgba(239, 68, 68, 0.25)'
//                     : 'rgba(239, 68, 68, 0.15)',
//                 }}
//               >
//                 <p
//                   className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
//                   style={{ color: '#EF4444' }}
//                 >
//                   Danger zone
//                 </p>
//                 <p
//                   className="mb-2.5 text-[11.5px] leading-[1.55]"
//                   style={{ color: themeColors.mid }}
//                 >
//                   Breaking the circle refunds all collected contributions and
//                   deposits, then ends the circle. This cannot be undone.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(`/dashboard/circles/${circleId}/cancel`)
//                   }
//                   className="flex w-full items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
//                   style={{
//                     backgroundColor: '#EF4444',
//                     color: '#FFFFFF',
//                   }}
//                 >
//                   <AlertTriangle size={12} strokeWidth={2.5} />
//                   Cancel circle
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* PIN modal for contribution */}
//       <PinModal
//         isOpen={isPinOpen}
//         title="Verify PIN"
//         description={`Enter your PIN to contribute ${formatCurrency(
//           circle.contributionAmount
//         )} to ${circle.name} for round ${circle.currentRound}.`}
//         onClose={() => setIsPinOpen(false)}
//         onVerify={handleVerifyPin}
//         isLoading={isContributing}
//         maxLength={6}
//       />
//     </AppLayout>
//   )
// }

// /* ───────────── Sub-components ───────────── */

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   hint,
//   themeColors,
// }: {
//   icon: typeof Calendar
//   label: string
//   value: string
//   hint?: string
//   themeColors: typeof colors | typeof darkColors
// }) {
//   return (
//     <div
//       className="rounded-[14px] border p-3"
//       style={{
//         backgroundColor: themeColors.card,
//         borderColor: themeColors.border,
//       }}
//     >
//       <div className="flex items-center gap-1.5">
//         <Icon size={12} style={{ color: themeColors.mid }} />
//         <p
//           className="text-[10px] font-semibold uppercase tracking-wider"
//           style={{ color: themeColors.mid }}
//         >
//           {label}
//         </p>
//       </div>
//       <p
//         className="mt-1.5 text-[15px] font-bold"
//         style={{ color: themeColors.charcoal }}
//       >
//         {value}
//       </p>
//       {hint && (
//         <p
//           className="mt-0.5 text-[10.5px]"
//           style={{ color: themeColors.mid }}
//         >
//           {hint}
//         </p>
//       )}
//     </div>
//   )
// }

// function RuleRow({
//   icon: Icon,
//   label,
//   value,
//   themeColors,
// }: {
//   icon: typeof Calendar
//   label: string
//   value: string
//   themeColors: typeof colors | typeof darkColors
// }) {
//   return (
//     <div className="flex items-start justify-between gap-3">
//       <div className="flex items-center gap-2">
//         <Icon size={12} style={{ color: themeColors.mid }} />
//         <span className="text-[12px]" style={{ color: themeColors.mid }}>
//           {label}
//         </span>
//       </div>
//       <span
//         className="max-w-[55%] text-right text-[12.5px] font-semibold"
//         style={{ color: themeColors.charcoal }}
//       >
//         {value}
//       </span>
//     </div>
//   )
// }

// function MemberRow({
//   member,
//   index,
//   total,
//   canReorder,
//   isModerator,
//   themeColors,
//   isDark,
//   onMoveUp,
//   onMoveDown,
// }: {
//   member: CircleMember
//   index: number
//   total: number
//   canReorder: boolean
//   isModerator: boolean
//   themeColors: typeof colors | typeof darkColors
//   isDark: boolean
//   onMoveUp: () => void
//   onMoveDown: () => void
// }) {
//   const contributionStyle = getContributionStyle(
//     member.contributionStatus,
//     themeColors,
//     isDark
//   )
//   const isAccepted = member.joinStatus === 'Accepted'

//   return (
//     <div
//       className="flex items-center gap-2.5 px-3 py-3"
//       style={{
//         borderTop: index === 0 ? 'none' : `1px solid ${themeColors.border}`,
//         backgroundColor: member.isYou
//           ? themeColors.circleLight
//           : member.isRecipientThisRound
//           ? isDark
//             ? 'rgba(15, 185, 110, 0.05)'
//             : 'rgba(15, 185, 110, 0.03)'
//           : 'transparent',
//       }}
//     >
//       {/* Reorder arrows (moderator + draft) */}
//       {canReorder && isAccepted ? (
//         <div className="flex flex-col">
//           <button
//             type="button"
//             onClick={onMoveUp}
//             disabled={index === 0}
//             className="flex h-4 w-5 items-center justify-center transition-opacity active:opacity-50 disabled:opacity-25"
//             style={{ color: themeColors.circle }}
//             aria-label="Move up"
//           >
//             <ChevronUp size={12} strokeWidth={3} />
//           </button>
//           <button
//             type="button"
//             onClick={onMoveDown}
//             disabled={index === total - 1}
//             className="flex h-4 w-5 items-center justify-center transition-opacity active:opacity-50 disabled:opacity-25"
//             style={{ color: themeColors.circle }}
//             aria-label="Move down"
//           >
//             <ChevronDown size={12} strokeWidth={3} />
//           </button>
//         </div>
//       ) : (
//         <div className="w-5" />
//       )}

//       {/* Position badge */}
//       <div className="relative shrink-0">
//         <div
//           className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold"
//           style={{
//             backgroundColor:
//               member.isYou || member.isRecipientThisRound
//                 ? themeColors.circle
//                 : isDark
//                 ? 'rgba(255,255,255,0.08)'
//                 : 'rgba(0,0,0,0.05)',
//             color:
//               member.isYou || member.isRecipientThisRound
//                 ? '#FFFFFF'
//                 : themeColors.charcoal,
//           }}
//         >
//           {member.initials}
//         </div>
//         {member.position !== null && (
//           <span
//             className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
//             style={{
//               backgroundColor: themeColors.card,
//               color: themeColors.mid,
//               border: `1px solid ${themeColors.border}`,
//             }}
//           >
//             {member.position}
//           </span>
//         )}
//       </div>

//       {/* Name + status */}
//       <div className="min-w-0 flex-1">
//         <div className="flex items-center gap-1.5">
//           <p
//             className="truncate text-[13px] font-semibold"
//             style={{ color: themeColors.charcoal }}
//           >
//             {member.name}
//           </p>
//           {member.isYou && (
//             <span
//               className="text-[10px] font-normal"
//               style={{ color: themeColors.mid }}
//             >
//               (you)
//             </span>
//           )}
//           {member.isModerator && (
//             <Crown
//               size={10}
//               style={{ color: themeColors.circle }}
//             />
//           )}
//         </div>
//         <p
//           className="mt-0.5 truncate text-[10.5px]"
//           style={{ color: themeColors.mid }}
//         >
//           {isAccepted
//             ? member.isRecipientThisRound
//               ? 'Receiving this round'
//               : member.hasReceived
//               ? 'Payout received'
//               : member.contributionStatus === 'Paid'
//               ? 'Contributed'
//               : member.contributionStatus === 'Pending'
//               ? 'Awaiting contribution'
//               : member.contributionStatus === 'Missed'
//               ? 'Missed contribution'
//               : member.contributionStatus === 'Defaulted'
//               ? 'Defaulted'
//               : ''
//             : member.joinStatus === 'Invited'
//             ? 'Invite pending'
//             : 'Declined'}
//         </p>
//       </div>

//       {/* Status badges */}
//       <div className="flex shrink-0 items-center gap-1.5">
//         {isAccepted && member.contributionStatus !== 'NotStarted' && (
//           <span
//             className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
//             style={{
//               backgroundColor: contributionStyle.bg,
//               color: contributionStyle.text,
//             }}
//           >
//             {member.contributionStatus === 'Paid'
//               ? 'Paid'
//               : member.contributionStatus === 'Pending'
//               ? 'Due'
//               : member.contributionStatus === 'Missed'
//               ? 'Missed'
//               : member.contributionStatus}
//           </span>
//         )}

//         {!isAccepted && (
//           <span
//             className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
//             style={{
//               backgroundColor: isDark
//                 ? 'rgba(245, 158, 11, 0.15)'
//                 : 'rgba(245, 158, 11, 0.1)',
//               color: '#F59E0B',
//             }}
//           >
//             Invited
//           </span>
//         )}

//         {/* Icon indicator */}
//         {member.isRecipientThisRound && (
//           <Trophy size={14} style={{ color: themeColors.circle }} />
//         )}
//         {isAccepted && member.contributionStatus === 'Paid' && !member.isRecipientThisRound && (
//           <CheckCircle size={14} style={{ color: themeColors.circle }} />
//         )}
//         {isAccepted && member.contributionStatus === 'Pending' && (
//           <Clock size={14} style={{ color: themeColors.mid }} />
//         )}
//       </div>
//     </div>
//   )
// }