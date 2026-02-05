import { LaunchIcon } from '@sanity/icons'
import { Box, Button, Flex } from '@sanity/ui'
import { type NavbarProps } from 'sanity'

export function StudioNavbar(props: NavbarProps) {
  const handleOpenSite = () => {
    window.open('https://gransvilla.no', '_blank')
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
