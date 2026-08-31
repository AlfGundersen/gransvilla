import { defineArrayMember, defineField, defineType } from 'sanity'
import { AltTextInput } from '../../components/AltTextInput'
import { watermarkFields } from '../objects/watermarkFields'

/**
 * Historie-seksjon
 *
 * Layout: Tittel og bilde til venstre, overskrift og tekstavsnitt til høyre
 */
export default defineType({
  name: 'timelineSection',
  title: 'Historie',
  type: 'object',
  fields: [
    defineField({
      name: 'imageTitle',
      title: 'Tittel over bildet',
      type: 'string',
      description: 'Vises stort til venstre, f.eks. «Oppført i 1914»',
    }),
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
        ...watermarkFields,
      ],
    }),
    defineField({
      name: 'heading',
      title: 'Overskrift',
      type: 'string',
      description: 'Overskriften over teksten til høyre, f.eks. «Vår historie»',
    }),
    defineField({
      name: 'entries',
      title: 'Tekstavsnitt',
      description: 'Avsnittene som vises under overskriften til høyre for bildet',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineEntry',
          title: 'Avsnitt',
          fields: [
            defineField({
              name: 'description',
              title: 'Tekst',
              type: 'simpleBlockContent',
            }),
          ],
          preview: {
            select: {
              description: 'description',
            },
            prepare({ description }) {
              const descText = Array.isArray(description)
                ? description
                    .map(
                      (block: { children?: { text?: string }[] }) =>
                        block.children?.map((c) => c.text).join('') ?? '',
                    )
                    .join(' ')
                : ''
              return {
                title: descText?.substring(0, 40) || 'Avsnitt',
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'imageTitle',
      heading: 'heading',
      entries: 'entries',
    },
    prepare({ title, heading, entries }) {
      const count = entries?.length || 0
      return {
        title: 'Historie',
        subtitle: [title || heading, `${count} avsnitt`].filter(Boolean).join(' — '),
      }
    },
  },
})
