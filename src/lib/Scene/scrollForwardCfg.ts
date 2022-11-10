import { dev } from '$app/environment';
import {
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Vector3,
	ACESFilmicToneMapping,
	PMREMGenerator,
	AnimationMixer,
	Object3D,
	Clock,
	type Event,
	type AnimationAction,
	Raycaster,
	Vector2,
	FogExp2,
	DoubleSide,
	ShaderMaterial,
	TextureLoader,
	PlaneGeometry,
	Mesh,
	MathUtils,
	CylinderGeometry,
	MeshPhongMaterial,
	MeshLambertMaterial,
	LinearFilter,
	Texture,
	AmbientLight,
	Color,
	DirectionalLight,
	Quaternion,
	AnimationClip,
	Cache,
	Group,
	PointLight
} from 'three';
import img from './textures/citrus.jpg';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// utils
import { recogniseObjects } from '$lib/utils/recognizeObjects';
import isphone from '$lib/utils/isPhone';
import { clickObjectsHandler } from '$lib/utils/clickObjectsHandler';
import { handleHideBannersFromDistantCamera } from '$lib/utils/hideObjectsFromCamera';
import { lerp } from '$lib/utils/lerp';
import { isProperRatio } from '$lib/stores/landscapeHandler';
import {
	initTextState,
	scrollAnimationFinished,
	scrollAnimationinitTextState,
	scrollAnimationLoop,
	scrollAnimationStarted
} from '$lib/stores/scrollAnimationState';
import type { Unsubscriber } from 'svelte/store';
import lockPageScroll from '$lib/utils/toggleVerticalScroll';
import type { IBanner } from 'src/@types/banner.type';
import { imgUrl } from '../utils/sanityClient';

export let mixer: AnimationMixer,
	duration: number,
	tl: gsap.core.Timeline,
	action: AnimationAction,
	scene: Scene,
	renderer: WebGLRenderer,
	pointLight: PointLight,
	sky: Sky,
	_isFinished: boolean,
	_isStarted: boolean,
	_loopNum: number,
	camera: PerspectiveCamera;
export const clock = new Clock(),
	ShaderMaterials: Array<ShaderMaterial> = [],
	lookAt: { pos: Vector3 | undefined } = { pos: undefined },
	unsubs: Array<Unsubscriber> = [],
	cameraState = {
		initCameraPos: new Vector3(),
		initCameraQuaternion: new Quaternion(),
		topCameraPos: new Vector3(0, 11, 9),
		topCameraQuaternion: new Quaternion(-0.5226872289306592, 0, 0, 0.8525245220595057)
	},
	parameters = {
		elevation: -1.5,
		azimuth: 161
	},
	pagePerc = {
		percent: 0
	};
export let setting = { isScrollDisabled: false, showGui: true, showBanners: false };

const isPhone = isphone(window.navigator).any;

