import { useDocumentOperation } from 'sanity'
import { useState } from 'react'

export function SetOppdatertOnPublish(props: {
  id: string
  type: string
  draft: { _id: string } | null
  published: { _id: string } | null
  onComplete: () => void
}) {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isPublishing, setIsPublishing] = useState(false)

  return {
    disabled: !props.draft,
    label: isPublishing ? 'Publiserer…' : 'Publiser',
    onHandle: () => {
      setIsPublishing(true)
      patch.execute([{ set: { oppdatert: new Date().toISOString() } }])
      publish.execute()
      props.onComplete()
    },
  }
}
