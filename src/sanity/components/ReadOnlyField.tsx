import type { InputProps } from 'sanity'

export function ReadOnlyField(props: InputProps) {
  return (
    <div style={{ cursor: 'not-allowed' }}>
      <div style={{ pointerEvents: 'none' }}>{props.renderDefault(props)}</div>
    </div>
  )
}
