'use client'

import { createContext, useContext, useMemo } from 'react'
import clientMessages from '../../../messages/en.client.json'
import { defaultLocale, isLocale, type Locale } from './config'
import { createTranslator, type Translate } from './dictionary'

/**
 * Client-side translation.
 *
 * Bundles only the strings reachable from t() calls in components, not the full
 * dictionary — CMS prose is translated on the server and arrives already in
 * English, so shipping it here would be dead weight.
 */
const bundled: Record<Locale, Record<string, string>> = {
  nb: {},
  en: clientMessages as Record<string, string>,
}

type Ctx = { locale: Locale; dictionary: Record<string, string> }

const I18nContext = createContext<Ctx>({ locale: defaultLocale, dictionary: {} })

/**
 * `overrides` carries whatever Weglot currently says for these strings, fetched
 * by the layout on the server. Without it a correction to a UI string would sit
 * unseen until the dictionary was rebuilt and redeployed, while CMS text updated
 * within the minute — the same string in two places behaving differently.
 *
 * The bundled file stays underneath as the floor, so a Weglot outage leaves the
 * interface in English rather than reverting it to Norwegian.
 */
export function I18nProvider({
  locale,
  overrides,
  children,
}: {
  locale: string
  overrides?: Record<string, string>
  children: React.ReactNode
}) {
  const resolved = isLocale(locale) ? locale : defaultLocale

  const value = useMemo(
    () => ({ locale: resolved, dictionary: { ...bundled[resolved], ...(overrides ?? {}) } }),
    [resolved, overrides],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale
}

/** `const t = useT()` then `t('Utsolgt')`. */
export function useT(): Translate {
  const { locale, dictionary } = useContext(I18nContext)
  return useMemo(() => createTranslator(locale, dictionary), [locale, dictionary])
}
