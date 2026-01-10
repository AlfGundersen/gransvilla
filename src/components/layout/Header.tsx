'use client'

import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '@/context/CartContext'
import styles from './Header.module.css'

// TODO: Fetch navigation from Sanity
const navigation = [
  { label: 'Hjem', href: '/' },
  { label: 'Bryllup', href: '/bryllup' },
  { label: 'Selskaper', href: '/selskaper' },
  { label: 'Konserter', href: '/konserter' },
  { label: 'Søndagsfrokost', href: '/sondagsfrokost' },
  { label: 'Kantine', href: '/kantine' },
  { label: 'Nettbutikk', href: '/nettbutikk' },
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Kontakt oss', href: '/kontakt' },
  { label: 'Praktisk info', href: '/praktisk-info' },
]

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cartCount, openCart } = useCart()

  // Wait for client-side mount for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll to toggle border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll() // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle menu open/close effects
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('menu-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }

    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  // Menu content to be portaled
  const menuContent = (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayVisible : ''}`}
        onClick={closeMenu}
        onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <nav
        className={`${styles.slideMenu} ${isMenuOpen ? styles.slideMenuOpen : ''}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Menu Header */}
        <div className={styles.menuHeader}>
          <span className={styles.menuLabel}>MENY</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeMenu}
            aria-label="Lukk meny"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <line x1="2" y1="2" x2="18" y2="18" />
              <line x1="18" y1="2" x2="2" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <ul className={styles.menuList}>
          {navigation.map((item, index) => (
            <li
              key={item.href}
              className={styles.menuItem}
              style={{ transitionDelay: isMenuOpen ? `${index * 40}ms` : '0ms' }}
            >
              <Link href={item.href} className={styles.menuLink} onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Separator */}
        <div className={styles.menuSeparator} />

        {/* Social Links */}
        <div className={styles.socialLinks}>
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  )

  return (
    <>
      {/* Header */}
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.container}>
          {/* Left: Menu button */}
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label={isMenuOpen ? 'Lukk meny' : 'Åpne meny'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={styles.menuIcon} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link href="/" className={styles.logo}>
            <Image src="/logo.svg" alt="GransVilla" width={128} height={22} priority />
          </Link>

          {/* Right: Shopping cart */}
          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.cartButton}
              onClick={openCart}
              aria-label="Handlekurv"
            >
              <span className={styles.cartText}>Handlevogn ({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Portal menu to body to avoid transform issues */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  )
}
