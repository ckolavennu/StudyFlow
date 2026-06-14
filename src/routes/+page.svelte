<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import { authState } from '$lib/stores/auth';
</script>

<svelte:head>
	<title>StudyFlow | Assignment Tracker</title>
	<meta
		name="description"
		content="StudyFlow is a multi-user assignment and task tracker with real-time countdowns."
	/>
</svelte:head>

<main class="min-h-screen px-6 py-8">
	{#if $authState.loading}
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
			<div class="glass-card rounded-3xl px-8 py-6 text-center">
				<div
					class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10"
				>
					<Sparkles class="h-6 w-6 text-cyan-200" />
				</div>

				<p class="text-lg font-semibold">Loading StudyFlow...</p>
				<p class="mt-2 text-sm text-white/60">Preparing your workspace.</p>
			</div>
		</div>
	{:else if $authState.user}
		<Dashboard />
	{:else}
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
			<AuthCard />
		</div>
	{/if}
</main>