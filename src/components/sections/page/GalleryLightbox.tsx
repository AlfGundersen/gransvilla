'use client'

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { GalleryImageData, OriginRect } from './GalleryClient'
import styles from './GalleryLightbox.module.css'

interface GalleryLightboxProps {
  images: GalleryImageData[]
  fullSrcs: string[]
  activeIndex: number
  originRect: OriginRect | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const SWIPE_THRESHOLD = 100
const SWIPE_VELOCITY = 500

export function GalleryLightbox({
  images,
  fullSrcs,
  activeIndex,
  originRect,
  onClose,
  onPrev,
  onNext,
}: GalleryLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const isFirst = activeIndex === 0
  const isLast = activeIndex === images.length - 1
  const current = images[activeIndex]
  const [fullLoaded, setFullLoaded] = useState(false)

  // Reset loaded state when active image changes
  useEffect(() => {
    setFullLoaded(false)
  }, [activeIndex])

  // Compute initial position from the thumbnail origin
  const initialImageStyle = useMemo(() => {
    if (!originRect) return { opacity: 0, scale: 0.5 }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const cx = vw / 2
    const cy = vh / 2
    const thumbCx = originRect.x + originRect.width / 2
    const thumbCy = originRect.y + originRect.height / 2
    return {
      x: thumbCx - cx,
      y: thumbCy - cy,
      scale: originRect.width / Math.min(vw * 0.8, 1200),
      opacity: 1,
    }
  }, [originRect])

  // Body scroll lock + focus management
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    setTimeout(() => closeButtonRef.current?.focus(), 50)

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      previousFocusRef.current?.focus()
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (!isFirst) onPrev()
          break
        case 'ArrowRight':
          if (!isLast) onNext()
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext, isFirst, isLast])

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !overlayRef.current) return
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled])'
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
    },
    []
  )

  // Close when clicking outside the image and buttons
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.tagName === 'IMG') return
      onClose()
    },
    [onClose]
  )

  const lightbox = (
    <motion.div
      ref={overlayRef}
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={`Bilde ${activeIndex + 1} av ${images.length}`}
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Lukk"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Prev button */}
      {!isFirst && (
        <button
          className={`${styles.navButton} ${styles.navPrev}`}
          onClick={onPrev}
          aria-label="Forrige bilde"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Image with drag + shared element transition */}
      <motion.div
        key={activeIndex}
        className={styles.imageContainer}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={isFirst || isLast ? 0.2 : 0.5}
        onDragEnd={(_e, info) => {
          const { offset, velocity } = info
          if (
            (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) &&
            !isLast
          ) {
            onNext()
          } else if (
            (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) &&
            !isFirst
          ) {
            onPrev()
          }
        }}
        initial={initialImageStyle}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        exit={initialImageStyle}
        transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.8 }}
      >
        {/* Thumbnail as blurred placeholder */}
        {!fullLoaded && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={current.src}
            alt=""
            aria-hidden="true"
            className={styles.placeholderImage}
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullSrcs[activeIndex]}
          alt={current.alt}
          onLoad={() => setFullLoaded(true)}
          style={{ opacity: fullLoaded ? 1 : 0 }}
        />
      </motion.div>

      {/* Next button */}
      {!isLast && (
        <button
          className={`${styles.navButton} ${styles.navNext}`}
          onClick={onNext}
          aria-label="Neste bilde"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Counter */}
      <div className={styles.counter} role="status" aria-live="polite">
        {activeIndex + 1} / {images.length}
      </div>
    </motion.div>
  )

  return createPortal(lightbox, document.body)
}
