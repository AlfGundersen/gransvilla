'use client'

import { Link } from 'next-view-transitions'
import { PortableText } from '@portabletext/react'
import { useState } from 'react'
import type { NavLink, SocialLink } from '@/types/sanity'
import { socialPlatformLabels } from '@/types/sanity'
import styles from './Footer.module.css'

interface FooterProps {
  navigation: NavLink[]
  socialLinks: SocialLink[]
  contactInfo?: {
    email?: string
    phone?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address?: any[]
  }
}

export default function Footer({ navigation, socialLinks, contactInfo }: FooterProps) {
  const [email, setEmail] = useState('')

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

          {/* Location */}
          {contactInfo?.address && (
            <div className={styles.column}>
              <h3 className={styles.heading}>STED</h3>
              <div className={styles.locations}>
                <address className={styles.address}>
                  <PortableText value={contactInfo.address} />
                </address>
              </div>
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
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <Link href="/personvern" className={styles.legalLink}>
            Personvernerklæring
          </Link>
          <Link href="/cookies" className={styles.legalLink}>
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  )
}
