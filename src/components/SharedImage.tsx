type SharedImageProps = {
  /** Kept so the call sites still say which page an image leads to. */
  name?: string
  transitionClass?: string
  children: React.ReactNode
}

/**
 * Used to pair an image in a listing with the same image on the page it links
 * to, so the browser morphed one into the other during the navigation.
 *
 * It no longer does. The morph was one of several things moving at once when a
 * page changed, and the site now has a single slow fade instead (globals.css,
 * `.page-content`). The images are part of that fade like everything else.
 *
 * Left in place as a pass-through rather than deleted from every call site, so
 * the morph can come back by restoring the <ViewTransition> here — and
 * <WarmImage>, which sits beside these, still makes sure the big image is in
 * the cache when the page fades up.
 */
export function SharedImage({ children }: SharedImageProps) {
  return children
}
