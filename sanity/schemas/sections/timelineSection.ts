import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Historie-seksjon - Interaktiv tidslinje
 *
 * Layout: Bilde til venstre, klikkbar årsliste til høyre
 * Klikk på et år for å se beskrivelse og endre bildet
 */
export default defineType({
  name: 'timelineSection',
  title: 'Historie',
  type: 'object',
  fields: [
    defineField({
      name: 'entries',
      title: 'Tidslinje',
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
            defineField({
              name: 'title',
              title: 'Tittel',
              type: 'string',
              description: 'Overskrift som vises over bildet',
            }),
            defineField({
              name: 'description',
              title: 'Beskrivelse',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'image',
              title: 'Bilde',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
          ],
          preview: {
            select: {
              year: 'year',
              title: 'title',
              media: 'image',
            },
            prepare({ year, title, media }) {
              return {
                title: `${year || 'Ukjent år'}${title ? ` - ${title}` : ''}`,
                subtitle: title || '',
                media,
              }
            },
          },
        }),
      ],
      description: 'Legg til år med tittel, bilde og beskrivelse. Sorteres automatisk med nyeste først.',
    }),
  ],
  preview: {
    select: {
      entries: 'entries',
      media: 'entries.0.image',
    },
    prepare({ entries, media }) {
      const count = entries?.length || 0
      return {
        title: 'Historie',
        subtitle: `${count} element${count !== 1 ? 'er' : ''}`,
        media,
      }
    },
  },
})
