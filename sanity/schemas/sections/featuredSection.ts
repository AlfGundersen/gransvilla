import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Fremhevet-seksjon - To kolonner med bilde, overskrift, beskrivelse og lenke
 */
export default defineType({
	name: "featuredSection",
	title: "Fremhevet",
	type: "object",
	fields: [
		defineField({
			name: "columns",
			title: "Kolonner",
			type: "array",
			of: [
				defineArrayMember({
					type: "object",
					name: "featuredColumn",
					title: "Kolonne",
					fields: [
						defineField({
							name: "heading",
							title: "Overskrift",
							type: "string",
							description: "Tittelen som vises øverst i kolonnen",
						}),
						defineField({
							name: "description",
							title: "Beskrivelse",
							type: "text",
							rows: 3,
							description:
								"Kort tekst som beskriver innholdet under overskriften",
						}),
						defineField({
							name: "link",
							title: "Lenke til side",
							type: "reference",
							to: [{ type: "page" }, { type: "event" }],
							options: {
								disableNew: true,
							},
							description:
								"Velg hvilken side besøkende kommer til når de klikker «Vis mer»",
						}),
						defineField({
							name: "image",
							title: "Bilde",
							type: "image",
							options: {
								hotspot: true,
							},
							description: "Tilhørende bilde for kolonnen",
							fields: [
								defineField({
									name: "alt",
									title: "Alternativ tekst",
									type: "string",
									description:
										"Beskrivelse av bildet for skjermlesere og søkemotorer",
								}),
							],
						}),
					],
					preview: {
						select: {
							title: "heading",
							media: "image",
						},
						prepare({ title, media }) {
							return {
								title: title || "Kolonne uten overskrift",
								media,
							};
						},
					},
				}),
			],
			validation: (Rule) => Rule.max(2).error("Maks 2 kolonner"),
		}),
	],
	preview: {
		select: {
			col0: "columns.0.heading",
			col1: "columns.1.heading",
			media: "columns.0.image",
		},
		prepare({ col0, col1, media }) {
			const items = [col0, col1].filter(Boolean);
			return {
				title: "Fremhevet",
				subtitle: items.join(" / "),
				media,
			};
		},
	},
});
