export interface CookieInfo {
  name: string
  provider: string
  purpose: string
  category: 'necessary' | 'statistics' | 'marketing'
  duration: string
}

export const cookieInventory: CookieInfo[] = [
  {
    name: 'gransvilla-consent',
    provider: 'Gransvilla',
    purpose: 'Lagrer dine valg for informasjonskapsler (cookie-samtykke)',
    category: 'necessary',
    duration: '1 år',
  },
  {
    name: 'gransvilla-auth',
    provider: 'Gransvilla',
    purpose: 'Autentisering for tilgangsbegrensede sider',
    category: 'necessary',
    duration: '7 dager',
  },
]

export const categoryLabels: Record<CookieInfo['category'], string> = {
  necessary: 'Nødvendige',
  statistics: 'Statistikk',
  marketing: 'Markedsføring',
}
