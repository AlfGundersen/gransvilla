import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'nettbutikkSettings',
  title: 'Butikken',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Butikken',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Butikken',
      }
    },
  },
})
