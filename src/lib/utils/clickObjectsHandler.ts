import { type Object3D, type Event, Vector3, Quaternion } from 'three';
import { selectedObject } from 'src/lib/stores/selectedObject';
import { camera, setting, scene, tl, lookAt } from 'src/lib/Scene/scrollForwardCfg';
import { dev } from '$app/environment';

let alpha = 0;
let scrollHeight = 0;
let banner: Object3D<Event> | undefined;
let captureLastPositionOfCamera: Vector3;
let captureLastPositionTime: number;
let captureLastquaternionOfCamera: Quaternion;
let captureLastquaternionOfFlag: Quaternion;
let inFrontOfFlagPosition: Vector3;
let lookAtFlagPosition: Vector3;
let zoomToBannerInterval: NodeJS.Timer;
let zoomOutFromBannerInterval: NodeJS.Timer;
const intervalTime = 10;
const maxAlpha = 1;

export const clickObjectsHandler = (
	INTERSECTED: Object3D<Event> | null,
	clickevent: MouseEvent
) => {
	const name = INTERSECTED?.name;
	if (name) {
		if (name.startsWith('Banners')) {
			handleObjectClicked(INTERSECTED, clickevent);
		} else {
			if (dev) console.log(name);
		}
	}
};

function handleObjectClicked(intersected: Object3D<Event>, clickevent: MouseEvent) {
	clickevent.stopPropagation();
	if (dev) console.log('name : ', intersected.name);
	selectedObject.update(() => {
		return intersected.name;
	});
}

export async function handleDrawer(name: string | null) {
	if (name) {
		document.body.style.overflow = 'hidden';

		banner = scene.getObjectByName(name);
		if (!banner) throw new Error('object not found!');
		tl.scrollTrigger?.disable(false, false);
		captureLastPositionOfCamera = camera.position.clone();
		captureLastquaternionOfCamera = camera.quaternion.clone();
		captureLastquaternionOfFlag = banner.quaternion.clone();
		scrollHeight = window.scrollY;
		captureLastPositionTime = tl.time();
		setting.isScrollDisabled = true;
		inFrontOfFlagPosition = banner.localToWorld(new Vector3(0, 0, 2)); // calculate new position of camera in front of the banner
		lookAtFlagPosition = banner.localToWorld(new Vector3(-0.88, 0, 0)); // calculate new position camera will look at
		if (zoomOutFromBannerInterval) {
			clearInterval(zoomOutFromBannerInterval);
			alpha = 0;
		}
		zoomToBannerInterval = setInterval(zoomToBannerLerp, intervalTime);
	} else if (captureLastPositionOfCamera) {
		if (zoomToBannerInterval) {
			clearInterval(zoomToBannerInterval);
			alpha = 0;
		}
		zoomOutFromBannerInterval = setInterval(zoomOutFromBannerLerp, intervalTime);
		document.body.style.overflow = 'auto';
		window.scrollTo({
			top: scrollHeight
		});
		await new Promise((r) => setTimeout(r, intervalTime / 0.01));
		tl.scrollTrigger?.enable(false, false);
		tl.time(captureLastPositionTime);
		setting.isScrollDisabled = false;
	}
}

function zoomToBannerLerp() {
	if (alpha >= maxAlpha) {
		clearInterval(zoomToBannerInterval);
		alpha = 0;
	}
	if (alpha <= maxAlpha) alpha += 0.01;
	camera.position.lerp(inFrontOfFlagPosition, alpha);
	lookAt.pos = lookAtFlagPosition;
}

function zoomOutFromBannerLerp() {
	if (alpha >= maxAlpha) {
		clearInterval(zoomOutFromBannerInterval);
		alpha = 0;
	}
	if (alpha <= maxAlpha) alpha += 0.01;
	camera.position.lerp(captureLastPositionOfCamera, alpha);
	camera.quaternion.slerp(captureLastquaternionOfCamera, alpha);
	if (banner) banner.quaternion.slerp(captureLastquaternionOfFlag, alpha);
	lookAt.pos = undefined;
}
