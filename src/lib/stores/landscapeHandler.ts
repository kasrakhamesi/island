import { writable } from 'svelte/store';
import isMobile from 'src/lib/utils/isPhone';
import { browser } from '$app/environment';

export const isProperRatio = (doSetState = false): boolean => {
	let result = false;
	if (browser) {
		const isphone = isMobile(window.navigator);
		result = isphone.any ? isphone.isLandscape && !isphone.isPortrait : true;
		if (window.innerWidth < 630) result = false;
	}
	if (doSetState) isLandScapeWritable.set(result);
	return result;
};

export const isLandScapeWritable = writable(isProperRatio());
export default isLandScapeWritable;
