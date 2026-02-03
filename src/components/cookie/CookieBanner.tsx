'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCookieConsent } from '@/context/CookieConsentContext'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
  const {
    consent,
    hasConsented,
    acceptAll,
    acceptNecessary,
    declineAll,
    savePreferences,
    isSettingsOpen,
    openSettings,
    closeSettings,
  } = useCookieConsent()

  const [marketing, setMarketing] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Sync local toggle state when settings panel opens
  useEffect(() => {
    if (isSettingsOpen) {
      setMarketing(consent.marketing)
    }
  }, [isSettingsOpen, consent.marketing])

  // Focus trap + Escape close
  useEffect(() => {
    if (!isSettingsOpen) return

    const panel = settingsRef.current
    if (!panel) return

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeSettings()
        triggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      if (focusable.length === 0) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSettingsOpen, closeSettings])

  // Lock body scroll when settings open
  useEffect(() => {
    if (isSettingsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isSettingsOpen])

  const handleSave = useCallback(() => {
    savePreferences({ marketing })
  }, [savePreferences, marketing])

  const showBanner = !hasConsented && !isSettingsOpen

  return (
    <>
      {showBanner && (
        <div className={styles.banner} role="region" aria-label="Informasjonskapsler">
          <div className={styles.bannerInner}>
            <p className={styles.bannerText}>
              Vi bruker informasjonskapsler for å sikre at nettsiden fungerer som den skal. Du velger selv hvilke kategorier du vil godta.
            </p>
            <div className={styles.bannerButtons}>
              <button type="button" className={styles.acceptAll} onClick={acceptAll}>
                Godta alle
              </button>
              <button type="button" className={styles.necessaryOnly} onClick={acceptNecessary}>
                Kun nødvendige
              </button>
              <button type="button" className={styles.declineAll} onClick={declineAll}>
                Avvis alle
              </button>
              <button
                type="button"
                className={styles.settingsButton}
                onClick={openSettings}
                ref={triggerRef}
                aria-label="Innstillinger for informasjonskapsler"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <>
          <div className={styles.backdrop} onClick={closeSettings} />
          <div
            className={styles.settings}
            role="dialog"
            aria-label="Innstillinger for informasjonskapsler"
            aria-modal="true"
            ref={settingsRef}
          >
            <div className={styles.settingsHeader}>
              <h2 className={styles.settingsTitle}>Informasjonskapsler</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeSettings}
                aria-label="Lukk"
              >
                &times;
              </button>
            </div>

            <div className={styles.categories}>
              <div className={styles.category}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>Nødvendige</span>
                  <span className={styles.categoryDesc}>Sesjon, handlekurv og pålogging</span>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked disabled />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.category}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>Markedsføring</span>
                  <span className={styles.categoryDesc}>Tilpasset innhold og annonser</span>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>

            <div className={styles.settingsActions}>
              <button type="button" className={styles.saveButton} onClick={handleSave}>
                Lagre innstillinger
              </button>
              <button type="button" className={styles.acceptAllSettings} onClick={acceptAll}>
                Godta alle
              </button>
              <button type="button" className={styles.declineAllSettings} onClick={declineAll}>
                Avvis alle
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
