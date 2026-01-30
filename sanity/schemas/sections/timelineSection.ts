import { defineArrayMember, defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'

/**
 * Historie-seksjon - Interaktiv tidslinje
 *
 * Layout: Klikkbar årsliste med beskrivelse per år
 */
export default defineType({
  name: 'timelineSection',
  title: 'Historie',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          components: { input: AltTextInput },
        }),
      ],
    }),
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
      description: 'Vises over tidslinjen',
    }),
    defineField({
      name: 'entries',
      title: 'Tidslinje',
      description: 'Fortell historien til Gransvilla gjennom viktige årstall og milepæler',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineEntry',
          title: 'Tidslinje-element',
          fields: [
            defineField({
              name: 'year',
              title: 'År',
              type: 'number',
              validation: (Rule) => Rule.required().min(1900).max(2100),
            }),
            // --- Commented out for now, can be re-enabled later ---
            // defineField({
            //   name: 'title',
            //   title: 'Tittel',
            //   type: 'string',
            //   description: 'Overskrift som vises over bildet',
            // }),
            defineField({
              name: 'description',
              title: 'Beskrivelse',
              type: 'text',
              rows: 3,
              description: 'Teksten som vises når dette årstallet er valgt',
            }),
            // --- Commented out for now, can be re-enabled later ---
            // defineField({
            //   name: 'image',
            //   title: 'Bilde',
            //   type: 'image',
            //   options: {
            //     hotspot: true,
            //   },
            // }),
          ],
          preview: {
            select: {
              year: 'year',
              // title: 'title',
              // media: 'image',
            },
            prepare({ year /*, title, media */ }) {
              return {
                title: `${year || 'Ukjent år'}`,
                // subtitle: title || '',
                // media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      entries: 'entries',
      // media: 'entries.0.image',
    },
    prepare({ entries /*, media */ }) {
      const count = entries?.length || 0
      return {
        title: 'Historie',
        subtitle: `${count} element${count !== 1 ? 'er' : ''}`,
        // media,
      }
    },
  },
})
