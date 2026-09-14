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
const dictionaries: Record<Locale, Record<string, string>> = {
  nb: {},
  en: clientMessages as Record<string, string>,
}

const LocaleContext = createContext<Locale>(defaultLocale)

export function I18nProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const resolved = isLocale(locale) ? locale : defaultLocale
  return <LocaleContext.Provider value={resolved}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** `const t = useT()` then `t('Utsolgt')`. */
export function useT(): Translate {
  const locale = useLocale()
  return useMemo(() => createTranslator(locale, dictionaries[locale]), [locale])
}