export const createScene = async (
	el: HTMLCanvasElement,
	glbUrl: string,
	bannersData: IBanner[],
	finalText: string,
	options = {}
) => {
	// merge options and default settings
	setting = { ...setting, ...options };
	Cache.enabled = true;
	scene = new Scene();
	/**
	 * @description an object for detecting object in island in order to select or detect them
	 */
	const raycaster = new Raycaster();
	/**
	 * @description variable to store objects from island when we use raycaster.
	 */
	let INTERSECTED: Object3D<Event> | null;
	// add WebGLRenderer to render scene and set the size and pixel ration for it
	renderer = new WebGLRenderer({ antialias: !isPhone, canvas: el });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	// ?
	renderer.toneMapping = ACESFilmicToneMapping;
	// add GLTFLoader to load the island model with the help of DRACOLoader to extract to zipped .glb file
	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/draco/');
	loader.setDRACOLoader(dracoLoader);
	const islandGltf = await loader.loadAsync(dev ? '/objects/island.glb' : glbUrl);
	const { scene: island, animations } = islandGltf;
	const volcano = island.getObjectByName('volcano');
	volcano?.layers.set(2);
	const water = island.getObjectByName('Water_2_Water_0');
	if (!volcano || !water) throw new Error('no volcano or water!');
	camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.01,
		isPhone ? 500 : 2000020000
	);
	camera.layers.enable(2);
	const unsubs1 = scrollAnimationFinished.subscribe((isFinished) => {
		_isFinished = isFinished;
		if (isFinished) zoomOutToTop();
		if (!isFinished && _loopNum > 0) {
			zoomInToAction(animations[0]);
		}
	});
	const unsubs2 = scrollAnimationStarted.subscribe((isStarted) => {
		_isStarted = isStarted;
		const skipAnimation = window.scrollY !== 0;
		if (!skipAnimation) {
			camera.position.copy(cameraState.topCameraPos.clone());
			camera.quaternion.copy(cameraState.topCameraQuaternion.clone());
		}
		if (isStarted && !_isFinished) zoomInToAction(animations[0], skipAnimation);
	});
	const unsubs3 = scrollAnimationLoop.subscribe((loop) => (_loopNum = loop));
	unsubs.push(unsubs1, unsubs2, unsubs3);
	scrollAnimationStarted.subscribe;
	scene.add(island);
	// add fog to the scene
	if (!isPhone) scene.fog = new FogExp2(0xe2ffff, 0.07);

	// add sun to the scene
	const sun = new Vector3();

	if (!isPhone) {
		sky = new Sky();
		sky.scale.setScalar(10000);
		pointLight = new PointLight(0xfc5603);
		pointLight.position.copy(volcano.position.clone());
		pointLight.position.y += 1.7;
		pointLight.layers.set(2);
		pointLight.distance = 2;
		pointLight.layers.set(2);
		pointLight.intensity = 10;
		scene.add(pointLight);
		scene.add(sky);
	} else {
		scene.background = new Color(0xa0e3eb);
	}

	// flag

	if (isPhone) {
		const light = new DirectionalLight('#FFFFFF', 1.5);

		light.position.set(volcano.position.x, volcano.position.y + 10, volcano.position.z + 2);
		light.position.y += 50;
		light.lookAt(volcano.position);
		scene.add(light);
	}
	const ambientLight = new AmbientLight('#777777', 1.2);
	scene.add(ambientLight);

	const PoleGeometry = new CylinderGeometry(0.01, 0.01, 3, 16, 1);
	const PoleMaterial = new MeshPhongMaterial({
		color: '#ffcc99',
		specular: '#999999',
		shininess: 30
	});
	const pole = new Mesh(PoleGeometry, PoleMaterial);
	pole.position.set(-2.6, 0.01, 0.54);
	pole.name = 'Pole001';
	const bannerGeometry = new PlaneGeometry(1, 1, 32, 32);
	// scene.add(pole);
	// const flag = new Mesh(geometry, material2);
	// flag.position.set(-3.08, 1.01, 0.43);
	// flag.name = 'Banners100';
	// scene.add(flag);
	const banners: Array<Object3D<Event>> = [];
	scene.traverse((object) => object.name.includes('Banner') && banners.push(object));
	banners.forEach(async (banner) => {
		!setting.showBanners ? (banner.visible = false) : {};
		!setting.showBanners ? banner.scale.set(0, 0, 0) : {};
		const thisBannerSanity = bannersData.find((bd) => bd.banner_name === banner.name);
		const imageSrc = thisBannerSanity?.mainImage ? imgUrl(thisBannerSanity.mainImage).url() : img;
		(banner as any).material = await loadBannerMaterials(imageSrc);
		(banner as any).geometry = bannerGeometry;
		// (banner as any).rotation.set(0, (banner as any).rotation.y, 0);
		(banner as any).rotation.x = 0;
		(banner as any).rotation.y = 0;
		(banner as any).rotation.z = 0;
	});
	const fLoader = new FontLoader();
	const materials = [
		new MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
		new MeshPhongMaterial({ color: 0xffffff }) // side
	];
	const font = await fLoader.loadAsync('/fonts/optimer_regular.typeface.json');
	const textGeo = new TextGeometry(finalText, {
		font: font,
		size: 0.13,
		height: 0.01,
		curveSegments: 4
	});

	textGeo.computeBoundingBox();
	if (!textGeo.boundingBox) throw new Error('textGeo.boundingBox is null');
	const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
	const textMesh = new Mesh(textGeo, materials);

	textMesh.position.x = centerOffset;
	textMesh.position.y = 2;
	textMesh.position.z = 0;

	textMesh.rotation.x = 0;
	textMesh.rotation.y = Math.PI * 2;

	const group = new Group();
	group.add(textMesh);
	group.position.set(0.3, 1, -2.7);
	group.rotation.y = Math.PI / 4;
	group.name = 'outro_text';
	scene.add(group);

	const skyUniforms = sky?.material.uniforms;

	if (!isPhone) {
		skyUniforms['turbidity'].value = 10;
		skyUniforms['rayleigh'].value = 2;
		skyUniforms['mieCoefficient'].value = 0.005;
		skyUniforms['mieDirectionalG'].value = 0.8;
	}

	// ?
	const pmremGenerator = new PMREMGenerator(renderer);

	// udating the sun
	updateSun();
	function updateSun() {
		if (!isPhone) {
			const phi = MathUtils.degToRad(90 - parameters.elevation);
			const theta = MathUtils.degToRad(parameters.azimuth);
			sun.setFromSphericalCoords(1, phi, theta);
			sky.material.uniforms['sunPosition'].value.copy(sun);
			scene.environment = pmremGenerator.fromScene(sky as any).texture;
		}
	}

	// mouseover listenere to detect pointer
	document.addEventListener('mousemove', onPointerMove, false);
	function onPointerMove(event: MouseEvent) {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}

	// add event listener for resize to update size of renderer base on width and height of device
	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		isProperRatio(true);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		render();
	}

	// add click listener to click on specified object in island
	el.addEventListener('click', (_e) => {
		clickObjectsHandler(INTERSECTED, _e);
	});
	type ICallBack = { s: number; e: number; localP: number };
	const animationScripts: {
		start: number;
		end: number;
		/**
		 * @param s start percentage
		 * @param e end percentage
		 * @param localP current percentage
		 */
		func: (callBack: ICallBack) => void;
	}[] = [];

	// gsap scrollTrrigger todetect and update croll percentage
	gsap.registerPlugin(ScrollTrigger);
	tl = gsap.timeline({
		scrollTrigger: {
			trigger: '#threeView',
			start: 'top top',
			end: 'bottom 100%',
			scrub: 2
		}
	});
	tl.to(pagePerc, {
		percent: 1,
		// ease: Linear.easeNone,
		duration: 10,
		ease: 'none',
		immediateRender: true,
		onComplete: function () {
			setTimeout(() => {
				setting.isScrollDisabled = true;
				scrollAnimationinitTextState.set(initTextState.IDLE);
				scrollAnimationFinished.set(true);
			}, 2000);
		}
	});

	animationScripts.push({
		start: 1,
		end: 101,
		func: ({ localP }) => {
			// if (!setting.isScrollDisabled)
			water.scale.y = lerp(1, 1.8, localP);
		}
	});

	const playScrollAnimations = () => {
		animationScripts.forEach((a) => {
			if (pagePerc.percent * 100 >= a.start && pagePerc.percent * 100 < a.end) {
				a.func({
					s: a.start,
					e: a.end,
					localP: (pagePerc.percent * 100 - a.start) / (a.end - a.start)
				});
			}
		});
	};

	// ?
	const stats = Stats();
	dev && document.body.appendChild(stats.dom);

	// add gui for development
	if (setting.showGui && dev) {
		if ((window as any).gui) (window as any).gui.destroy();
		const localSetting = { destroyGui: () => gui.destroy(), volcanoSize: 1 };
		const gui = new GUI();
		(window as any).gui = gui;
		gui.close();
		gui.add(localSetting, 'destroyGui').name('show/hide Gui');
		gui.add(setting, 'isScrollDisabled').name('disable scroll');
		gui
			.add(setting, 'showBanners')
			.name('toggle banners')
			.onChange((show: boolean) =>
				banners.forEach((banner) => {
					banner.visible = show;
					banner.scale.set(show ? 0.5 : 0, show ? 0.5 : 0, show ? 0.5 : 0);
				})
			);
		const cameraPositionFolder = gui.addFolder('Camera Position');
		cameraPositionFolder.add(camera.position, 'x', -10, 15, 0.01).listen();
		cameraPositionFolder.add(camera.position, 'y', 0, 15, 0.01).listen();
		cameraPositionFolder.add(camera.position, 'z', -10, 15, 0.1).listen();
		const cameraRotationFolder = gui.addFolder('Camera Rotation');
		cameraRotationFolder.add(camera.rotation, 'x', -2 * Math.PI, 2 * Math.PI, 0.1).listen();
		cameraRotationFolder.add(camera.rotation, 'y', -2 * Math.PI, 2 * Math.PI, 0.1).listen();
		cameraRotationFolder.add(camera.rotation, 'z', -Math.PI, Math.PI, 0.1).listen();
		const folderSky = gui.addFolder('Sky');
		folderSky.add(parameters, 'elevation', -3, 90, 0.1).onChange(() => updateSun());
		folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(() => updateSun());
		folderSky.add(ambientLight, 'intensity', 0, 5, 0.01);
		const etc = gui.addFolder('etc');
		etc
			.add(localSetting, 'volcanoSize', 1, 5, 0.1)
			.name('volcano size')
			.onChange((n) => {
				volcano.scale.set(n, n, n);
			});
		folderSky.open();
	}

	// add pointer
	const pointer = new Vector2();
	// animate function for updating the scene
	function animate() {
		if (!renderer) return;
		if (!setting.isScrollDisabled) scrollCamera(setting.isScrollDisabled, pagePerc.percent);
		if (lookAt.pos) camera.lookAt(lookAt.pos);
		const dt = clock.getDelta();
		if (mixer) mixer.update(dt);
		requestAnimationFrame(animate);
		render();
		dev && stats.update();
	}

	function render() {
		if (!isPhone) {
			banners.forEach(async (banner: any) => {
				if (banner?.material?.uniforms?.uTime)
					banner.material.uniforms.uTime.value = clock.getElapsedTime();
			});
			// ShaderMaterials.forEach(
			// 	(material) => (material.uniforms.uTime.value = clock.getElapsedTime())
			// );
		}
		playScrollAnimations();
		renderer.render(scene, camera);
		raycaster.setFromCamera(pointer, camera);
		if (!setting.isScrollDisabled) {
			banners.map((banner: Object3D<Event>) => {
				const cameraClone = camera.position.clone();
				cameraClone.setY(banner.position.y);
				banner.lookAt(cameraClone.clone());
			});
		}
		handleHideBannersFromDistantCamera();
		const intersects = raycaster.intersectObject(scene, true);
		if (intersects.length !== 0) {
			const obj = intersects[0].object;
			if ((obj as any).material) {
				if (INTERSECTED != obj) {
					INTERSECTED = intersects[0].object;
					recogniseObjects(INTERSECTED);
				}
			} else {
				INTERSECTED = null;
			}
		}
	}

	// ?
	if (dev) {
		(window as any).scene = scene;
		(window as any).camera = camera;
		(window as any).mixer = mixer;
		(window as any).action = action;
		(window as any).renderer = renderer;
		(window as any).pole = pole;
		(window as any).tl = tl;
		(window as any).banners = banners;
		(window as any).setting = setting;
		(window as any).island = islandGltf;
		(window as any).pointLight = pointLight;
		(window as any).ambientLight = ambientLight;
		(window as any).tt = group;
		window.THREE = await import('three');
	}

	animate();
	return { renderer, scene, destroy3D };
};

