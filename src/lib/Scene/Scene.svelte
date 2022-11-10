<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { selectedObject } from '$lib/stores/selectedObject';
	import { toPlainText } from '@portabletext/svelte';
	import Drawer from 'src/lib/Drawer/index.svelte';
	import { fileUrl } from '$lib/utils/sanityClient';
	import type { IBanner } from 'src/@types/banner.type';
	import type { SanitySettings } from 'src/@types/setting.type';

	export let settings: SanitySettings;
	export let isLoading: boolean;
	export let banners: IBanner[];

	let handleDrawer: (value: string | null) => Promise<void>;
	let el: HTMLCanvasElement;

	let destroy3D: Function;
	let selected_obj: null | string = null;
	const finalText = toPlainText(settings[0].final_text as any);

	$: drawerContent = banners.find((el) => el.banner_name === selected_obj);

	function windowClicked() {
		if (selected_obj) selectedObject.update(() => null);
	}

	const unsub1 = selectedObject.subscribe((value) => {
		if (!browser || !handleDrawer) return;
		if (value) {
			handleDrawer(value);
		} else {
			handleDrawer(null);
		}
		selected_obj = value;
	});

	onMount(async () => {
		handleDrawer = (await import('src/lib/utils/clickObjectsHandler')).handleDrawer;
		const maxScrollY =
			(window as any).scrollMaxY ||
			document.documentElement.scrollHeight - document.documentElement.clientHeight;
		if (maxScrollY === window.scrollY) {
			window.scrollTo({
				top: 0
			});
		}
		import('./scrollForwardCfg').then(async ({ createScene }) => {
			const cfg = await createScene(el, fileUrl(settings[0].gltf), banners, finalText, {
				showGui: true
			});
			destroy3D = cfg.destroy3D;
			isLoading = false;
		});
		window.addEventListener('click', windowClicked);
	});

	onDestroy(() => {
		if (!browser) return;
		unsub1();
		window.removeEventListener('click', windowClicked);
		if (typeof destroy3D === 'function') destroy3D();
	});
</script>

<!-- <span style="width: {scrollPercent}%;" id="scrollProgress" /> -->

<canvas id="threejs" bind:this={el} />
<div
	role="presentation"
	on:click={(e) => {
		e.stopPropagation();
	}}
	class="fixed ease-linear duration-300 transition-all top-0 left-0 h-screen w-96 bg-primary text-white text-lg p-5 pt-16 {selected_obj
		? 'translate-x-0'
		: '-translate-x-96'} z-50"
>
	{#if drawerContent}
		<Drawer content={drawerContent} />
	{/if}
</div>

<style lang="scss">
	#threejs {
		width: 100%;
		height: 100%;
		min-height: 100vh;
		z-index: -1;
		position: fixed;
		top: 0;
		left: 0;
	}
	// #scrollProgress {
	//   position: fixed;
	//   top: 0;
	//   left: 0;
	//   height: 3px;
	//   background-color: aqua;
	//   z-index: 99;
	//   font-size: 3vh;
	// }
</style>
