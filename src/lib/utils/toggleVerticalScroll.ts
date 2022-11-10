import { browser } from '$app/environment';

export function lockPageScroll(options: { scrollY?: number; enable: boolean }) {
	if (browser) {
		if (options.enable) {
			window.onscroll = function () {
				window.scrollTo({
					top: options.scrollY || 0
				});
			};
		} else {
			window.onscroll = null;
		}
	}
}

export default lockPageScroll;
