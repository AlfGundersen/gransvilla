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
    name: 'wglang',
    provider: 'Weglot',
    purpose: 'Husker valgt språk (norsk/engelsk) mellom sidevisninger',
    category: 'necessary',
    duration: '6 måneder',
  },
]

export const categoryLabels: Record<CookieInfo['category'], string> = {
  necessary: 'Nødvendige',
  statistics: 'Statistikk',
  marketing: 'Markedsføring',
}
