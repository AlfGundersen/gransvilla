import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Arrangementside',
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
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 96),
      },
      description: 'Klikk "Generate" for å lage URL fra tittelen',
      validation: (Rule) => Rule.required().error('URL-slug er påkrevd'),
    }),
    defineField({
      name: 'description',
      title: 'Kort beskrivelse',
      type: 'text',
      rows: 4,
      description: 'Kort sammendrag som vises i lister',
    }),
    defineField({
      name: 'body',
      title: 'Full beskrivelse',
      type: 'blockContent',
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
      title: 'title',
      description: 'description',
      media: 'image',
    },
    prepare({ title, description, media }) {
      return {
        title,
        subtitle: description ? description.substring(0, 50) + (description.length > 50 ? '...' : '') : '',
        media,
      }
    },
  },
})
