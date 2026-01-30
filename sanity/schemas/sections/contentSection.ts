import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

/**
 * Innholdsseksjon - Tekst med bilde
 *
 * Layout-varianter:
 * - Bilde til venstre, tekst til høyre
 * - Tekst til venstre, bilde til høyre
 */
export default defineType({
  name: 'contentSection',
  title: 'Innholdsseksjon',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Beskrivelse av bildet for skjermlesere',
          components: { input: AltTextInput },
        }),
      ],
    }),
    defineField({
      name: 'labelText',
      title: 'Liten overskrift',
      type: 'string',
      description: 'Liten tekst over hovedoverskriften (f.eks. "Hver søndag")',
    }),
    defineField({
      name: 'heading',
      title: 'Hovedoverskrift',
      type: 'string',
      validation: (Rule) => Rule.required().error('Overskrift er påkrevd'),
    }),
    defineField({
      name: 'body',
      title: 'Brødtekst',
      type: 'simpleBlockContent',
    }),
    defineField({
      name: 'ctaText',
      title: 'Knappetekst',
      type: 'string',
      description: 'Tekst på handlingsknappen (valgfri)',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Knappelenke',
      type: 'string',
      description: 'URL som knappen lenker til',
      hidden: ({ parent }) => !parent?.ctaText,
    }),
    defineField({
      name: 'imagePosition',
      title: 'Bildeposisjon',
      type: 'string',
      options: {
        list: [
          { title: 'Venstre', value: 'left' },
          { title: 'Høyre', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      labelText: 'labelText',
      media: 'image',
    },
    prepare({ heading, labelText, media }) {
      return {
        title: heading || 'Innholdsseksjon',
        subtitle: labelText || 'Innhold',
        media,
      }
    },
  },
})
