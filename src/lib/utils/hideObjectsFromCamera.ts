import gsap, { Elastic, Linear } from 'gsap';
import type {
	Object3D,
	Event,
	ShaderMaterial,
	PlaneGeometry,
	Mesh,
	MeshLambertMaterial
} from 'three';
// import {  } from 'three';
import isphone from '$lib/utils/isPhone';
import { camera, scene, pagePerc } from 'src/lib/Scene/scrollForwardCfg';

const isPhone = isphone(window.navigator).any;

const scaleGsap = (obj: Object3D<Event>, num: number) =>
	gsap.to(obj.scale, {
		duration: /Banners/.test(obj.name) ? 1.2 : 0.3,
		ease: /Banners/.test(obj.name) ? Elastic.easeOut.config(1, 0.3) : Linear.easeNone,
		x: num,
		y: num,
		z: num
	});

const fadeShaderGsap = (obj: Mesh<PlaneGeometry, ShaderMaterial>, num: number) =>
	gsap.to(obj.material.uniforms.uAlpha, {
		duration: 0.3,
		ease: Linear.easeOut,
		value: num
	});

const fadeLambortGsap = (obj: Mesh<PlaneGeometry, MeshLambertMaterial>, num: number) =>
	gsap.to(obj.material, {
		duration: 0.3,
		ease: Linear.easeOut,
		opacity: num
	});

export const handleHideBannersFromDistantCamera = () => {
	scene.traverse(function (child) {
		if (/Banners/.test(child.name) || /Pole/.test(child.name)) {
			// eslint-disable-next-line no-debugger
			if (
				camera.position.distanceToSquared(child.position) < 20 &&
				camera.position.distanceToSquared(child.position) > 2
			) {
				toggleScale(child, true);
			} else {
				toggleScale(child, false);
			}
		} else if (/outro_text/.test(child.name)) {
			if (camera.position.distanceToSquared(child.position) < 50 && pagePerc.percent > 0.8) {
				toggleScale(child, true);
			} else {
				toggleScale(child, false);
			}
		}
	});
};

function toggleScale(obj: any, shouldShow: boolean) {
	if (shouldShow) {
		if (!obj.visible) {
			obj.visible = true;
			if (obj?.material?.uniforms) {
				fadeShaderGsap(obj, 0.999).then(() => scaleGsap(obj, 1));
			} else {
				if (isPhone && typeof obj?.material?.opacity !== 'undefined') obj.material.opacity = 0.999;
				scaleGsap(obj, 1);
			}
			(obj as any).initScale = undefined;
		}
	} else {
		// hide object
		if (!(obj as any).initScale) {
			(obj as any).initScale = obj.scale.clone();
			if (obj?.material?.uniforms) {
				fadeShaderGsap(obj as any, 0.0).then(() => {
					obj.visible = false;
					obj.scale.set(0, 0, 0);
				});
			} else {
				if (isPhone && typeof obj?.material?.opacity !== 'undefined') {
					fadeLambortGsap(obj as any, 0.0).then(() => {
						obj.visible = false;
						obj.scale.set(0, 0, 0);
					});
				} else {
					scaleGsap(obj, 0).then(() => (obj.visible = false));
				}
			}
		}
	}
}
