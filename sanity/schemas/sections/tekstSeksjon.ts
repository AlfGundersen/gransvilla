import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tekstSeksjon',
  title: 'Tekst',
  type: 'object',
  fields: [
    defineField({
      name: 'overskrift',
      title: 'Overskrift',
      type: 'string',
      description: 'Vises til venstre i seksjonen',
    }),
    defineField({
      name: 'tekst',
      title: 'Tekstinnhold',
      type: 'blockContent',
      description: 'Brødtekst som vises til høyre for overskriften',
    }),
  ],
  preview: {
    select: {
      title: 'overskrift',
    },
    prepare({ title }) {
      return {
        title: title || 'Tekstseksjon',
        subtitle: 'Tekst',
      }
    },
  },
})
