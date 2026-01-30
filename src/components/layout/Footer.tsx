'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { useState } from 'react'
import type { NavLink, SocialLink } from '@/types/sanity'
import { socialPlatformLabels } from '@/types/sanity'
import { useCookieConsent } from '@/context/CookieConsentContext'
import styles from './Footer.module.css'

interface FooterProps {
  navigation: NavLink[]
  socialLinks: SocialLink[]
  contactInfo?: {
    email?: string
    phone?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    partners?: any[]
  }
  faviconUrl?: string
}

export default function Footer({ navigation, socialLinks, contactInfo, faviconUrl }: FooterProps) {
  const [email, setEmail] = useState('')
  const { openSettings } = useCookieConsent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with Mailjet
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  const handleColorFlip = () => {
    document.documentElement.classList.toggle('inverted')
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Newsletter Section */}
          <div className={styles.newsletter}>
            <p className={styles.newsletterText}>
              Holde deg oppdatert og meld deg på nyhetsbrevet
            </p>
            <form className={styles.form} onSubmit={handleSubmit} aria-label="Nyhetsbrev">
              <label htmlFor="footer-email" className="visually-hidden">E-postadresse</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Din e-postadresse"
                className={styles.input}
                required
              />
              <button type="submit" className={styles.button}>
                Send nå
              </button>
            </form>
          </div>

          {/* Menu Links */}
          <nav className={styles.column} aria-label="Bunntekst-navigasjon">
            <h3 className={styles.heading}>MENY</h3>
            <ul className={styles.linkList}>
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location & Partners */}
          {(contactInfo?.address || contactInfo?.partners) && (
            <div className={styles.column}>
              {contactInfo.address && (
                <>
                  <h3 className={styles.heading}>STED</h3>
                  <div className={styles.locations}>
                    <address className={styles.address}>
                      <PortableText value={contactInfo.address} />
                    </address>
                  </div>
                </>
              )}
              {contactInfo.partners && (
                <div className={styles.partners}>
                  <h3 className={styles.heading}>PARTNERE</h3>
                  <div className={styles.partnerLinks}>
                    <PortableText value={contactInfo.partners} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Social */}
          <div className={styles.column}>
            <h3 className={styles.heading}>SOSIAL</h3>
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
            <p className={styles.socialDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
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
          <Link href="/personvern" className={styles.legalLink}>
            Personvernerklæring
          </Link>
          <button type="button" className={styles.legalLink} onClick={openSettings}>
            Cookies
          </button>
        </div>
      </div>
    </footer>
  )
}
