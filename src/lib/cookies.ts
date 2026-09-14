export interface CookieInfo {
  name: string
  provider: string
  purpose: string
  category: 'necessary' | 'statistics' | 'marketing'
  duration: string
}

export const cookieInventory: CookieInfo[] = []

export const categoryLabels: Record<CookieInfo['category'], string> = {
  necessary: 'Nødvendige',
  statistics: 'Statistikk',
  marketing: 'Markedsføring',
}
