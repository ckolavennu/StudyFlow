<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="gradient-bg min-h-screen text-white">
	{@render children()}
</div>