import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'navigation',
  title: 'Navigasjon',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required().error('Tittel er påkrevd'),
    }),
    defineField({
      name: 'identifier',
      title: 'Identifikator',
      type: 'string',
      description: 'F.eks. "hovedmeny", "bunntekst-nav"',
      validation: (Rule) => Rule.required().error('Identifikator er påkrevd'),
    }),
    defineField({
      name: 'items',
      title: 'Navigasjonselementer',
      type: 'array',
      of: [{ type: 'link' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      identifier: 'identifier',
    },
    prepare({ title, identifier }) {
      return {
        title,
        subtitle: identifier,
      }
    },
  },
})
