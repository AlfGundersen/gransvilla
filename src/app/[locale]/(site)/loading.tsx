import p from './page.module.css'
import s from './skeleton.module.css'

export default function HomeLoading() {
  return (
    <div className={p.page}>
      {/* Hero */}
      <div className={p.hero}>
        <div className={`${s.bone} ${s.h1}`} style={{ margin: '0 auto' }} />
        <div className={`${s.bone} ${s.text}`} style={{ maxWidth: '40%', margin: '1rem auto 0' }} />
      </div>

      <div className={p.container}>
        {/* Featured section */}
        <div className={p.section}>
          <div className={`${s.bone} ${s.h2}`} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-lg)',
            }}
          >
            {[0, 1].map((i) => (
              <div key={i}>
                <div className={`${s.bone} ${s.image16x9}`} />
                <div className={`${s.bone} ${s.h3}`} style={{ marginTop: 'var(--space-md)' }} />
                <div className={`${s.bone} ${s.text}`} style={{ marginTop: 'var(--space-sm)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Events / timeline spacer */}
        <div className={p.section}>
          <div className={`${s.bone} ${s.h2}`} />
          <div className={`${s.bone} ${s.image16x9}`} style={{ marginTop: 'var(--space-lg)' }} />
        </div>

        {/* Product section spacer */}
        <div className={p.section}>
          <div className={`${s.bone} ${s.h2}`} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-lg)',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className={`${s.bone} ${s.imageSquare}`} />
                <div className={`${s.bone} ${s.text}`} style={{ marginTop: 'var(--space-sm)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
