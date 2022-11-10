import { LinkIcon } from '@sanity/icons';

export default {
	name: 'link',
	title: 'Social Links',
	type: 'document',
	icon: LinkIcon,
	fields: [
		{
			title: 'Name',
			name: 'name',
			type: 'string'
		},
		{
			title: 'URL',
			name: 'href',
			type: 'url',
			validation: (Rule) => Rule.required()
		},
		{
			title: 'Open in new window',
			name: 'openInNewWindow',
			type: 'boolean'
		}
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'href'
		}
	}
};
