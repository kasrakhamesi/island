<script lang="ts">
	import { dev } from '$app/environment';
	import { initTextState, scrollAnimationinitTextState } from '$lib/stores/scrollAnimationState';
	import isMobile from '$lib/utils/isPhone';

	export let portableText: string;
	export let upperCase = false;

	let skip = false;

	function typewriter(node: HTMLElement, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid)
			throw new Error(`This transition only works on elements with a single text node child`);

		const text = node.textContent as string;
		const duration = text.length / (speed * 0.01);
		window.onscroll = () => {
			skip = true;
			scrollAnimationinitTextState.set(initTextState.FINISHED);
		};

		return {
			duration,
			tick: (t: number) => {
				const i = ~~(text.length * t);
				const char = text.slice(0, i);
				node.innerHTML = char.replaceAll('\n', '<br />');
			}
		};
	}
</script>

{#if !skip}
	<p
		class={`typewriter typeWriting ${upperCase ? 'upper' : ''} ${isMobile().any ? '' : 'desktop'}`}
		in:typewriter={{ speed: dev ? 20 : 2 }}
		on:introend={() => scrollAnimationinitTextState.set(initTextState.FINISHED)}
	>
		{portableText}
	</p>
{:else}
	<p class={`typewriter ${upperCase ? 'upper' : ''} ${isMobile().any ? '' : 'desktop'}`}>
		{@html portableText.replaceAll('\n', '<br />')}
	</p>
{/if}

<style lang="scss">
	.typewriter {
		text-align: left;
		&.desktop {
			color: white;
			text-shadow: 2px 2px 5px #0000008a;
			line-height: initial;
		}
		&.upper {
			text-transform: uppercase;
			font-weight: lighter;
		}
	}
</style>
