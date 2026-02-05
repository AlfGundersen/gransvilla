import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Flex } from '@sanity/ui'
import { type NavbarProps, useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { useEffect, useState, useCallback } from 'react'

const BASE_URL = 'https://gransvilla.no'

// Map document types to their public URLs
const STATIC_ROUTES: Record<string, string> = {
  frontpage: '/',
  siteSettings: '/',
  arrangementerSettings: '/arrangementer',
  personvernerklaering: '/personvern',
  salgsvilkar: '/salgsvilkar',
}

// Document types that have dynamic slugs
const SLUG_TYPES = ['page', 'event']

// Extract document ID from Sanity Studio URL
function extractDocumentIdFromUrl(): string | null {
  const path = window.location.pathname

  // Find all semicolon-separated segments and get the LAST document ID
  // URL patterns:
  // - /studio/struktur/page;documentId
  // - /studio/struktur/arrangementer,arrangementsider,event;documentId
  const matches = path.match(/;([a-zA-Z0-9-_.]+)/g)
  if (matches && matches.length > 0) {
    // Get the last match and remove the semicolon
    const lastMatch = matches[matches.length - 1]
    return lastMatch.replace(';', '')
  }

  // Match singleton documents like /studio/struktur/frontpage
  const singletonMatch = path.match(/\/studio\/struktur\/([a-zA-Z]+)$/)
  if (singletonMatch) {
    return singletonMatch[1]
  }

  return null
}

export function StudioNavbar(props: NavbarProps) {
  const router = useRouter()
  const client = useClient({ apiVersion: '2024-01-01' })
  const [targetUrl, setTargetUrl] = useState(BASE_URL)

  const updateTargetUrl = useCallback(() => {
    const documentId = extractDocumentIdFromUrl()

    if (!documentId) {
      setTargetUrl(BASE_URL)
      return
    }

    // Check if it's a known singleton (URL path matches static route key)
    if (STATIC_ROUTES[documentId]) {
      setTargetUrl(BASE_URL + STATIC_ROUTES[documentId])
      return
    }

    // Fetch document type and slug from Sanity
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
  }, [client])

  // Update URL when router state changes
  useEffect(() => {
    updateTargetUrl()
  }, [router.state, updateTargetUrl])

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
