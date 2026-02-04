import s from '../skeleton.module.css'
import p from './page.module.css'

export default function PageLoading() {
  return (
    <div className={p.eventPage}>
      <div className={p.eventGrid}>
        {/* Title */}
        <div className={p.eventTitle}>
          <div className={`${s.bone} ${s.h1}`} style={{ maxWidth: '100%' }} />
        </div>

        {/* Featured image */}
        <div className={p.featuredImage}>
          <div className={`${s.bone} ${s.image16x9}`} />
        </div>

        {/* Text block placeholders */}
        <div style={{ gridColumn: '1 / -1', paddingTop: 'var(--space-lg)' }}>
          <div className={`${s.bone} ${s.text}`} />
          <div className={`${s.bone} ${s.text}`} style={{ marginTop: 'var(--space-sm)' }} />
          <div className={`${s.bone} ${s.textShort}`} style={{ marginTop: 'var(--space-sm)' }} />
        </div>
      </div>
    </div>
  )
}
