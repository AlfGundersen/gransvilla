import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'nettbutikkSettings',
  title: 'Nettbutikk',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Nettbutikk',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Nettbutikk',
      }
    },
  },
})
