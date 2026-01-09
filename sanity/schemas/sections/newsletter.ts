import { defineField, defineType } from 'sanity'

/**
 * Nyhetsbrev-seksjon - E-postpåmelding
 */
export default defineType({
  name: 'newsletter',
  title: 'Nyhetsbrev',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'placeholder',
      title: 'Plassholdertekst',
      type: 'string',
      description: 'Tekst som vises i e-postfeltet før bruker skriver',
      initialValue: 'Din e-postadresse',
    }),
    defineField({
      name: 'buttonText',
      title: 'Knappetekst',
      type: 'string',
      initialValue: 'Meld deg på',
    }),
    defineField({
      name: 'successMessage',
      title: 'Suksessmelding',
      type: 'string',
      description: 'Melding som vises etter vellykket påmelding',
      initialValue: 'Takk for din påmelding!',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare({ title }) {
      return {
        title: title || 'Nyhetsbrev',
        subtitle: 'Nyhetsbrev-påmelding',
      }
    },
  },
})
