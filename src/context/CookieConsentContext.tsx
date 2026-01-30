'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface ConsentState {
  necessary: true
  statistics: boolean
  marketing: boolean
}

interface CookieConsentContextValue {
  consent: ConsentState
  hasConsented: boolean
  acceptAll: () => void
  acceptNecessary: () => void
  declineAll: () => void
  savePreferences: (prefs: { statistics: boolean; marketing: boolean }) => void
  openSettings: () => void
  closeSettings: () => void
  isSettingsOpen: boolean
}

const COOKIE_NAME = 'gransvilla-consent'
const MAX_AGE = 365 * 24 * 60 * 60

const defaultConsent: ConsentState = { necessary: true, statistics: false, marketing: false }

function readCookie(): { consent: ConsentState; found: boolean } {
  if (typeof document === 'undefined') return { consent: defaultConsent, found: false }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  if (!match) return { consent: defaultConsent, found: false }
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    return {
      consent: {
        necessary: true,
        statistics: !!parsed.statistics,
        marketing: !!parsed.marketing,
      },
      found: true,
    }
  } catch {
    return { consent: defaultConsent, found: false }
  }
}

function writeCookie(consent: ConsentState) {
  const value = JSON.stringify({
    ...consent,
    timestamp: new Date().toISOString(),
  })
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${MAX_AGE}; path=/; SameSite=Lax${secure}`
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent)
  const [hasConsented, setHasConsented] = useState(true) // default true to avoid flash
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const { consent: stored, found } = readCookie()
    setConsent(stored)
    setHasConsented(found)
  }, [])

  const save = useCallback((next: ConsentState) => {
    setConsent(next)
    setHasConsented(true)
    writeCookie(next)
  }, [])

  const acceptAll = useCallback(() => {
    save({ necessary: true, statistics: true, marketing: true })
    setIsSettingsOpen(false)
  }, [save])

  const acceptNecessary = useCallback(() => {
    save({ necessary: true, statistics: false, marketing: false })
    setIsSettingsOpen(false)
  }, [save])

  const declineAll = useCallback(() => {
    save({ necessary: true, statistics: false, marketing: false })
    setIsSettingsOpen(false)
  }, [save])

  const savePreferences = useCallback(
    (prefs: { statistics: boolean; marketing: boolean }) => {
      save({ necessary: true, ...prefs })
      setIsSettingsOpen(false)
    },
    [save],
  )

  const openSettings = useCallback(() => setIsSettingsOpen(true), [])
  const closeSettings = useCallback(() => setIsSettingsOpen(false), [])

  return (
    <CookieConsentContext.Provider
      value={{ consent, hasConsented, acceptAll, acceptNecessary, declineAll, savePreferences, openSettings, closeSettings, isSettingsOpen }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
