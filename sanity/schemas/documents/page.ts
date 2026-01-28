import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Side',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      validation: (Rule) => Rule.required().error('Tittel er påkrevd'),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL-adressen til siden (f.eks. "om-oss" gir /om-oss)',
      validation: (Rule) => Rule.required().error('URL-slug er påkrevd'),
    }),
    defineField({
      name: 'sections',
      title: 'Seksjoner',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'featuredSection' },
        { type: 'eventsSection' },
        { type: 'timelineSection' },
        { type: 'contentSection' },
        { type: 'featuredProductSection' },
        { type: 'newsletter' },
      ],
      description: 'Legg til og organiser innholdsseksjoner på siden',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: `/${slug || ''}`,
      }
    },
  },
})
