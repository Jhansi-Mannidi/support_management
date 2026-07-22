import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function PortalSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="portal">{children}</AuthenticatedShell>
}
