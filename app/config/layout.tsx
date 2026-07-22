import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function ConfigSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="config">{children}</AuthenticatedShell>
}
