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
      description:
        'Valgfri overskrift som vises til venstre for teksten. Ikke gjenta sidetittelen — den vises allerede øverst på siden.',
    }),
    defineField({
      name: 'tekst',
      title: 'Tekstinnhold',
      type: 'blockContent',
      description: 'Brødtekst som vises til høyre i seksjonen',
    }),
  ],
  preview: {
    select: {
      tekst: 'tekst',
    },
    prepare({ tekst }) {
      const block = Array.isArray(tekst)
        ? tekst.find((b: { _type?: string }) => b._type === 'block')
        : undefined
      const title = block?.children
        ?.map((child: { text?: string }) => child.text || '')
        .join('')
      return {
        title: title || 'Tekstseksjon',
        subtitle: 'Tekst',
      }
    },
  },
})
