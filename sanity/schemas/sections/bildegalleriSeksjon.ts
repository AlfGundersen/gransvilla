import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

export default defineType({
  name: 'bildegalleriSeksjon',
  title: 'Bildegalleri',
  type: 'object',
  fields: [
    defineField({
      name: 'visInnhold',
      title: 'Vis overskrift og tekst',
      type: 'boolean',
      description: 'Slå på for å vise overskrift og tekst til venstre for galleriet',
      initialValue: false,
    }),
    defineField({
      name: 'overskrift',
      title: 'Overskrift',
      type: 'string',
      description: 'Vises til venstre for bildegalleriet',
      hidden: ({ parent }) => !parent?.visInnhold,
    }),
    defineField({
      name: 'tekst',
      title: 'Tekstinnhold',
      type: 'blockContent',
      description: 'Brødtekst som vises under overskriften til venstre',
      hidden: ({ parent }) => !parent?.visInnhold,
    }),
    defineField({
      name: 'antallKolonner',
      title: 'Antall kolonner',
      type: 'number',
      description: 'Antall bilder som vises samtidig i galleriet',
      options: {
        list: [
          { title: '1', value: 1 },
          { title: '2', value: 2 },
          { title: '3', value: 3 },
          { title: '4', value: 4 },
        ],
        layout: 'radio',
      },
      initialValue: 2,
    }),
    defineField({
      name: 'bildeforhold',
      title: 'Bildeformat',
      type: 'string',
      description: 'Velg sideforholdet bildene skal beskjæres til',
      options: {
        list: [
          { title: '16:9', value: '16/9' },
          { title: '3:2', value: '3/2' },
          { title: '4:3', value: '4/3' },
          { title: '1:1', value: '1/1' },
          { title: '3:4', value: '3/4' },
          { title: '2:3', value: '2/3' },
        ],
        layout: 'radio',
      },
      initialValue: '3/4',
    }),
    defineField({
      name: 'bilder',
      title: 'Bilder',
      type: 'array',
      description: 'Last opp opptil 10 bilder. Klikk på et bilde for å legge til alternativ tekst',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternativ tekst',
              type: 'string',
              description: 'Beskrivelse av bildet for skjermlesere og søkemotorer',
              components: { input: AltTextInput },
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(10),
    }),
  ],
  preview: {
    select: {
      title: 'overskrift',
      antallKolonner: 'antallKolonner',
      media: 'bilder.0',
    },
    prepare({ title, antallKolonner, media }) {
      return {
        title: title || 'Bildegalleri',
        subtitle: `${antallKolonner || 2} kolonner`,
        media,
      }
    },
  },
})
