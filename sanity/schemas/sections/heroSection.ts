import { defineField, defineType } from 'sanity'
import { watermarkFields } from '../objects/watermarkFields'

/**
 * Hero-seksjon - Stort bilde med valgfri tekstoverlegg
 */
export default defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [...watermarkFields],
      validation: (Rule) => Rule.required().error('Bilde er påkrevd'),
    }),
    defineField({
      name: 'announcement',
      title: 'Melding over bildet',
      description: 'Valgfri tekst som vises nederst til venstre på herobildet. La feltet stå tomt for å skjule meldingen.',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Tekst',
          type: 'string',
        }),
        defineField({
          name: 'href',
          title: 'Lenke',
          type: 'string',
          description: 'Valgfri URL eller anker. Eksempler: «#nyhetsbrev» (anker til seksjon), «/kontakt» (intern side), «https://...» (ekstern lenke).',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      media: 'image',
    },
    prepare({ media }) {
      return {
        title: 'Hero',
        subtitle: 'Hero-seksjon',
        media,
      }
    },
  },
})
