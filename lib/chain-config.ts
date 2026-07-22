export interface ChainStep {
  id: string
  tier: number
  label: string
  role: string
  slaLimit: string
  triggerType: string
}

export interface EscalationChain {
  id: string
  name: string
  description: string
  appliesTo: string
  active: boolean
  steps: ChainStep[]
}

export const TRIGGER_TYPES = [
  'SLA Breach',
  'SLA Breach / Manual',
  'Manual',
  'Manual / Skip-level',
  'Skip-level',
  'Immediate',
] as const

export const CHAIN_ROLES = [
  'Department Support Admin',
  'Branch Support Admin',
  'Tenant Admin',
  'Finance Support Admin',
  'VoltusWave Falcon Engineer',
] as const

export const STEP_TIER_STYLES: Record<number, string> = {
  1: 'bg-info-bg text-info border-info/20',
  2: 'bg-warning-bg text-warning border-warning/20',
  3: 'bg-danger-bg text-danger border-danger/20',
  4: 'bg-brand/10 text-brand border-brand/20',
}

export function getStepStyle(tier: number): string {
  return STEP_TIER_STYLES[tier] ?? STEP_TIER_STYLES[1]
}

const STORAGE_KEY = 'vw-chain-config'

export const DEFAULT_CHAINS: EscalationChain[] = [
  {
    id: 'chain-1',
    name: 'Standard Escalation',
    description: 'Default escalation path for most tickets',
    appliesTo: 'Technical, How-to',
    active: true,
    steps: [
      { id: 'st-1-1', tier: 1, label: 'Tier 1 — Dept Support', role: 'Department Support Admin', slaLimit: '4h (P2) · 1h (P1)', triggerType: 'SLA Breach' },
      { id: 'st-1-2', tier: 2, label: 'Tier 2 — Branch Support', role: 'Branch Support Admin', slaLimit: '8h (P2) · 2h (P1)', triggerType: 'SLA Breach / Manual' },
      { id: 'st-1-3', tier: 3, label: 'Tier 3 — Company Admin', role: 'Tenant Admin', slaLimit: '24h (P2) · 4h (P1)', triggerType: 'SLA Breach / Manual' },
      { id: 'st-1-4', tier: 4, label: 'Tier 4 — Falcon', role: 'VoltusWave Falcon Engineer', slaLimit: '48h (P2) · 8h (P1)', triggerType: 'Manual / Skip-level' },
    ],
  },
  {
    id: 'chain-2',
    name: 'Critical / Security Path',
    description: 'Skip-level escalation for P1 and Security tickets',
    appliesTo: 'Security, P1 override',
    active: true,
    steps: [
      { id: 'st-2-1', tier: 1, label: 'Tier 1 — Dept Support', role: 'Department Support Admin', slaLimit: '30m', triggerType: 'Immediate' },
      { id: 'st-2-2', tier: 3, label: 'Tier 3 — Company Admin (skip T2)', role: 'Tenant Admin', slaLimit: '1h', triggerType: 'Skip-level' },
      { id: 'st-2-3', tier: 4, label: 'Tier 4 — Falcon', role: 'VoltusWave Falcon Engineer', slaLimit: '2h', triggerType: 'SLA Breach' },
    ],
  },
  {
    id: 'chain-3',
    name: 'Finance / Billing Path',
    description: 'Billing disputes and invoice issues routing',
    appliesTo: 'Billing',
    active: true,
    steps: [
      { id: 'st-3-1', tier: 1, label: 'Tier 1 — Dept Support', role: 'Department Support Admin', slaLimit: '8h', triggerType: 'SLA Breach' },
      { id: 'st-3-2', tier: 2, label: 'Tier 2 — Finance Desk', role: 'Finance Support Admin', slaLimit: '16h', triggerType: 'SLA Breach / Manual' },
      { id: 'st-3-3', tier: 3, label: 'Tier 3 — Company Admin', role: 'Tenant Admin', slaLimit: '48h', triggerType: 'Manual' },
    ],
  },
  {
    id: 'chain-4',
    name: 'Logistics Operations',
    description: 'Shipment tracking and GPS issues',
    appliesTo: 'Shipment/Tracking',
    active: false,
    steps: [
      { id: 'st-4-1', tier: 1, label: 'Tier 1 — Ops Support', role: 'Department Support Admin', slaLimit: '4h', triggerType: 'SLA Breach' },
      { id: 'st-4-2', tier: 2, label: 'Tier 2 — Branch Ops', role: 'Branch Support Admin', slaLimit: '12h', triggerType: 'SLA Breach' },
    ],
  },
]

export function loadChains(): EscalationChain[] {
  if (typeof window === 'undefined') return DEFAULT_CHAINS
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CHAINS
    return JSON.parse(raw) as EscalationChain[]
  } catch {
    return DEFAULT_CHAINS
  }
}

export function saveChains(chains: EscalationChain[]): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chains))
}

export function getChainById(id: string): EscalationChain | undefined {
  return loadChains().find((c) => c.id === id)
}

export function upsertChain(chain: EscalationChain): void {
  const list = loadChains()
  const idx = list.findIndex((c) => c.id === chain.id)
  if (idx >= 0) list[idx] = chain
  else list.unshift(chain)
  saveChains(list)
}

export function deleteChain(id: string): void {
  saveChains(loadChains().filter((c) => c.id !== id))
}

export function createChainId(): string {
  return `chain-${Date.now()}`
}

export function createStepId(): string {
  return `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export type ChainFormValues = Omit<EscalationChain, 'id'> & { id?: string }

export function emptyChainForm(): ChainFormValues {
  return {
    name: '',
    description: '',
    appliesTo: '',
    active: true,
    steps: [
      {
        id: createStepId(),
        tier: 1,
        label: 'Tier 1 — Dept Support',
        role: 'Department Support Admin',
        slaLimit: '4h (P2) · 1h (P1)',
        triggerType: 'SLA Breach',
      },
      {
        id: createStepId(),
        tier: 2,
        label: 'Tier 2 — Branch Support',
        role: 'Branch Support Admin',
        slaLimit: '8h (P2) · 2h (P1)',
        triggerType: 'SLA Breach / Manual',
      },
    ],
  }
}
