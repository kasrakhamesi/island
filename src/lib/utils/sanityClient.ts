import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { ISanityFile } from 'src/@types/setting.type';

const projectId = import.meta.env.VITE_PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_PUBLIC_SANITY_DATASET;

export const client = sanityClient({
	projectId,
	dataset,
	apiVersion: '1',
	useCdn: import.meta.env.PROD
});

const builder = imageUrlBuilder(client);

export function imgUrl(source: SanityImageSource) {
	return builder.image(source);
}

export const fileUrl = (file: ISanityFile) => {
	const [, id, extension] = file.asset._ref.split('-');
	return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
};

export default client;
