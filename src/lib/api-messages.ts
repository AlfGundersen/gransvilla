/**
 * Error strings the API routes return to the browser.
 *
 * They are rendered straight into the page, so an English visitor who hits a
 * validation error or a failed send would otherwise see Norwegian. The routes
 * cannot translate them — a route handler has no locale — so the client does it
 * with t(), which needs them in the dictionary.
 *
 * Collecting them from here is what puts them there: scripts/translate.mjs
 * imports this module, because a dynamic t(error) call is invisible to a scan
 * for t('literal').
 *
 * Anything added here must be used by a route and shown to a user. Internal
 * text — the contact email's subject, for instance — does not belong.
 */
export const apiMessages = {
  tooManyRequests: 'For mange forespørsler. Vennligst vent litt før du prøver igjen.',
  missingFields: 'Vennligst fyll ut alle obligatoriske felt.',
  sendFailed: 'Kunne ikke sende meldingen. Vennligst prøv igjen.',
  emailRequired: 'E-postadresse er påkrevd',
  newsletterFailed: 'Kunne ikke legge til på nyhetsbrevlisten',
  generic: 'Noe gikk galt. Vennligst prøv igjen.',
} as const

export type ApiMessage = (typeof apiMessages)[keyof typeof apiMessages]
