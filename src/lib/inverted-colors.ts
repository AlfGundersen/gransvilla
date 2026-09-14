/**
 * The footer's colour-flip easter egg, remembered between visits.
 *
 * Kept as a module so the toggle and the script that restores it before first
 * paint cannot drift apart on the key.
 */
export const INVERTED_STORAGE_KEY = 'gransvilla-inverted'

/**
 * Runs in <head>, before the body is painted. Without it the page would render
 * light and flip a moment later on every load, which is worse than forgetting.
 *
 * Stringified into the document, so it has to stand alone — no imports, no
 * closure over anything here. It stays silent if storage is unavailable
 * (private mode, storage disabled); the flip then simply is not restored.
 */
export const INVERTED_INIT_SCRIPT = `try{if(localStorage.getItem('${INVERTED_STORAGE_KEY}')==='1')document.documentElement.classList.add('inverted')}catch(e){}`
