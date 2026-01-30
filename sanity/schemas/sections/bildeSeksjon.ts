import { defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

export default defineType({
  name: 'bildeSeksjon',
  title: 'Bilde',
  type: 'object',
  fields: [
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
      name: 'fullBredde',
      title: 'Vis i full bredde',
      type: 'boolean',
      description: 'Strekker bildet over hele sidebredden i stedet for høyre kolonne',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      media: 'bilde',
      fullBredde: 'fullBredde',
    },
    prepare({ media, fullBredde }) {
      return {
        title: 'Bildeseksjon',
        subtitle: fullBredde ? 'Full bredde' : 'Standard bredde',
        media,
      }
    },
  },
})
