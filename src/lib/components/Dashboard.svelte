<script lang="ts">
	import { LogOut, Sparkles } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth';
	import { logoutUser } from '$lib/services/authService';
	import { listenToAssignments } from '$lib/services/assignmentService';
	import type { Assignment } from '$lib/types/assignment';
	import AssignmentForm from '$lib/components/AssignmentForm.svelte';
	import AssignmentCard from '$lib/components/AssignmentCard.svelte';

	let logoutLoading = $state(false);
	let assignments = $state<Assignment[]>([]);
	let listLoading = $state(true);
	let listError = $state('');
	let selectedAssignment = $state<Assignment | null>(null);

	let completedCount = $derived(assignments.filter((assignment) => assignment.completed).length);
	let activeCount = $derived(assignments.length - completedCount);

	$effect(() => {
		const user = $authState.user;

		if (!user) {
			assignments = [];
			listLoading = false;
			return;
		}

		listLoading = true;
		listError = '';

		const unsubscribe = listenToAssignments(
			user.uid,
			(items) => {
				assignments = items;
				listLoading = false;
			},
			(error) => {
				console.error(error);
				listError = 'Could not load your assignments. Check your Firestore rules and connection.';
				listLoading = false;
			}
		);

		return () => {
			unsubscribe();
		};
	});

	async function handleLogout() {
		try {
			logoutLoading = true;
			await logoutUser();
		} finally {
			logoutLoading = false;
		}
	}
</script>

<section class="mx-auto max-w-6xl">
	<header
		class="glass-card flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>

			<h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
				Welcome, {$authState.user?.displayName || $authState.user?.email}
			</h1>

			<p class="mt-2 text-sm text-white/65">
				Track your assignments, deadlines, and progress in one protected workspace.
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

	<div class="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
		{#if $authState.user}
			<AssignmentForm userId={$authState.user.uid} />
		{/if}

		<section class="glass-card rounded-3xl p-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p class="text-sm uppercase tracking-[0.25em] text-cyan-200">Realtime</p>
					<h2 class="mt-3 text-2xl font-bold">Your assignments</h2>
					<p class="mt-2 text-sm leading-6 text-white/60">
						Updates instantly from Firestore. Only your logged-in account can access this list.
					</p>
				</div>

				<div class="grid grid-cols-3 gap-2 text-center">
					<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
						<p class="text-xl font-bold">{assignments.length}</p>
						<p class="text-xs text-white/50">Total</p>
					</div>

					<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
						<p class="text-xl font-bold">{activeCount}</p>
						<p class="text-xs text-white/50">Active</p>
					</div>

					<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
						<p class="text-xl font-bold">{completedCount}</p>
						<p class="text-xs text-white/50">Done</p>
					</div>
				</div>
			</div>

			<div class="mt-6 space-y-4">
				{#if listLoading}
					<div class="rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center">
						<div
							class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10"
						>
							<Sparkles class="h-6 w-6 text-cyan-200" />
						</div>

						<p class="font-semibold">Loading assignments...</p>
						<p class="mt-2 text-sm text-white/50">Getting your realtime StudyFlow list.</p>
					</div>
				{:else if listError}
					<div class="rounded-3xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">
						{listError}
					</div>
				{:else if assignments.length === 0}
					<div class="rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center">
						<p class="text-lg font-semibold">No assignments yet.</p>
						<p class="mt-2 text-sm text-white/55">
							Add your first assignment using the form on the left.
						</p>
					</div>
				{:else}
					{#each assignments as assignment (assignment.id)}
						<AssignmentCard
							{assignment}
							userId={$authState.user?.uid ?? ''}
							onSelect={(clickedAssignment) => {
								selectedAssignment = clickedAssignment;
							}}
						/>
					{/each}
				{/if}
			</div>
		</section>
	</div>

	{#if selectedAssignment}
		<div class="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5 text-cyan-50">
			<p class="font-semibold">Selected assignment: {selectedAssignment.title}</p>
			<p class="mt-1 text-sm text-cyan-50/70">
				The full countdown detail modal will be built in the next issue.
			</p>

			<button
				type="button"
				class="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
				onclick={() => {
					selectedAssignment = null;
				}}
			>
				Close preview
			</button>
		</div>
	{/if}
</section>