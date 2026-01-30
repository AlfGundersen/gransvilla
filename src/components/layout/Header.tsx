'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '@/context/CartContext'
import type { NavLink, SocialLink } from '@/types/sanity'
import { socialPlatformLabels } from '@/types/sanity'
import styles from './Header.module.css'

interface HeaderProps {
  navigation: NavLink[]
  socialLinks: SocialLink[]
}

export default function Header({ navigation, socialLinks }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cartCount, openCart } = useCart()
  const menuRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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

  // Focus management: move focus into menu when opened, restore when closed
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (isMenuOpen) {
      wasOpenRef.current = true
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false
      menuButtonRef.current?.focus()
    }
  }, [isMenuOpen])

  // Focus trap within menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu()
      return
    }
    if (e.key !== 'Tab' || !menuRef.current) return

    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

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
        ref={menuRef}
        className={`${styles.slideMenu} ${isMenuOpen ? styles.slideMenuOpen : ''}`}
        aria-hidden={!isMenuOpen}
        id="main-menu"
        aria-label="Hovedmeny"
        onKeyDown={handleMenuKeyDown}
        inert={!isMenuOpen}
      >
        {/* Menu Header */}
        <div className={styles.menuHeader}>
          <span className={styles.menuLabel}>MENY</span>
          <button
            ref={closeButtonRef}
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
              key={item.platform}
              href={item.url}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${socialPlatformLabels[item.platform] || item.platform} (åpnes i nytt vindu)`}
            >
              {socialPlatformLabels[item.platform] || item.platform}
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
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-label={isMenuOpen ? 'Lukk meny' : 'Åpne meny'}
              aria-expanded={isMenuOpen}
              aria-controls="main-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={styles.menuIcon} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link href="/" className={styles.logo} aria-label="GransVilla logo – Til forsiden">
            <Image src="/logo.svg" alt="" width={128} height={22} priority aria-hidden="true" />
          </Link>

          {/* Right: Shopping cart */}
          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.cartButton}
              onClick={openCart}
              aria-label={`Handlekurv, ${cartCount} ${cartCount === 1 ? 'vare' : 'varer'}`}
            >
              <svg
                className={styles.cartIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
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