function scrollCamera(isScrollDisabled: boolean, scrollPercent: number): void {
	if (!isScrollDisabled && action) {
		const timeByPercent = scrollPercent * duration;
		action.time = timeByPercent;
	}
}

async function loadBannerMaterials(imageSrc?: string) {
	let material: MeshLambertMaterial | ShaderMaterial;
	if (isPhone) {
		material = new MeshLambertMaterial({
			color: '#ffffff',
			map: await loadTexture(imageSrc),
			transparent: true,
			side: DoubleSide
		});
	} else {
		material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			uniforms: {
				uTime: { value: 0.0 },
				uAlpha: { value: 0.1 },
				uTexture: { value: await loadTexture(imageSrc) }
			},
			side: DoubleSide
		});
		ShaderMaterials.push(material);
	}
	return material;
}

const loadTexture = (image = img) => {
	const loader = new TextureLoader();
	return new Promise<Texture>((resolve, reject) => {
		loader.load(
			image,
			(texture) => {
				texture.magFilter = LinearFilter;
				texture.minFilter = LinearFilter;
				resolve(texture);
			},
			undefined,
			(err) => reject(err)
		);
	});
};

function zoomOutToTop() {
	let alpha = 0;
	lockPageScroll({ enable: true, scrollY: window.scrollY });
	const zoomOutFromVolcanoInterval = setInterval(zoomOutFromVolcanoLerp, 30);
	function zoomOutFromVolcanoLerp() {
		if (alpha >= 0.1) {
			clearInterval(zoomOutFromVolcanoInterval);
			alpha = 0;
		}
		if (alpha <= 0.1) alpha += 0.001;
		camera.position.lerp(cameraState.topCameraPos, alpha);
		camera.quaternion.slerp(cameraState.topCameraQuaternion, alpha);
		lookAt.pos = undefined;
	}
}

