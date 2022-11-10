import { error, type ServerLoad } from '@sveltejs/kit';
import client from '$lib/utils/sanityClient';
import type { IBanner } from '../@types/banner.type';
import type { SanitySettings } from '../@types/setting.type';

export const prerender = true;

export const load: ServerLoad = async (): Promise<{
	settings: SanitySettings;
	banners: IBanner[];
}> => {
	const [settings, banners] = await Promise.all([
		client.fetch<SanitySettings>(`*[_type == "siteSettings"]`),
		client.fetch<IBanner[]>(`*[_type == "banner"]`)
	]);

	if (!settings || !banners) throw error(500, 'Internal Server Error');

	return {
		settings,
		banners
	};
};
