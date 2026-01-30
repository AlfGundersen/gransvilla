'use client'

import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { PortableText } from '@portabletext/react'
import styles from './page.module.css'

interface CollapsibleSectionProps {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any[] | string | null
  children: React.ReactNode
}

export default function CollapsibleSection({
  title,
  description,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>(0)

  // Measure content height whenever it changes or opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [isOpen])

  // Recalculate on resize while open
  useEffect(() => {
    if (!isOpen) return
    const onResize = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isOpen])

  const toggle = useCallback(() => setIsOpen((o) => !o), [])

  return (
    <section className={styles.shopSection} data-open={isOpen}>
      {/* Mobile-only: tappable header */}
      <button
        className={styles.shopCategoryToggle}
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <div className={styles.shopToggleHeader}>
          <h2 className={styles.shopCategoryTitle}>{title}</h2>
          <svg
            className={styles.shopToggleIcon}
            data-open={isOpen}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line
              className={styles.shopToggleIconVertical}
              data-open={isOpen}
              x1="10" y1="0" x2="10" y2="20"
              stroke="currentColor" strokeWidth="1.5"
            />
          </svg>
        </div>
        {description && (
          <div className={styles.shopCategoryDescription}>
            {Array.isArray(description) ? <PortableText value={description} /> : <p>{description}</p>}
          </div>
        )}
      </button>

      {/* Desktop-only: existing sidebar */}
      <div className={styles.shopSidebar}>
        <div className={styles.shopSidebarContent}>
          <h2 className={styles.shopCategoryTitle}>{title}</h2>
          {description && (
            <div className={styles.shopCategoryDescription}>
              {Array.isArray(description) ? <PortableText value={description} /> : <p>{description}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Product grid — animated on mobile */}
      <div
        className={styles.shopProductGridWrapper}
        style={{ height: height > 0 ? height : undefined }}
        data-open={isOpen}
      >
        <div ref={contentRef} className={styles.shopProductGrid}>
          {Children.map(children, (child, i) => (
            <div
              key={i}
              className={styles.shopProductItem}
              data-open={isOpen}
              style={{ '--item-index': i } as React.CSSProperties}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
