export interface SupportTeamMember {
  id: string
  name: string
  initials: string
  role: string
  tier: number
}

export const SUPPORT_TEAM: SupportTeamMember[] = [
  { id: 'm1', name: 'Arjun Mehta', initials: 'AM', role: 'Branch Support Admin', tier: 2 },
  { id: 'm2', name: 'Sneha Pillai', initials: 'SP', role: 'Tenant Admin', tier: 3 },
  { id: 'm3', name: 'Devika Rao', initials: 'DR', role: 'Technical Support', tier: 2 },
  { id: 'm4', name: 'Kiran Bose', initials: 'KB', role: 'Billing Specialist', tier: 1 },
  { id: 'm5', name: 'Neha Kapoor', initials: 'NK', role: 'Platform Engineer', tier: 4 },
]

export const CURRENT_USER = SUPPORT_TEAM[0]
