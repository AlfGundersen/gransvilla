import { defineField, defineType } from 'sanity'

/**
 * Nyhetsbrev-seksjon for side- og arrangementsider.
 *
 * Skiller seg fra `newsletter` ved at den legges inn hvor som helst i
 * seksjonslisten, mens `newsletter` er en fast seksjon på forsiden.
 */
export default defineType({
  name: 'nyhetsbrevSeksjon',
  title: 'Nyhetsbrev',
  type: 'object',
  fields: [
    defineField({
      name: 'overskrift',
      title: 'Overskrift',
      type: 'string',
      description:
        'Valgfri overskrift som vises til venstre for skjemaet. Ikke gjenta sidetittelen — den vises allerede øverst på siden.',
      initialValue: 'Meld deg på nyhetsbrevet',
    }),
    defineField({
      name: 'tekst',
      title: 'Tekstinnhold',
      type: 'blockContent',
      description: 'Kort tekst som vises over påmeldingsskjemaet',
    }),
  ],
  preview: {
    select: {
      title: 'overskrift',
    },
    prepare({ title }) {
      return {
        title: title || 'Nyhetsbrev',
        subtitle: 'Nyhetsbrev',
      }
    },
  },
})
