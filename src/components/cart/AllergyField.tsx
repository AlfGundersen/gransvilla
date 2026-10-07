'use client'

import { useId } from 'react'
import { useT } from '@/lib/i18n/provider'
import styles from './AllergyField.module.css'

/** Matches the limit the cart route enforces */
const MAX_LENGTH = 300

interface AllergyFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Free text sent to the kitchen with the order line. Shown only for products
 * that ask for it, wherever such a product can be put in the cart.
 */
export function AllergyField({ value, onChange, disabled }: AllergyFieldProps) {
  const t = useT()
  const id = useId()

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {t('Allergier')}
      </label>
      <textarea
        id={id}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('F.eks. gluten, nøtter eller laktose')}
        aria-describedby={`${id}-hint`}
        maxLength={MAX_LENGTH}
        rows={2}
        disabled={disabled}
      />
      <p id={`${id}-hint`} className={styles.hint}>
        {t('Valgfritt. Sendes til kjøkkenet og gjelder alt du legger i handlekurven nå.')}
      </p>
    </div>
  )
}
