import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export enum initTextState {
	IDLE,
	STARTED,
	FINISHED
}

export const scrollAnimationStarted = writable(
	typeof window === 'undefined' ? false : window.scrollY > 0
);
export const scrollAnimationFinished = writable(false);
export const scrollAnimationLoop = writable(browser ? (window.scrollY !== 0 ? 1 : 0) : 0);
export const scrollAnimationinitTextState = writable(
	browser
		? window.scrollY !== 0
			? initTextState.FINISHED
			: initTextState.IDLE
		: initTextState.IDLE
);
export const portableTextIndexInParent = writable(0);
