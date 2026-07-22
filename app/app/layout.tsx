import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="app">{children}</AuthenticatedShell>
}
