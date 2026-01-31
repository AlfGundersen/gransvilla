import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'personvernerklaering',
  title: 'Personvernerklæring',
  type: 'document',
  fields: [
    defineField({
      name: 'innhold',
      title: 'Innhold',
      type: 'blockContent',
      description: 'Innholdet i personvernerklæringen',
    }),
    defineField({
      name: 'opprettet',
      title: 'Opprettet',
      type: 'date',
      description: 'Dato personvernerklæringen ble opprettet',
      options: {
        dateFormat: 'DD.MM.YYYY',
      },
    }),
    defineField({
      name: 'oppdatert',
      title: 'Sist oppdatert',
      type: 'datetime',
      description: 'Oppdateres automatisk ved publisering',
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Personvernerklæring',
      }
    },
  },
})
