'use client'

import { Link } from 'next-view-transitions'
import { useState } from 'react'
import styles from './Footer.module.css'

// TODO: Fetch from Sanity siteSettings
const menuLinks = [
  { label: 'Hjem', href: '/' },
  { label: 'Bryllup', href: '/bryllup' },
  { label: 'Selskaper', href: '/selskaper' },
  { label: 'Konserter', href: '/konserter' },
  { label: 'Søndagsfrokost', href: '/sondagsfrokost' },
  { label: 'Kantine', href: '/kantine' },
  { label: 'Nettbutikk', href: '/nettbutikk' },
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Praktisk info', href: '/praktisk-info' },
  { label: 'Kontakt oss', href: '/kontakt' },
]

const locations = [
  { address: 'Jahnebakken 6,', city: '5007 Bergen' },
  { address: 'Jahnebakken 6,', city: '5007 Bergen' },
  { address: 'Jahnebakken 6,', city: '5007 Bergen' },
]

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
]

export default function Footer() {
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
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
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
          <div className={styles.column}>
            <h3 className={styles.heading}>MENY</h3>
            <ul className={styles.linkList}>
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div className={styles.column}>
            <h3 className={styles.heading}>STED</h3>
            <div className={styles.locations}>
              {locations.map((location, index) => (
                <address key={index} className={styles.address}>
                  {location.address}
                  <br />
                  {location.city}
                </address>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className={styles.column}>
            <h3 className={styles.heading}>SOSIAL</h3>
            <ul className={styles.socialList}>
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
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
              aria-label="Toggle color mode"
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
