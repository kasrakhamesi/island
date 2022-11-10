/// <reference types="@sveltejs/kit" />
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}
declare module '*.glsl' {
	const glsl: string;
	export default glsl;
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
	export const EffectComposer: typeof import('@types/three/examples/jsm/postprocessing/EffectComposer').EffectComposer;
	export const Pass: typeof THREE.Pass;
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
	export const RenderPass: typeof THREE.RenderPass;
}

declare module 'three/examples/jsm/libs/lil-gui.module.min.js' {
	export const GUI: typeof import('dat.gui').GUI;
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
	export const UnrealBloomPass: typeof THREE.UnrealBloomPass;
}

declare module 'three/examples/jsm/postprocessing/ShaderPass' {
	export const ShaderPass: typeof THREE.ShaderPass;
}

declare module 'three/examples/jsm/shaders/CopyShader' {
	export const CopyShader: typeof THREE.CopyShader;
}
declare module 'three/examples/jsm/shaders/DotScreenShader' {
	export const DotScreenShader: typeof THREE.DotScreenShader;
}
declare module 'three/examples/jsm/shaders/RGBShiftShader' {
	export const RGBShiftShader: typeof THREE.RGBShiftShader;
}
