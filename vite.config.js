import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), glsl()],
	resolve: {
		alias: {
			src: path.resolve('./src')
		}
	}
};

export default config;
