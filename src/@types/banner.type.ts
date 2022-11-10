import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { InputValue } from '@portabletext/svelte/ptTypes';

export interface IBanner {
	_createdAt: Date;
	_id: string;
	_rev: string;
	_type: string;
	_updatedAt: Date;
	banner_name: string;
	body: InputValue;
	mainImage: SanityImageSource;
	title: string;
}
