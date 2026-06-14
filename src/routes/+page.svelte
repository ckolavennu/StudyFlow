<script lang="ts">
	import { authState } from '$lib/stores/auth';
</script>

<svelte:head>
	<title>StudyFlow | Assignment Tracker</title>
	<meta
		name="description"
		content="StudyFlow is a multi-user assignment and task tracker with real-time countdowns."
	/>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-6 py-12">
	{#if $authState.loading}
		<div class="glass-card rounded-3xl px-8 py-6 text-center">
			<p class="text-lg font-semibold">Loading StudyFlow...</p>
			<p class="mt-2 text-sm text-white/60">Preparing your workspace.</p>
		</div>
	{:else if $authState.user}
		<section class="glass-card w-full max-w-4xl rounded-3xl p-8">
			<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>
			<h1 class="mt-4 text-4xl font-bold">Dashboard coming next.</h1>
			<p class="mt-3 text-white/70">
				You are signed in as {$authState.user.email}. Next we will build the protected dashboard,
				logout button, and assignment tracker.
			</p>
		</section>
	{:else}
		<section class="glass-card w-full max-w-md rounded-3xl p-8 text-center">
			<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>
			<h1 class="mt-4 text-4xl font-bold">Welcome back.</h1>
			<p class="mt-3 text-white/70">
				Login and registration card will go here in the next issue.
			</p>
		</section>
	{/if}
</main>