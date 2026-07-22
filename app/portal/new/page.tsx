import { redirect } from 'next/navigation'

type PageProps = {
  searchParams: Promise<{ category?: string }>
}

/** Legacy URL — always use the app shell route. */
export default async function PortalNewRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category?.trim()
  redirect(category ? `/app/raise?category=${encodeURIComponent(category)}` : '/app/raise')
}
