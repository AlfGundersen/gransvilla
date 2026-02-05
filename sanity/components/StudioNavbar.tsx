import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Flex } from '@sanity/ui'
import { type NavbarProps, useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { useEffect, useState } from 'react'

const BASE_URL = 'https://gransvilla.no'

export function StudioNavbar(props: NavbarProps) {
  const router = useRouter()
  const client = useClient({ apiVersion: '2024-01-01' })
  const [targetUrl, setTargetUrl] = useState(BASE_URL)

  useEffect(() => {
    // Parse router state to get document info
    const routerState = router.state as { type?: string; id?: string } | undefined

    if (!routerState?.type || !routerState?.id) {
      setTargetUrl(BASE_URL)
      return
    }

    const { type, id } = routerState

    // Only fetch slug for pages and events (arrangementer)
    if (type === 'page' || type === 'event') {
      client
        .fetch<string | null>(`*[_id == $id][0].slug.current`, { id })
        .then((slug) => {
          setTargetUrl(slug ? `${BASE_URL}/${slug}` : BASE_URL)
        })
        .catch(() => {
          setTargetUrl(BASE_URL)
        })
    } else {
      // All other document types just go to homepage
      setTargetUrl(BASE_URL)
    }
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
