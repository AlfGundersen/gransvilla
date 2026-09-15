'use client'

import Link from 'next/link'
import { NewsletterButton } from '@/components/newsletter/NewsletterButton'
import { NEWSLETTER_HREF } from '@/lib/newsletter'
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
  const isNewsletter = !href || href === NEWSLETTER_HREF

  if (!isNewsletter) {
    return (
      <Link href={href} className={`${styles.heroAnnouncement} site-button`}>
        {text}
      </Link>
    )
  }

  return <NewsletterButton label={text} className={`${styles.heroAnnouncement} site-button`} />
}
