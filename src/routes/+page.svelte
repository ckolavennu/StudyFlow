<script lang="ts">
	import { LogOut, Sparkles } from 'lucide-svelte';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import { authState } from '$lib/stores/auth';
	import { logoutUser } from '$lib/services/authService';

	let logoutLoading = $state(false);

	async function handleLogout() {
		try {
			logoutLoading = true;
			await logoutUser();
		} finally {
			logoutLoading = false;
		}
	}
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
				<div class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10">
					<Sparkles class="h-6 w-6 text-cyan-200" />
				</div>
				<p class="text-lg font-semibold">Loading StudyFlow...</p>
				<p class="mt-2 text-sm text-white/60">Preparing your workspace.</p>
			</div>
		</div>
	{:else if $authState.user}
		<section class="mx-auto max-w-6xl">
			<header class="glass-card flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>
					<h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
						Welcome, {$authState.user.displayName || $authState.user.email}
					</h1>
					<p class="mt-2 text-sm text-white/65">
						Your protected dashboard is active. Assignment tracking comes in Issue 3.
					</p>
				</div>

				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
					onclick={handleLogout}
					disabled={logoutLoading}
				>
					<LogOut class="h-5 w-5" />
					{logoutLoading ? 'Logging out...' : 'Logout'}
				</button>
			</header>

			<div class="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
				<div class="glass-card rounded-3xl p-6">
					<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Next</p>
					<h2 class="mt-3 text-2xl font-bold">Assignment form</h2>
					<p class="mt-3 text-white/65">
						In Issue 3, this card becomes the task creation form with task name, description,
						and deadline picker.
					</p>
				</div>

				<div class="glass-card rounded-3xl p-6">
					<p class="text-sm uppercase tracking-[0.25em] text-cyan-200">Realtime</p>
					<h2 class="mt-3 text-2xl font-bold">Task list</h2>
					<p class="mt-3 text-white/65">
						In Issue 3, this section will listen to Firestore and display only this user’s
						assignments.
					</p>
				</div>
			</div>
		</section>
	{:else}
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
			<AuthCard />
		</div>
	{/if}
</main> 