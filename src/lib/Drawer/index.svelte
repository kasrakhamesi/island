<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import type { IBanner } from 'src/@types/banner.type';
	import { selectedObject } from '$lib/stores/selectedObject';
	import ImageBlock from '../components/ImageBlock.svelte';

	export let content: IBanner;
</script>

<div
	class="drawer w-full h-full p-2 overflow-auto flex flex-col gap-3 scrollbar-thumb-blue-700 scrollbar-track-blue-300 overflow-y-scroll dark:scrollbar-thumb-blue-100 dark:scrollbar-track-gray-700 scrollbar-thin"
>
	<button on:click={() => selectedObject.set(null)} class="backBtn">
		<svg
			class="w-6 h-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Close</title>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 19l-7-7m0 0l7-7m-7 7h18"
			/></svg
		>
	</button>
	<h2 class="font-medium leading-tight text-5xl mt-0 mb-2">{content?.title}</h2>
	<div>
		<PortableText value={content.body} components={{ types: { image: ImageBlock } }} />
	</div>
</div>

<style lang="scss">
	.backBtn {
		position: absolute;
		top: 10px;
		right: 10px;
	}
</style>
