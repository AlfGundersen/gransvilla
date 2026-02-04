import { EditIcon } from '@sanity/icons'
import { useDocumentOperation } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

export const UnpublishAction: DocumentActionComponent = (props) => {
  const { unpublish } = useDocumentOperation(props.id, props.type)

  if (!props.published) {
    return null
  }

  return {
    label: 'Gjør til utkast',
    icon: EditIcon,
    tone: 'caution',
    onHandle: () => {
      unpublish.execute()
      props.onComplete()
    },
  }
}
