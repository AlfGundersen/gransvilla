import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'link',
  title: 'Lenke',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Tekst',
      type: 'string',
      validation: (Rule) => Rule.required().error('Tekst er påkrevd'),
    }),
    defineField({
      name: 'linkType',
      title: 'Lenketype',
      type: 'string',
      options: {
        list: [
          { title: 'Intern side', value: 'internal' },
          { title: 'Ekstern URL', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internalLink',
      title: 'Intern side',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Ekstern URL',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Åpne i ny fane',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      linkType: 'linkType',
    },
    prepare({ title, linkType }) {
      return {
        title,
        subtitle: linkType === 'external' ? 'Ekstern lenke' : 'Intern lenke',
      }
    },
  },
})
