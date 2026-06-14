<script lang="ts">
	import { LogOut, Sparkles } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth';
	import { logoutUser } from '$lib/services/authService';
	import { listenToAssignments } from '$lib/services/assignmentService';
	import type { Assignment } from '$lib/types/assignment';
	import AssignmentForm from '$lib/components/AssignmentForm.svelte';
	import AssignmentCard from '$lib/components/AssignmentCard.svelte';
	import CountdownModal from '$lib/components/CountdownModal.svelte';
	import {
		getAssignmentStatus,
		getVisibleAssignments,
		type AssignmentFilter,
		type AssignmentSort
	} from '$lib/utils/assignmentUtils';

	let logoutLoading = $state(false);
	let assignments = $state<Assignment[]>([]);
	let listLoading = $state(true);
	let listError = $state('');
	let selectedAssignment = $state<Assignment | null>(null);
	let activeFilter = $state<AssignmentFilter>('all');
	let sortMode = $state<AssignmentSort>('deadline-asc');

	let completedCount = $derived(assignments.filter((assignment) => assignment.completed).length);
	let activeCount = $derived(assignments.length - completedCount);
	let overdueCount = $derived(
		assignments.filter((assignment) => getAssignmentStatus(assignment) === 'overdue').length
	);
	let visibleAssignments = $derived(getVisibleAssignments(assignments, activeFilter, sortMode));

	const filterOptions: { label: string; value: AssignmentFilter }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'Active', value: 'active' },
		{ label: 'Completed', value: 'completed' },
		{ label: 'Overdue', value: 'overdue' },
		{ label: 'Due soon', value: 'due-soon' }
	];

	const sortOptions: { label: string; value: AssignmentSort }[] = [
		{ label: 'Nearest deadline first', value: 'deadline-asc' },
		{ label: 'Newest first', value: 'created-desc' },
		{ label: 'Oldest first', value: 'created-asc' },
		{ label: 'Completed last', value: 'completed-last' }
	];

	$effect(() => {
		const user = $authState.user;

		if (!user) {
			assignments = [];
			selectedAssignment = null;
			listLoading = false;
			return;
		}

		listLoading = true;
		listError = '';

		const unsubscribe = listenToAssignments(
			user.uid,
			(items) => {
				assignments = items;

				if (selectedAssignment) {
					const updatedSelectedAssignment = items.find((item) => item.id === selectedAssignment?.id);
					selectedAssignment = updatedSelectedAssignment ?? null;
				}

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
	<header class="glass-card flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>
			<h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
				Welcome, {$authState.user?.displayName || $authState.user?.email}
			</h1>
			<p class="mt-2 text-sm text-white/65">Track your assignments, deadlines, and progress in one protected workspace.</p>
		</div>

		<button type="button" class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60" onclick={handleLogout} disabled={logoutLoading}>
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
					<p class="mt-2 text-sm leading-6 text-white/60">Updates instantly from Firestore. Filter, sort, and spot urgent work quickly.</p>
				</div>

				<div class="grid grid-cols-3 gap-2 text-center">
					<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p class="text-xl font-bold">{assignments.length}</p><p class="text-xs text-white/50">Total</p></div>
					<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p class="text-xl font-bold">{activeCount}</p><p class="text-xs text-white/50">Active</p></div>
					<div class="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3"><p class="text-xl font-bold">{overdueCount}</p><p class="text-xs text-red-100/70">Overdue</p></div>
				</div>
			</div>

			<div class="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p class="text-sm font-semibold text-white/75">View controls</p>
						<p class="text-xs text-white/45">Showing {visibleAssignments.length} of {assignments.length} assignments.</p>
					</div>

					<label class="text-sm text-white/60">
						<span class="mb-2 block">Sort by</span>
						<select class="min-h-11 rounded-2xl border border-white/15 bg-slate-950/70 px-4 text-white outline-none focus:border-cyan-300/60" bind:value={sortMode}>
							{#each sortOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="mt-4 flex flex-wrap gap-2">
					{#each filterOptions as option}
						<button type="button" class={activeFilter === option.value ? 'rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20' : 'rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/15 hover:text-white'} onclick={() => { activeFilter = option.value; }}>
							{option.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="mt-6 space-y-4">
				{#if listLoading}
					<div class="rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center">
						<div class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10"><Sparkles class="h-6 w-6 text-cyan-200" /></div>
						<p class="font-semibold">Loading assignments...</p>
						<p class="mt-2 text-sm text-white/50">Getting your realtime StudyFlow list.</p>
					</div>
				{:else if listError}
					<div class="rounded-3xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">{listError}</div>
				{:else if assignments.length === 0}
					<div class="rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center"><p class="text-lg font-semibold">No assignments yet.</p><p class="mt-2 text-sm text-white/55">Add your first assignment using the form on the left.</p></div>
				{:else if visibleAssignments.length === 0}
					<div class="rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center"><p class="text-lg font-semibold">Nothing matches this filter.</p><p class="mt-2 text-sm text-white/55">Try All or change the controls.</p></div>
				{:else}
					{#each visibleAssignments as assignment (assignment.id)}
						<AssignmentCard {assignment} userId={$authState.user?.uid ?? ''} onSelect={(clickedAssignment) => { selectedAssignment = clickedAssignment; }} />
					{/each}
				{/if}
			</div>
		</section>
	</div>

	{#if selectedAssignment && $authState.user}
		<CountdownModal assignment={selectedAssignment} userId={$authState.user.uid} onClose={() => { selectedAssignment = null; }} />
	{/if}
</section>
