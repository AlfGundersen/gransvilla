import { CopyIcon, TrashIcon, PublishIcon } from '@sanity/icons'
import { useDocumentOperation } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

export const PublishActionNO: DocumentActionComponent = (props) => {
  const { publish } = useDocumentOperation(props.id, props.type)
  const disabled = publish.disabled

  if (props.type === 'personvernerklaering') {
    return null
  }

  return {
    label: 'Publiser',
    icon: PublishIcon,
    disabled: Boolean(disabled),
    onHandle: () => {
      publish.execute()
      props.onComplete()
    },
  }
}

export const DuplicateActionNO: DocumentActionComponent = (props) => {
  const { duplicate } = useDocumentOperation(props.id, props.type)

  return {
    label: 'Dupliser',
    icon: CopyIcon,
    onHandle: () => {
      duplicate.execute(props.draft || props.published)
      props.onComplete()
    },
  }
}

export const DeleteActionNO: DocumentActionComponent = (props) => {
  const { delete: deleteOp } = useDocumentOperation(props.id, props.type)

  return {
    label: 'Slett',
    icon: TrashIcon,
    tone: 'critical',
    onHandle: () => {
      if (window.confirm('Er du sikker på at du vil slette dette dokumentet?')) {
        deleteOp.execute()
        props.onComplete()
      }
    },
  }
}
