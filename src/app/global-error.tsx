'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="no">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ipo0piy.css" />
      </head>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Noe gikk galt
          </h1>
          <p style={{ color: '#666', marginTop: '1.5rem', maxWidth: '40ch' }}>
            Vi beklager, men noe uventet skjedde.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 2rem',
              border: '1px solid #000',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Prøv igjen
          </button>
        </div>
      </body>
    </html>
  )
}
