import { defineField, defineType } from 'sanity'

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
      validation: (Rule) => Rule.required().error('Bilde er påkrevd'),
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
