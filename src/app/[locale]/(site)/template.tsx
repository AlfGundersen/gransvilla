import { ViewTransition } from 'react'
import styles from './template.module.css'

/*
 * `default="none"` keeps this to navigations only, and that is load-bearing.
 *
 * An earlier attempt set `update="page-content"` to animate the skeleton ->
 * content reveal. But `update` fires on *any* DOM mutation in the subtree, and
 * next/image sets state when each image finishes loading. That fired
 * overlapping transitions across the whole page, and since a view transition
 * hides the real element while its snapshot animates, interrupted transitions
 * left the images hidden for good. Enter/exit only.
 *
 * The animation lives in globals.css under `::view-transition-*(.page-content)`.
 * Only this subtree animates — the sticky header and the footer sit outside it
 * and stay put.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-content" exit="page-content">
      <div className={styles.pageEnter}>{children}</div>
    </ViewTransition>
  )
}
