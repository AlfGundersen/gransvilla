'use client'

import { useEffect } from 'react'

/**
 * Lets every image on a page fade up once it has loaded, instead of appearing
 * all at once — or, as it used to, as a blurred stand-in that snapped sharp.
 *
 * One listener for the whole site rather than a wrapper around each image.
 * An image under <main> that has not loaded is held invisible; when it loads
 * it is marked, and globals.css fades it in. Images already on screen when
 * this starts are marked as they are, so nothing that was visible blinks.
 *
 * It starts after hydration, by design: marking images any earlier would have
 * React find attributes it did not render. Until then, and with no script at
 * all, images simply show the way a browser shows them.
 */
export function ImageFade() {
  useEffect(() => {
    const root = document.documentElement
    const images = (node: ParentNode | Element) =>
      node instanceof HTMLImageElement ? [node] : [...node.querySelectorAll('img')]

    // What is already there is left alone…
    for (const image of images(document)) {
      if (image.complete) image.setAttribute('data-loaded', 'instant')
    }
    root.classList.add('image-fade')

    // …and everything from here on fades in when it is ready
    const reveal = (image: HTMLImageElement) => {
      if (!image.hasAttribute('data-loaded')) image.setAttribute('data-loaded', '')
    }
    const onSettled = (event: Event) => {
      if (event.target instanceof HTMLImageElement) reveal(event.target)
    }
    // load and error do not bubble, but they can be caught on the way down
    document.addEventListener('load', onSettled, true)
    document.addEventListener('error', onSettled, true)

    // A new page's images may already be in the cache, and then never fire
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue
          for (const image of images(node)) if (image.complete) reveal(image)
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      root.classList.remove('image-fade')
      document.removeEventListener('load', onSettled, true)
      document.removeEventListener('error', onSettled, true)
      observer.disconnect()
    }
  }, [])

  return null
}
