import { defineField, defineType } from 'sanity'

/**
 * Valgfri CTA-knapp brukt på arrangement- og innholdssider
 */

/** Sant når noen av knappefeltene faktisk er fylt ut. */
function harInnhold(parent: unknown): boolean {
  const knapp = parent as
    | { beskrivelse?: unknown[]; tekst?: string; lenke?: unknown; internLenke?: string }
    | undefined
  return Boolean(knapp?.beskrivelse?.length || knapp?.tekst || knapp?.lenke || knapp?.internLenke)
}

/**
 * Feltene ligger skjult til noen slår på «Legg til knapp», så skjemaet ikke
 * bruker plass på en knapp de fleste sider ikke har. Sider som allerede har
 * en knapp viser feltene uansett — ellers ville innhold som står på nett
 * blitt umulig å redigere fra Studio.
 */
const skjulUtenKnapp = ({ parent }: { parent?: unknown }) =>
  !(parent as { visKnapp?: boolean } | undefined)?.visKnapp && !harInnhold(parent)

export default defineType({
  name: 'knapp',
  title: 'Knapp',
  type: 'object',
  fields: [
    defineField({
      name: 'visKnapp',
      title: 'Legg til knapp',
      type: 'boolean',
      description: 'Slå på for å legge til tekst og/eller en knapp på siden',
      initialValue: false,
    }),
    defineField({
      name: 'beskrivelse',
      title: 'Tekst',
      type: 'simpleBlockContent',
      description: 'Valgfri kort tekst som vises over knappen',
      hidden: skjulUtenKnapp,
    }),
    defineField({
      name: 'tekst',
      title: 'Knappetekst',
      type: 'string',
      description: 'Teksten på knappen, f.eks. «Book bord»',
      hidden: skjulUtenKnapp,
    }),
    defineField({
      name: 'lenke',
      title: 'Lenke til side',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'event' }],
      options: { disableNew: true },
      description: 'Velg hvilken side besøkende kommer til når de klikker på knappen',
      hidden: skjulUtenKnapp,
    }),
    defineField({
      name: 'internLenke',
      title: 'Eller lenke til fast side',
      type: 'string',
      options: {
        list: [
          { title: 'Kontakt', value: '/kontakt' },
          { title: 'Butikken', value: '/butikken' },
        ],
      },
      description:
        'Faste sider som ikke finnes i listen over. Brukes bare hvis ingen side er valgt.',
      hidden: skjulUtenKnapp,
    }),
  ],
})
