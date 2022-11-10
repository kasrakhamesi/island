<script>
	export const ssr = false;
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	main {
		flex: 1;
	}
</style>
