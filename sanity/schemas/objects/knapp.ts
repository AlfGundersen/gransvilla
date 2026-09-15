import { defineField, defineType } from 'sanity'

/**
 * Valgfri CTA-knapp brukt på arrangement- og innholdssider
 */

type KnappVerdi = {
  visKnapp?: boolean
  beskrivelse?: unknown[]
  tekst?: string
  lenketype?: string
  lenke?: unknown
  internLenke?: string
  url?: string
}

const verdi = (parent: unknown) => parent as KnappVerdi | undefined

/** Sant når noen av knappefeltene faktisk er fylt ut. */
function harInnhold(parent: unknown): boolean {
  const knapp = verdi(parent)
  return Boolean(
    knapp?.beskrivelse?.length || knapp?.tekst || knapp?.lenke || knapp?.internLenke || knapp?.url,
  )
}

/**
 * Feltene ligger skjult til noen slår på «Legg til knapp», så skjemaet ikke
 * bruker plass på en knapp de fleste sider ikke har. Sider som allerede har
 * en knapp viser feltene uansett — ellers ville innhold som står på nett
 * blitt umulig å redigere fra Studio.
 */
const skjulUtenKnapp = ({ parent }: { parent?: unknown }) =>
  !verdi(parent)?.visKnapp && !harInnhold(parent)

/**
 * Hvilken lenketype som gjelder. Knapper lagret før valget fantes har ingen
 * `lenketype`, så den leses ut av feltet som faktisk er fylt ut — uten det
 * ville «Ta kontakt» på Bryllup og Private selskap sett ut som knapper uten
 * lenke i Studio.
 */
function lenketypeFor(parent: unknown): string | undefined {
  const knapp = verdi(parent)
  if (knapp?.lenketype) return knapp.lenketype
  if (knapp?.lenke) return 'side'
  if (knapp?.internLenke) return 'snarvei'
  if (knapp?.url) return 'url'
  return undefined
}

/** Viser bare lenkefeltet som hører til valgt lenketype. */
const kunFor =
  (type: string) =>
  ({ parent }: { parent?: unknown }) =>
    skjulUtenKnapp({ parent }) || lenketypeFor(parent) !== type

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
      name: 'lenketype',
      title: 'Hvor skal knappen lenke?',
      type: 'string',
      options: {
        list: [
          { title: 'Snarvei', value: 'snarvei' },
          { title: 'Side på nettstedet', value: 'side' },
          { title: 'Egen URL', value: 'url' },
        ],
        layout: 'radio',
      },
      hidden: skjulUtenKnapp,
    }),
    defineField({
      name: 'internLenke',
      title: 'Snarvei',
      type: 'string',
      options: {
        list: [
          { title: 'Kontakt', value: '/kontakt' },
          { title: 'Butikken', value: '/butikken' },
          { title: 'Nyhetsbrev', value: '#nyhetsbrev' },
        ],
      },
      description: '«Nyhetsbrev» åpner påmeldingsvinduet i stedet for å gå til en side',
      hidden: kunFor('snarvei'),
    }),
    defineField({
      name: 'lenke',
      title: 'Side på nettstedet',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'event' }],
      options: { disableNew: true },
      description: 'Velg hvilken side besøkende kommer til når de klikker på knappen',
      hidden: kunFor('side'),
    }),
    defineField({
      name: 'url',
      title: 'Egen URL',
      type: 'url',
      description: 'Full adresse, f.eks. https://...',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
      hidden: kunFor('url'),
    }),
    defineField({
      name: 'tekst',
      title: 'Knappetekst',
      type: 'string',
      description: 'Teksten på knappen, f.eks. «Book bord»',
      hidden: skjulUtenKnapp,
    }),
    defineField({
      name: 'beskrivelse',
      title: 'Tekst',
      type: 'simpleBlockContent',
      description: 'Valgfri kort tekst som vises til venstre i seksjonen, sammen med overskriften',
      hidden: skjulUtenKnapp,
    }),
  ],
})
