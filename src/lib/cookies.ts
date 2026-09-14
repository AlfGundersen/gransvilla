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
    name: 'gransvilla-inverted',
    provider: 'Gransvilla',
    purpose: 'Husker om du har slått på omvendte farger på nettsiden',
    category: 'necessary',
    duration: 'Til du sletter nettleserdataene dine',
  },
]

export const categoryLabels: Record<CookieInfo['category'], string> = {
  necessary: 'Nødvendige',
  statistics: 'Statistikk',
  marketing: 'Markedsføring',
}
