import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'personvernerklaering',
  title: 'Personvernerklæring',
  type: 'document',
  groups: [
    { name: 'behandlingsansvarlig', title: 'Behandlingsansvarlig', default: true },
    { name: 'innhold', title: 'Innhold' },
  ],
  fields: [
    defineField({
      name: 'firmanavn',
      title: 'Firmanavn',
      type: 'string',
      description: 'Fullt juridisk navn på virksomheten',
      group: 'behandlingsansvarlig',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orgnummer',
      title: 'Organisasjonsnummer',
      type: 'string',
      description: 'F.eks. 123 456 789',
      group: 'behandlingsansvarlig',
    }),
    defineField({
      name: 'adresse',
      title: 'Adresse',
      type: 'text',
      rows: 3,
      description: 'Virksomhetens adresse',
      group: 'behandlingsansvarlig',
    }),
    defineField({
      name: 'epost',
      title: 'E-post for personvern',
      type: 'string',
      description: 'Kontakt-e-post for henvendelser om personvern',
      group: 'behandlingsansvarlig',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'innhold',
      title: 'Innhold',
      type: 'blockContent',
      description: 'Innholdet i personvernerklæringen',
      group: 'innhold',
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
