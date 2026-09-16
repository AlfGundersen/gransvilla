import s from '../skeleton.module.css'
import p from './page.module.css'

/**
 * Mirrors the event layout rather than sketching a generic page: the sticky
 * title column with its sibling nav, the 16:9 hero, and a first
 * text section in the right-hand columns. A skeleton that sits where the real
 * content lands is what keeps a navigation from looking like a blank page that
 * fills in piece by piece.
 */
export default function PageLoading() {
  return (
    <div className={`${p.eventPage} ${s.page}`}>
      <div className={p.eventGrid}>
        {/* Title column — back link, title, sibling events */}
        <div className={p.titleCol}>
          <div className={p.titleSticky}>
            <div className={`${s.bone} ${s.h1}`} style={{ maxWidth: '100%' }} />
            <div className={p.otherEvents}>
              <div className={`${s.bone} ${s.textXs}`} style={{ maxWidth: '9rem' }} />
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`${s.bone} ${s.text}`}
                  style={{ maxWidth: '75%', marginTop: 'var(--space-xs)' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Featured image */}
        <div className={p.featuredImage}>
          <div className={`${s.bone} ${s.image16x9}`} />
        </div>

        {/* First text section */}
        <div
          style={{
            gridColumn: '2 / -1',
            paddingTop: 'var(--space-lg)',
            paddingLeft: 'var(--space-lg)',
          }}
        >
          <div className={`${s.bone} ${s.text}`} />
          <div className={`${s.bone} ${s.text}`} style={{ marginTop: 'var(--space-sm)' }} />
          <div className={`${s.bone} ${s.textShort}`} style={{ marginTop: 'var(--space-sm)' }} />
        </div>
      </div>
    </div>
  )
}
