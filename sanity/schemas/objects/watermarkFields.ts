import { defineField } from 'sanity'

/**
 * Reusable fields to add a "S-logo watermark" toggle + corner picker to any
 * Sanity image field. Spread `...watermarkFields` into the image's `fields:` array.
 *
 *   defineField({
 *     name: 'bilde',
 *     type: 'image',
 *     fields: [
 *       defineField({ name: 'alt', type: 'string', ... }),
 *       ...watermarkFields,
 *     ],
 *   })
 *
 * The watermark image itself is read from `siteSettings.favicon` at render time.
 */
export const watermarkFields = [
  defineField({
    name: 'watermark',
    title: 'Vis S-logo som vannmerke',
    type: 'boolean',
    description: 'Legg en liten S-logo over bildet',
    initialValue: false,
  }),
  defineField({
    name: 'watermarkPosition',
    title: 'Plassering',
    type: 'string',
    options: {
      list: [
        { title: 'Nede til høyre', value: 'bottom-right' },
        { title: 'Nede til venstre', value: 'bottom-left' },
        { title: 'Oppe til høyre', value: 'top-right' },
        { title: 'Oppe til venstre', value: 'top-left' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'bottom-right',
    hidden: ({ parent }) => !parent?.watermark,
  }),
]
