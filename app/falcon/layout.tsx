import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function FalconSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="falcon">{children}</AuthenticatedShell>
}
