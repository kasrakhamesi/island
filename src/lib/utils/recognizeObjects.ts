import type { Object3D, Event } from 'three';

export function recogniseObjects(intersected: Object3D<Event>) {
	if (/Banners/.test(intersected.name)) {
		document.body.style.cursor = 'pointer';
	} else {
		document.body.style.cursor = 'initial';
	}
}
