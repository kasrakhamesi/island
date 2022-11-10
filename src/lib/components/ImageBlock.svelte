<!-- ImageBlock (custom block type) -->
<script lang="ts">
	import type { CustomBlockComponentProps } from '@portabletext/svelte';
	import { imgUrl } from '../utils/sanityClient';

	// Property custom blocks receive from @portabletext/svelte when redered
	export let portableText: CustomBlockComponentProps<any>;
</script>

<img class="p-2" alt="" src={imgUrl(portableText.value).url()} />
