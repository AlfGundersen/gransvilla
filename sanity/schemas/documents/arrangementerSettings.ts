import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'arrangementerSettings',
  title: 'Arrangementer',
  type: 'document',
  fields: [
    defineField({
      name: 'heroLayout',
      title: 'Hero-layout',
      type: 'string',
      description: 'Velg layout for toppområdet på arrangementsiden',
      options: {
        list: [
          { title: '1-1-2 (Overskrift, beskrivelse, bilde)', value: '1-1-2' },
          { title: '1-3 (Overskrift, bredt bilde)', value: '1-3' },
        ],
        layout: 'radio',
      },
      initialValue: '1-1-2',
    }),
    defineField({
      name: 'beskrivelse',
      title: 'Beskrivelse',
      type: 'simpleBlockContent',
      description: 'Introtekst som vises på arrangementsiden',
    }),
    defineField({
      name: 'heroBilde',
      title: 'Herobilde',
      type: 'image',
      description: 'Bilde som vises i toppområdet på arrangementsiden',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Arrangementer',
      }
    },
  },
})
