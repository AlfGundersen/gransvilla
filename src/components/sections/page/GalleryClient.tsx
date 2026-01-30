'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import { GalleryLightbox } from './GalleryLightbox'
import styles from './GallerySection.module.css'

export interface GalleryImageData {
  src: string
  fullSrcBase: string
  alt: string
  width: number
  height: number
  ratio: number
}

export interface OriginRect {
  x: number
  y: number
  width: number
  height: number
}

interface GalleryClientProps {
  images: GalleryImageData[]
  columns: number
  hasContent: boolean
}

const DRAG_THRESHOLD = 5
const MAX_FULL_WIDTH = 3840

/** Append viewport-appropriate w & h params to a Sanity base URL */
function buildFullSrc(base: string, ratio: number): string {
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const w = Math.round(Math.min(window.innerWidth * dpr, MAX_FULL_WIDTH))
  const h = Math.round(w * ratio)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}w=${w}&h=${h}`
}

export function GalleryClient({ images, columns, hasContent }: GalleryClientProps) {
  const isCarousel = images.length > columns
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [originRect, setOriginRect] = useState<OriginRect | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, dragged: false })
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const preloadedSet = useRef(new Set<string>())

  // Build viewport-aware full URLs (recomputed once on mount)
  const fullSrcs = useMemo(() => {
    if (typeof window === 'undefined') return images.map((img) => img.fullSrcBase)
    return images.map((img) => buildFullSrc(img.fullSrcBase, img.ratio))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  // Preload adjacent images when lightbox index changes
  const preloadImage = useCallback((src: string) => {
    if (preloadedSet.current.has(src)) return
    preloadedSet.current.add(src)
    const img = new window.Image()
    img.src = src
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return
    // Preload current, prev, and next
    preloadImage(fullSrcs[lightboxIndex])
    if (lightboxIndex > 0) preloadImage(fullSrcs[lightboxIndex - 1])
    if (lightboxIndex < fullSrcs.length - 1) preloadImage(fullSrcs[lightboxIndex + 1])
  }, [lightboxIndex, fullSrcs, preloadImage])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    dragState.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      dragged: false,
    }
    el.style.cursor = 'grabbing'

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragState.current.startX
      if (Math.abs(dx) > DRAG_THRESHOLD) dragState.current.dragged = true
      el.scrollLeft = dragState.current.scrollLeft - dx
    }

    const onMouseUp = () => {
      dragState.current.isDown = false
      el.style.cursor = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent, index: number) => {
    if (dragState.current.dragged) {
      dragState.current.dragged = false
      return
    }
    const button = e.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    setOriginRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    // Preload clicked image immediately
    preloadImage(fullSrcs[index])
    setLightboxIndex(index)
  }, [fullSrcs, preloadImage])

  const closeLightbox = useCallback(() => {
    // Update origin rect to current thumbnail position before closing
    if (lightboxIndex !== null && buttonRefs.current[lightboxIndex]) {
      const rect = buttonRefs.current[lightboxIndex]!.getBoundingClientRect()
      setOriginRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    }
    setLightboxIndex(null)
  }, [lightboxIndex])

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  }, [])

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < images.length - 1 ? i + 1 : i
    )
  }, [images.length])

  return (
    <>
      <div
        ref={scrollRef}
        className={`${hasContent ? styles.galleryScroll : styles.galleryScrollFull} ${isCarousel ? '' : styles.galleryFit}`}
        role="region"
        aria-label="Bildegalleri"
        tabIndex={0}
        {...(isCarousel ? { onMouseDown } : {})}
        style={!isCarousel ? { ['--gallery-columns' as string]: columns } : undefined}
      >
        <div className={isCarousel ? styles.galleryTrack : styles.galleryGrid}>
          {images.map((image, index) => (
            <button
              key={index}
              ref={(el) => { buttonRefs.current[index] = el }}
              type="button"
              className={styles.galleryImageWrap}
              onClick={(e) => handleClick(e, index)}
              aria-label={`Åpne bilde ${index + 1}${image.alt ? `: ${image.alt}` : ''}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="eager"
                className={styles.galleryImage}
              />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <GalleryLightbox
            images={images}
            fullSrcs={fullSrcs}
            activeIndex={lightboxIndex}
            originRect={originRect}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </>
  )
}
