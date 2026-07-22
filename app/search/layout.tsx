import { AuthenticatedShell } from '@/components/authenticated-shell'

export default function SearchSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell segment="search">{children}</AuthenticatedShell>
}