async function zoomInToAction(animation: AnimationClip, skipAnimation = false) {
	// find initial position and quaternion of camera from frame 1 of animation
	if (!skipAnimation) {
		animation.tracks.forEach((track) => {
			if (track.name === 'Camera.position') {
				cameraState.initCameraPos.set(track.values[0], track.values[1], track.values[2]);
			} else if (track.name === 'Camera.quaternion') {
				cameraState.initCameraQuaternion.set(
					track.values[0],
					track.values[1],
					track.values[2],
					track.values[3]
				);
			}
		});
		await new Promise<void>((resolve) => {
			let alpha = 0;
			lockPageScroll({ enable: true, scrollY: window.scrollY });
			const zoomInToCameraBottomInterval = setInterval(zoomInToBottomCameraLerp, 30);

			function zoomInToBottomCameraLerp() {
				if (alpha >= 0.1) {
					clearInterval(zoomInToCameraBottomInterval);
					alpha = 0;
					resolve();
				}
				if (alpha <= 0.1) alpha += 0.001;
				camera.position.lerp(cameraState.initCameraPos, alpha);
				camera.quaternion.slerp(cameraState.initCameraQuaternion, alpha);
				lookAt.pos = undefined;
			}
		});
		lockPageScroll({ enable: false });
	}
	if (window.scrollY === 0) {
		scrollAnimationinitTextState.set(initTextState.STARTED);
	} else {
		scrollAnimationinitTextState.set(initTextState.FINISHED);
	}
	unsubs.push(
		scrollAnimationinitTextState.subscribe((state) => {
			if (state === initTextState.FINISHED) {
				setting.isScrollDisabled = false;
				mixer = new AnimationMixer(camera);
				action = mixer.clipAction(animation);
				duration = animation.duration;
				camera.updateProjectionMatrix();
				action.play();
				action.paused = true;
			}
		})
	);
}

function destroy3D() {
	unsubs.forEach((unsub) => unsub());
	const cleanMaterial = (material: any) => {
		material.dispose();
		// dispose textures
		for (const key of Object.keys(material)) {
			const value = material[key];
			if (value && typeof value === 'object' && 'minFilter' in value) {
				value.dispose();
			}
		}
	};
	if (renderer && scene) {
		renderer.dispose();
		scene.traverse((object: any) => {
			if (!object.isMesh) return;
			object.geometry.dispose();
			if (object.material.isMaterial) {
				cleanMaterial(object.material);
			} else {
				// an array of materials
				for (const material of object.material) cleanMaterial(material);
			}
		});
		scene.clear();
		// @ts-expect-error
		renderer.context = null;
		// @ts-expect-error
		renderer.domElement = null;
		// @ts-expect-error
		renderer = null;
		// @ts-expect-error
		scene = null;
	}
}
