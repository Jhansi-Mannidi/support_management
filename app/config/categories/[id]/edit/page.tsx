'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Tag } from 'lucide-react'
import { CategoryFormPage } from '@/components/config/category-form-page'
import { PageContainer } from '@/components/motion/motion-primitives'
import { usePageBreadcrumb } from '@/components/providers/breadcrumb-provider'
import { getCategoryById, type Category } from '@/lib/category-config'

export default function EditCategoryPage() {
  const params = useParams()
  const id = params.id as string
  const [category, setCategory] = useState<Category | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setCategory(getCategoryById(id) ?? null)
    setLoaded(true)
  }, [id])

  usePageBreadcrumb({
    categoryLabel: category?.name ?? 'Edit Category',
  })

  if (!loaded) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </PageContainer>
    )
  }

  if (!category) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-20 text-center">
        <Tag className="mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-bold">Category not found</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">The category may have been removed.</p>
        <Link
          href="/config/categories"
          className="mt-4 flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to categories
        </Link>
      </PageContainer>
    )
  }

  return <CategoryFormPage mode="edit" initial={category} />
}
