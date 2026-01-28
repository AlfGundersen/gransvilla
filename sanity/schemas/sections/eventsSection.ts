import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Arrangementer-seksjon - Fremhevede arrangementer med bilder
 *
 * Hvert arrangement har 2 tilknyttede bilder som vises når man holder over.
 */
export default defineType({
  name: 'eventsSection',
  title: 'Arrangementer',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Arrangementer',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'eventItem',
          title: 'Arrangement',
          fields: [
            defineField({
              name: 'event',
              title: 'Arrangement',
              type: 'reference',
              to: [{ type: 'event' }],
              options: {
                disableNew: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'imageLayout',
              title: 'Antall bilder',
              type: 'string',
              options: {
                list: [
                  { title: '1 bilde', value: '1' },
                  { title: '2 bilder', value: '2' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: '2',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image1',
              title: 'Bilde 1',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alternativ tekst',
                  type: 'string',
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image2',
              title: 'Bilde 2',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alternativ tekst',
                  type: 'string',
                }),
              ],
              hidden: ({ parent }) => parent?.imageLayout === '1',
            }),
          ],
          preview: {
            select: {
              title: 'event.title',
              media: 'image1',
            },
            prepare({ title, media }) {
              return {
                title: title || 'Velg arrangement',
                media,
              }
            },
          },
        }),
      ],
      description: 'Legg til arrangementer med tilhørende bilder',
      validation: (Rule) => Rule.min(1).error('Legg til minst ett arrangement'),
    }),
  ],
  preview: {
    select: {
      item0: 'items.0.event.title',
      item1: 'items.1.event.title',
      item2: 'items.2.event.title',
      media: 'items.0.image1',
    },
    prepare({ item0, item1, item2, media }) {
      const items = [item0, item1, item2].filter(Boolean)
      return {
        title: 'Arrangementer',
        subtitle: `${items.length} arrangement${items.length !== 1 ? 'er' : ''}`,
        media,
      }
    },
  },
})
