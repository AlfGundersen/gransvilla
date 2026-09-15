/**
 * The href editors pick to mean "open the signup", rather than a page to
 * navigate to. The schema, the hero CTA and the page CTA all compare against
 * this one value.
 *
 * It lives here rather than beside the button: a server component that imports
 * a plain constant from a 'use client' module receives a client reference, not
 * the string, so the comparison silently failed and the CTA rendered as a link
 * to a footer anchor.
 */
export const NEWSLETTER_HREF = '#nyhetsbrev'
