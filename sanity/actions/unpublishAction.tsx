import { TrashIcon } from '@sanity/icons'
import { useDocumentOperation } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

export const UnpublishAction: DocumentActionComponent = (props) => {
  const { unpublish } = useDocumentOperation(props.id, props.type)

  if (!props.published) {
    return null
  }

  return {
    label: 'Avpubliser',
    icon: TrashIcon,
    tone: 'critical',
    onHandle: () => {
      unpublish.execute()
      props.onComplete()
    },
  }
}
