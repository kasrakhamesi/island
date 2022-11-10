import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async ({ event, resolve }) => {
	// eslint-disable-next-line prefer-const
	let options = {};
	// if (event.url.pathname === '/') options = { ssr: false };

	const response = await resolve(event, options);
	return response;
};
