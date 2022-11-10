import { DocumentIcon } from '@sanity/icons';

export default {
	name: 'banner',
	title: 'Banners',
	icon: DocumentIcon,
	type: 'document',
	fields: [
		{
			name: 'banner_name',
			title: 'Banner Slug',
			type: 'string'
		},
		{
			name: 'title',
			title: 'Title',
			type: 'string'
		},
		{
			name: 'mainImage',
			title: 'Texture',
			type: 'image',
			options: {
				hotspot: true
			}
		},
		{
			name: 'body',
			title: 'Body',
			type: 'blockContent'
		}
	]

	// preview: {
	// 	select: {
	// 		title: 'title',
	// 		author: 'author.name',
	// 		media: 'mainImage'
	// 	},
	// 	prepare(selection) {
	// 		const { author } = selection;
	// 		return Object.assign({}, selection, {
	// 			subtitle: author && `by ${author}`
	// 		});
	// 	}
	// }
};
