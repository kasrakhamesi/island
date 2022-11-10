<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { get } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Scene from '$lib/Scene/Scene.svelte';
	import isLandScapeWritable from '$lib/stores/landscapeHandler';
	import lockPageScroll from '$lib/utils/toggleVerticalScroll';
	import Typewriter from '$lib/components/Typewriter.svelte';
	import isPhone from '$lib/utils/isPhone';
	import { Howl } from 'howler';
	import { fileUrl } from '$lib/utils/sanityClient';
	import {
		initTextState,
		scrollAnimationFinished,
		scrollAnimationinitTextState,
		scrollAnimationLoop,
		scrollAnimationStarted
	} from '$lib/stores/scrollAnimationState';

	export let data: import('./$types').PageData;
	const { banners, settings } = data;

	if (browser && dev) console.log('props: ', $$props);

	let isLandScape = true;
	let threeView: HTMLDivElement;
	let showFinishedScreen = false;
	let showStartScreen = false;
	let isLoading = true;
	let scrolledDuringTypeWriter = false;
	let showInitTextScreen = get(scrollAnimationinitTextState) === initTextState.FINISHED;
	let portableTextIndexInParent = 0;
	let showScrollDownAnimation = false;
	let sound: Howl;
	let soundLoaded = false;
	let isSoundPlaying = false;

	onMount(() => {
		sound = new Howl({
			src: fileUrl(settings[0].music),
			autoplay: false,
			preload: true,
			loop: true,
			volume: 0.7,
			onload: () => {
				soundLoaded = true;
			}
		});
	});

	const unsubFromLandscape = isLandScapeWritable.subscribe((val) =>
		browser ? (isLandScape = val) : {}
	);

	const unsubScrollAnim = scrollAnimationFinished.subscribe((isFinished) => {
		if (browser && threeView) {
			if (isFinished) {
				showFinishedScreen = true;
				scrollAnimationLoop.update((loop) => loop + 1);
			} else {
				showFinishedScreen = false;
				// scrollAnimationinitTextState.set(initTextState.FINISHED);
				window.scrollTo({ top: 0 });
			}
		}
	});

	const unsubScrollStarted = scrollAnimationStarted.subscribe((isStarted) => {
		if (browser) {
			if (isStarted) {
				lockPageScroll({ enable: false });
				showStartScreen = false;
				if (soundLoaded && !sound?.playing()) {
					sound.play();
					isSoundPlaying = true;
				}
			} else {
				lockPageScroll({ enable: true });
				showStartScreen = true;
			}
		}
	});

	const unsubScrollInitTextState = scrollAnimationinitTextState.subscribe((state) => {
		if (browser) {
			if (state === initTextState.STARTED) {
				showInitTextScreen = true;
				window.onscroll = () => {
					scrolledDuringTypeWriter = true;
					scrollAnimationinitTextState.set(initTextState.FINISHED);
				};
			} else if (state === initTextState.IDLE) {
				showInitTextScreen = false;
			} else if (state === initTextState.FINISHED) {
				lockPageScroll({ enable: false });
				showScrollDownAnimation = true;
			}
		}
	});

	onDestroy(() => {
		unsubFromLandscape();
		unsubScrollAnim();
		unsubScrollStarted();
		unsubScrollInitTextState();
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Huralya Genesis Home Page" />
</svelte:head>

<div class={isLandScape ? 'hidden' : 'show'} id="flipPhone">
	<figure class="p-8 flex justify-center items-center flex-col">
		<img src="/images/rotate.gif" alt={'an animated picture flipping the phone'} />
		<figcaption>please flip your phone or reload current page</figcaption>
	</figure>
</div>
<div style="height: 20000px;" bind:this={threeView} id="threeView" />

{#if !isLoading && browser && showInitTextScreen}
	<div transition:fade id="intro" class="mt-6 mx-6 md:mx-20 text-center">
		<Typewriter portableText={settings[0].init_text} />
	</div>
	{#if showScrollDownAnimation}
		<div
			title="scroll down to view page"
			transition:fade={{ delay: 500, duration: 1200 }}
			class="mouse"
		/>
	{/if}
{/if}

<Scene {banners} {settings} bind:isLoading />

{#if showFinishedScreen}
	<div
		class={`justify-center items-center ${isPhone().any ? 'text-white' : 'text-current'}`}
		transition:fade
		id="finishedScreen"
	>
		<a class="whitePaper" href={settings[0].whitePaper_link}>Whitepaper</a>
		<button
			class="reloadBtn flex items-center rounded-lg "
			on:click={() => {
				scrollAnimationFinished.set(false);
			}}
		>
			<svg
				class="w-6 h-6"
				style="display: none;"
				fill="none"
				stroke={isPhone().any ? 'white' : 'currentColor'}
				enable-background={1}
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/></svg
			>
		</button>
		<a class="backHome" href={settings[0].backToHome_link}>Back to Home</a>
	</div>
{/if}

{#if showStartScreen}
	<div transition:fade id="startScreen">
		<div class="flex flex-col h-screen w-screen items-center justify-center">
			<button
				on:click={() => !isLoading && scrollAnimationStarted.set(true)}
				type="button"
				class={`${
					!isLoading ? 'startBtn' : ''
				} flex transition-opacity duration-1000 justify-center items-center rounded-lg px-4 py-2 border text-white bg-transparent`}
				disabled={isLoading || !soundLoaded}
			>
				{#if isLoading}
					<svg
						out:fade={{ duration: 300, delay: 300 }}
						class="mr-3 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				{/if}
				<span class="font-medium">
					{isLoading ? `downloading...` : 'start game'}
				</span>
			</button>
		</div>
	</div>
{/if}

<div id="music">
	{#if soundLoaded}
		{#if isSoundPlaying}
			<button
				title="mute sound"
				on:click={() => {
					sound.fade(1, 0, 1000);
					isSoundPlaying = false;
				}}
			>
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
					/></svg
				>
			</button>
		{:else}
			<button
				on:click={() => {
					if (!sound?.playing()) sound.play();
					sound.fade(0, 1, 1000);
					isSoundPlaying = true;
				}}
				title="play sound"
			>
				<svg
					class="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
						clip-rule="evenodd"
					/><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
					/></svg
				>
			</button>
		{/if}
	{/if}
</div>

<style lang="scss">
	#flipPhone {
		width: 100vw;
		height: 100vh;
		position: fixed;
		z-index: 2;
		top: 0;
		left: 0;
		&.show {
			img {
				display: block;
				filter: brightness(0);
			}
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: white;
		}
	}
	#threeView {
		width: 100vw;
		color: white;
		z-index: -1;
		position: absolute;
		width: 100%;
		margin: 0px auto;

		display: grid;
		grid-template-columns: repeat(12, 1fr);
	}
	#startScreen {
		.startBtn {
			color: transparent;
			border: none;
			height: 100px;
			width: 300px;
			background: transparent 50% 50% no-repeat url(/images/Start-button.png);
		}
	}
	#finishedScreen {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: normal;
		z-index: 2;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		& > button,
		a {
			margin: 0 5px;
			padding: 10px;
			background-size: 100% 100%;
			color: transparent;
			border-radius: 5px;
		}
		.whitePaper {
			background-image: url(/images/Whitepaper.png);
			width: 150px;
			height: 50px;
		}
		.reloadBtn {
			background-image: url(/images/Restart.png);
			width: 54.5px;
			height: 50px;
		}
		.backHome {
			background-image: url(/images/Back-to-Home.png);
			width: 150px;
			height: 50px;
		}
	}
	#intro {
		background: linear-gradient(135deg, #0000001a, #ffffff1a);
		border-radius: 2rem;
		padding: 1.5rem;
	}
	.mouse {
		width: 50px;
		height: 100px;
		border: 1px solid rgb(210, 210, 210);
		border-radius: 50px;
		position: relative;
		margin: 1rem auto;
		box-shadow: inset 1px 0px 9px 1px #00000059;
		&::before {
			content: '';
			width: 12px;
			height: 12px;
			position: absolute;
			top: 10px;
			left: 50%;
			transform: translateX(-50%);
			background-color: rgb(209, 209, 209);
			border-radius: 50%;
			opacity: 1;
			box-shadow: 0px 0px 4px 2px rgb(0 0 0 / 30%);
			animation: wheel 2s infinite;
			-webkit-animation: wheel 2s infinite;
		}
	}

	#music {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		position: fixed;
		bottom: 5px;
		left: 5px;
		animation: fadeOut 2s forwards;
		animation-delay: 12s;
		transition: opacity 0.3s;
		cursor: pointer;
		&:hover {
			opacity: 1 !important;
		}
	}

	@keyframes wheel {
		to {
			opacity: 0;
			top: 60px;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
