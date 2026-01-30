import { useCallback, useEffect, useRef, useState } from 'react'
import { type StringInputProps, useClient, useFormValue, set, unset } from 'sanity'
import { Text, Stack } from '@sanity/ui'

export function AltTextInput(props: StringInputProps) {
  const { value, onChange, path } = props
  const client = useClient({ apiVersion: '2024-01-01' })

  // Build path to the parent image's asset._ref
  // path is e.g. ['bilde', 'alt'] or ['bilder', 0, 'alt'] or ['featuredImage', 'alt']
  const parentPath = path.slice(0, -1)
  const assetPath = [...parentPath, 'asset', '_ref']
  const assetRef = useFormValue(assetPath) as string | undefined

  const [assetAltText, setAssetAltText] = useState<string | null>(null)
  const prevAssetRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!assetRef) {
      setAssetAltText(null)
      prevAssetRef.current = undefined
      return
    }

    client
      .fetch<string | null>(`*[_id == $id][0].altText`, { id: assetRef })
      .then((altText) => {
        setAssetAltText(altText || null)

        // Auto-fill only when the asset just changed (new image selected) and the field is empty
        const assetChanged = assetRef !== prevAssetRef.current
        if (altText && !value && assetChanged) {
          onChange(set(altText))
        }
        prevAssetRef.current = assetRef
      })
      .catch(() => {
        setAssetAltText(null)
        prevAssetRef.current = assetRef
      })
  }, [assetRef, client, onChange, value])

  // Pass the media library alt text as placeholder so it's visible when the field is empty
  const modifiedProps = {
    ...props,
    elementProps: {
      ...props.elementProps,
      placeholder: assetAltText ? `Fra mediebiblioteket: ${assetAltText}` : props.elementProps?.placeholder,
    },
  }

  return (
    <Stack space={2}>
      {props.renderDefault(modifiedProps)}
      {assetAltText && value === assetAltText && (
        <Text size={0} muted>
          Hentet fra mediebiblioteket. Rediger for å overstyre.
        </Text>
      )}
    </Stack>
  )
}
