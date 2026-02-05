import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Flex } from '@sanity/ui'
import { type NavbarProps, useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { useEffect, useState } from 'react'

const BASE_URL = 'https://gransvilla.no'

// Map document types to their public URLs
const STATIC_ROUTES: Record<string, string> = {
  frontpage: '/',
  siteSettings: '/',
  arrangementerSettings: '/arrangementer',
  nettbutikkSettings: '/butikken',
  shopCategory: '/butikken',
  personvernerklaering: '/personvern',
}

// Document types that have dynamic slugs
const SLUG_TYPES = ['page', 'event']

interface RouterState {
  panes?: Array<Array<{ id?: string }>>
  type?: string
  id?: string
}

export function StudioNavbar(props: NavbarProps) {
  const router = useRouter()
  const client = useClient({ apiVersion: '2024-01-01' })
  const [targetUrl, setTargetUrl] = useState(BASE_URL)

  useEffect(() => {
    const routerState = router.state as RouterState | undefined

    // Try to extract document ID from panes structure (Sanity's internal routing)
    let documentId: string | undefined

    // Check panes array (structure tool navigation)
    if (routerState?.panes) {
      const lastPane = routerState.panes[routerState.panes.length - 1]
      if (Array.isArray(lastPane) && lastPane[0]?.id) {
        documentId = lastPane[0].id
      }
    }

    // Fallback to direct id on state
    if (!documentId && routerState?.id) {
      documentId = routerState.id
    }

    if (!documentId) {
      setTargetUrl(BASE_URL)
      return
    }

    // Fetch document type and slug
    client
      .fetch<{ _type: string; slug?: { current: string } } | null>(
        `*[_id == $id || _id == "drafts." + $id][0]{ _type, slug }`,
        { id: documentId.replace(/^drafts\./, '') }
      )
      .then((doc) => {
        if (!doc) {
          setTargetUrl(BASE_URL)
          return
        }

        // Check static routes first
        if (STATIC_ROUTES[doc._type]) {
          setTargetUrl(BASE_URL + STATIC_ROUTES[doc._type])
          return
        }

        // For pages and events, use slug
        if (SLUG_TYPES.includes(doc._type) && doc.slug?.current) {
          setTargetUrl(`${BASE_URL}/${doc.slug.current}`)
          return
        }

        // Default to homepage
        setTargetUrl(BASE_URL)
      })
      .catch(() => {
        setTargetUrl(BASE_URL)
      })
  }, [router.state, client])

  const handleOpenSite = () => {
    window.open(targetUrl, '_blank')
  }

  return (
    <Flex align="center" style={{ width: '100%' }}>
      <Box flex={1}>{props.renderDefault(props)}</Box>
      <Box paddingX={3}>
        <Button
          icon={LaunchIcon}
          mode="bleed"
          tone="primary"
          text="Gå til nettside"
          onClick={handleOpenSite}
        />
      </Box>
    </Flex>
  )
}
