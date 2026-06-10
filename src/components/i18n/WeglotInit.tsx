import Script from 'next/script'

declare global {
  interface Window {
    Weglot?: {
      switchTo: (lang: string) => void
      getCurrentLang: () => string
      on: (event: string, callback: (...args: unknown[]) => void) => void
      off: (event: string, callback: (...args: unknown[]) => void) => boolean
    }
  }
}

/**
 * Loads Weglot via Next.js Script with `afterInteractive` strategy, then
 * initializes it with this project's API key. The default switcher is hidden
 * (`hide_switcher: true`) — we render our own `<LanguageSwitcher>` in the
 * header. Studio + API routes are excluded from translation.
 *
 * Requires NEXT_PUBLIC_WEGLOT_API_KEY in env. If unset, no script loads.
 */
export default function WeglotInit() {
  const apiKey = process.env.NEXT_PUBLIC_WEGLOT_API_KEY
  if (!apiKey) return null

  return (
    <>
      <Script src="https://cdn.weglot.com/weglot.min.js" strategy="afterInteractive" />
      <Script id="weglot-init" strategy="afterInteractive">
        {`
          (function initWeglot() {
            if (typeof Weglot === 'undefined') {
              setTimeout(initWeglot, 100);
              return;
            }
            Weglot.initialize({
              api_key: '${apiKey}',
              cookie: true,
              cache: true,
              wait_transition: false,
              hide_switcher: true,
              excluded_blocks: [{ value: '.language-switcher-button' }],
              excluded_paths: [
                { value: '/studio', type: 'START_WITH' },
                { value: '/api', type: 'START_WITH' }
              ],
              dynamics: [{ value: '#main-content' }]
            });
            Weglot.on('initialized', function() {
              window.dispatchEvent(new Event('weglot:ready'));
            });
          })();
        `}
      </Script>
    </>
  )
}
