import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Flex } from '@sanity/ui'
import { type NavbarProps } from 'sanity'

export function StudioNavbar(props: NavbarProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gransvilla.no'

  const handleOpenSite = () => {
    // Open site with draft mode disabled
    window.open(`${siteUrl}/api/draft-mode/disable?redirect=/`, '_blank')
  }

  return (
    <Flex align="center" style={{ width: '100%' }}>
      <Box flex={1}>{props.renderDefault(props)}</Box>
      <Box paddingRight={3}>
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
