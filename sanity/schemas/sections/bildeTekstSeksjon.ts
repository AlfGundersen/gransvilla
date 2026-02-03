import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

export default defineType({
  name: 'bildeTekstSeksjon',
  title: 'Bilde og tekst',
  type: 'object',
  fields: [
    defineField({
      name: 'bildeForst',
      title: 'Bilde først',
      type: 'boolean',
      initialValue: true,
      description: 'Av = tekst først, på = bilde først',
    }),
    defineField({
      name: 'bilde',
      title: 'Bilde',
      type: 'image',
      description: 'Last opp et bilde. Bruk hotspot for å angi fokuspunkt',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'Beskrivelse av bildet for skjermlesere',
          components: { input: AltTextInput },
        }),
      ],
    }),
    defineField({
      name: 'bildeforhold',
      title: 'Bildeformat',
      type: 'string',
      description: 'Velg sideforholdet bildet skal beskjæres til',
      options: {
        list: [
          { title: '16:9', value: '16/9' },
          { title: '3:2', value: '3/2' },
          { title: '4:3', value: '4/3' },
          { title: '1:1', value: '1/1' },
        ],
        layout: 'radio',
      },
      initialValue: '3/2',
    }),
    defineField({
      name: 'visOverskrift',
      title: 'Vis overskrift',
      type: 'boolean',
      description: 'Slå på for å vise en overskrift over teksten',
      initialValue: false,
    }),
    defineField({
      name: 'overskrift',
      title: 'Overskrift',
      type: 'string',
      description: 'Vises over brødteksten i seksjonen',
      hidden: ({ parent }) => !parent?.visOverskrift,
    }),
    defineField({
      name: 'tekst',
      title: 'Tekstinnhold',
      type: 'blockContent',
      description: 'Brødtekst som vises ved siden av bildet',
    }),
  ],
  preview: {
    select: {
      title: 'overskrift',
      media: 'bilde',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Bilde og tekst',
        subtitle: 'Bilde og tekst',
        media,
      }
    },
  },
})
