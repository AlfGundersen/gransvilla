'use client'

import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { useCookieConsent } from '@/context/CookieConsentContext'
import { useT } from '@/lib/i18n/provider'
import type { NavLink, SocialLink } from '@/types/sanity'
import { socialPlatformLabels } from '@/types/sanity'
import styles from './Footer.module.css'

interface FooterProps {
  navigation: NavLink[]
  socialLinks: SocialLink[]
  contactInfo?: {
    email?: string
    phone?: string
    address?: PortableTextBlock[]
  }
  siteDescription?: PortableTextBlock[]
  faviconUrl?: string
}

export default function Footer({
  navigation,
  socialLinks,
  contactInfo,
  siteDescription,
  faviconUrl,
}: FooterProps) {
  const t = useT()
  const { openSettings } = useCookieConsent()

  const handleColorFlip = () => {
    document.documentElement.classList.toggle('inverted')
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Newsletter Section */}
          <div id="nyhetsbrev" className={styles.newsletter}>
            <p className={styles.newsletterText}>
              {t('Holde deg oppdatert og meld deg på nyhetsbrevet')}
            </p>
            <NewsletterForm idPrefix="footer" />
          </div>

          {/* Menu Links */}
          <nav className={styles.column} aria-label="Bunntekst-navigasjon">
            <h3 className={styles.heading}>{t('MENY')}</h3>
            <ul className={styles.linkList}>
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location */}
          {contactInfo?.address && (
            <div className={styles.column}>
              <h3 className={styles.heading}>{t('STED')}</h3>
              <div className={styles.locations}>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jahnebakken+6%2C+5007+Bergen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.addressLink}
                  aria-label={t('Vis adressen i Google Maps (åpnes i nytt vindu)')}
                >
                  <address className={styles.address}>
                    <PortableText value={contactInfo.address} />
                  </address>
                </a>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.companyInfo}>
                  {t('Bergen Smak AS')}
                  <br />
                  {t('Org.nr. 986 881 824')}
                </p>
              </div>
            </div>
          )}

          {/* Social */}
          <div className={styles.column}>
            <h3 className={styles.heading}>{t('SOSIAL')}</h3>
            <ul className={styles.socialList}>
              {socialLinks.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${socialPlatformLabels[link.platform] || link.platform} (åpnes i nytt vindu)`}
                  >
                    {socialPlatformLabels[link.platform] || link.platform}
                  </a>
                </li>
              ))}
            </ul>
            {siteDescription && (
              <div className={styles.socialDescription}>
                <PortableText value={siteDescription} />
              </div>
            )}
            <button
              type="button"
              className={styles.circleDecoration}
              onClick={handleColorFlip}
              aria-label="Bytt fargemodus"
            >
              {faviconUrl ? (
                <Image
                  src={faviconUrl}
                  alt=""
                  width={100}
                  height={100}
                  className={styles.circleImage}
                  unoptimized
                />
              ) : null}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <Link href="/framdrift" className={styles.legalLink}>
            Framdrift
          </Link>
          <Link href="/personvern" className={styles.legalLink}>
            {t('Personvernerklæring')}
          </Link>
          <Link href="/salgsvilkar" className={styles.legalLink}>
            {t('Salgsvilkår')}
          </Link>
          <button type="button" className={styles.legalLink} onClick={openSettings}>
            Cookies
          </button>
        </div>
      </div>
    </footer>
  )
}
