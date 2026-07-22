export interface SubCategory {
  id: string
  name: string
  tier: number
  active: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  defaultPriority: string
  slaPolicy: string
  active: boolean
  count: number
  sub: SubCategory[]
}

export const CATEGORY_COLORS = [
  { value: '#F26722', label: 'Brand orange' },
  { value: '#2563EB', label: 'Blue' },
  { value: '#16A34A', label: 'Green' },
  { value: '#D97706', label: 'Amber' },
  { value: '#7C3AED', label: 'Purple' },
  { value: '#DC2626', label: 'Red' },
  { value: '#0891B2', label: 'Cyan' },
] as const

export const PRIORITY_OPTIONS = ['P1', 'P2', 'P3', 'P4'] as const

export const SLA_POLICY_OPTIONS = [
  'Standard SLA',
  'Finance SLA',
  'Critical SLA',
  'Basic SLA',
] as const

export const TIER_LABELS: Record<number, string> = { 1: 'T1', 2: 'T2', 3: 'T3', 4: 'T4' }

export const TIER_COLORS: Record<number, string> = {
  1: 'bg-info-bg text-info',
  2: 'bg-warning-bg text-warning',
  3: 'bg-danger-bg text-danger',
  4: 'bg-brand/10 text-brand',
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Technical',
    description: 'Platform, API, and integration issues',
    color: '#2563EB',
    defaultPriority: 'P2',
    slaPolicy: 'Standard SLA',
    active: true,
    count: 98,
    sub: [
      { id: 's1', name: 'API / Integration', tier: 2, active: true },
      { id: 's2', name: 'Platform Bug', tier: 2, active: true },
      { id: 's3', name: 'Performance Issue', tier: 2, active: true },
      { id: 's4', name: 'Login / Access', tier: 1, active: true },
      { id: 's5', name: 'Mobile App', tier: 1, active: false },
    ],
  },
  {
    id: 'cat-2',
    name: 'Billing',
    description: 'Invoices, refunds, and payment disputes',
    color: '#D97706',
    defaultPriority: 'P2',
    slaPolicy: 'Finance SLA',
    active: true,
    count: 64,
    sub: [
      { id: 's6', name: 'Invoice Query', tier: 1, active: true },
      { id: 's7', name: 'Overcharge / Dispute', tier: 2, active: true },
      { id: 's8', name: 'Refund Request', tier: 2, active: true },
    ],
  },
  {
    id: 'cat-3',
    name: 'Shipment / Tracking',
    description: 'Container status, GPS, and port delays',
    color: '#16A34A',
    defaultPriority: 'P3',
    slaPolicy: 'Standard SLA',
    active: true,
    count: 72,
    sub: [
      { id: 's9', name: 'Container Status', tier: 1, active: true },
      { id: 's10', name: 'GPS / Telematics', tier: 2, active: true },
      { id: 's11', name: 'Port Delay', tier: 1, active: true },
    ],
  },
  {
    id: 'cat-4',
    name: 'Security',
    description: 'Access incidents and compliance concerns',
    color: '#DC2626',
    defaultPriority: 'P1',
    slaPolicy: 'Critical SLA',
    active: true,
    count: 14,
    sub: [
      { id: 's12', name: 'Unauthorized Access', tier: 3, active: true },
      { id: 's13', name: 'Data Breach Concern', tier: 4, active: true },
    ],
  },
  {
    id: 'cat-5',
    name: 'How-to / General',
    description: 'Guides, configuration help, and general enquiries',
    color: '#7C3AED',
    defaultPriority: 'P4',
    slaPolicy: 'Basic SLA',
    active: true,
    count: 28,
    sub: [
      { id: 's14', name: 'Configuration Help', tier: 1, active: true },
      { id: 's15', name: 'User Guide', tier: 1, active: true },
    ],
  },
]

const STORAGE_KEY = 'vw-category-config'

export function loadCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CATEGORIES
    return JSON.parse(raw) as Category[]
  } catch {
    return DEFAULT_CATEGORIES
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export function getCategoryById(id: string): Category | undefined {
  return loadCategories().find((c) => c.id === id)
}

export function upsertCategory(category: Category): void {
  const list = loadCategories()
  const idx = list.findIndex((c) => c.id === category.id)
  if (idx >= 0) list[idx] = category
  else list.unshift(category)
  saveCategories(list)
}

export function deleteCategory(id: string): void {
  saveCategories(loadCategories().filter((c) => c.id !== id))
}

export function createCategoryId(): string {
  return `cat-${Date.now()}`
}

export function createSubCategoryId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export type CategoryFormValues = Omit<Category, 'id' | 'count'> & { id?: string }

export function emptyCategoryForm(): CategoryFormValues {
  return {
    name: '',
    description: '',
    color: CATEGORY_COLORS[0].value,
    defaultPriority: 'P2',
    slaPolicy: 'Standard SLA',
    active: true,
    sub: [],
  }
}
