import { writable } from 'svelte/store';

export const selectedObject = writable<null | string>(null);
