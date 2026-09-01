'use client'

import Link from 'next/link'
import { useState } from 'react'
import { NewsletterModal } from '@/components/newsletter/NewsletterModal'
import styles from './HeroSection.module.css'

interface HeroAnnouncementProps {
  text: string
  href?: string
}

/**
 * Hero CTA. The newsletter anchor opens the signup modal;
 * any other href stays a normal link.
 */
export function HeroAnnouncement({ text, href }: HeroAnnouncementProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const isNewsletter = !href || href === '#nyhetsbrev'

  if (!isNewsletter) {
    return (
      <Link href={href} className={`${styles.heroAnnouncement} site-button`}>
        {text}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.heroAnnouncement} site-button`}
        onClick={() => setModalOpen(true)}
      >
        {text}
      </button>
      <NewsletterModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
