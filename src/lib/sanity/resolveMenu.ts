import type { MenuItem, NavLink } from '@/types/sanity'

export function resolveMenu(items?: MenuItem[]): NavLink[] {
  if (!items) return []

  return items
    .map((item) => {
      if (item.customLink) {
        return {
          label: item.label || '',
          href: item.href || '/',
        }
      }

      if (!item.page) return null

      return {
        label: item.label || item.page.title,
        href: `/${item.page.slug.current}`,
      }
    })
    .filter((link): link is NavLink => link !== null && link.label !== '')
}
