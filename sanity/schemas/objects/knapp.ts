import { defineField, defineType } from 'sanity'

/**
 * Valgfri CTA-knapp brukt på arrangement- og innholdssider
 */
export default defineType({
  name: 'knapp',
  title: 'Knapp',
  type: 'object',
  fields: [
    defineField({
      name: 'beskrivelse',
      title: 'Tekst',
      type: 'simpleBlockContent',
      description: 'Valgfri kort tekst som vises over knappen',
    }),
    defineField({
      name: 'tekst',
      title: 'Knappetekst',
      type: 'string',
      description: 'Teksten på knappen, f.eks. «Book bord»',
    }),
    defineField({
      name: 'lenke',
      title: 'Lenke til side',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'event' }],
      options: { disableNew: true },
      description: 'Velg hvilken side besøkende kommer til når de klikker på knappen',
    }),
  ],
})
