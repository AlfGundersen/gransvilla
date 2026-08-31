import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tekstSeksjon',
  title: 'Tekst',
  type: 'object',
  fields: [
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
