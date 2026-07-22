import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function SettingsSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="settings">{children}</AuthenticatedShell>
}
