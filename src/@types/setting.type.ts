import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type { InputValue } from '@portabletext/svelte/ptTypes';

export type SanitySettings = ISetting[];

export interface ISetting {
	backToHome_link: string;
	description: string;
	final_text: InputValue;
	gltf: ISanityFile;
	init_text: string;
	logo: SanityImageSource;
	music: ISanityFile;
	socialMedia: [];
	title: string;
	whitePaper_link: string;
	_createdAt: Date;
	_id: string;
	_rev: string;
	_type: string;
	_updatedAt: Date;
}

export interface ISanityFile {
	asset: {
		_ref: `file-${string}-${string}`;
		_type: 'reference';
	};
	_type: 'file';
}
