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
              name: 'showTitle',
              title: 'Vis tittel',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'title',
              title: 'Tittel',
              type: 'string',
              description: 'F.eks. årstall eller annen overskrift',
              hidden: ({ parent }) => !parent?.showTitle,
            }),
            defineField({
              name: 'description',
              title: 'Beskrivelse',
              type: 'simpleBlockContent',
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
              title: 'title',
              description: 'description',
            },
            prepare({ title, description }) {
              const descText = Array.isArray(description)
                ? description.map((block: { children?: { text?: string }[] }) =>
                    block.children?.map((c) => c.text).join('') ?? ''
                  ).join(' ')
                : ''
              return {
                title: title || descText?.substring(0, 30) || 'Tidslinje-element',
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
