import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'salgsvilkar',
  title: 'Salgsvilkår',
  type: 'document',
  fields: [
    defineField({
      name: 'innhold',
      title: 'Innhold',
      type: 'blockContent',
      description: 'Innholdet i salgsvilkårene',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Salgsvilkår',
      }
    },
  },
})
