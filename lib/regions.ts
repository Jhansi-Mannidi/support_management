export const APP_REGIONS = [
  { value: 'all', label: 'All regions' },
  { value: 'IN-South', label: 'IN-South' },
  { value: 'EU-West', label: 'EU-West' },
  { value: 'GCC', label: 'GCC' },
] as const

export type AppRegion = (typeof APP_REGIONS)[number]['value']

/** Tenant → hosting region (demo data) */
export const TENANT_REGIONS: Record<string, string> = {
  'Meridian Freight': 'IN-South',
  'Hanseatic Logistics': 'EU-West',
  'Apex Cold Chain': 'IN-South',
  'SilkRoute Express': 'GCC',
  'BlueSky Freight': 'GCC',
}

export function tenantRegion(tenant: string): string {
  return TENANT_REGIONS[tenant] ?? 'IN-South'
}

export function matchesRegion(tenant: string, region: AppRegion): boolean {
  if (region === 'all') return true
  return tenantRegion(tenant) === region
}
