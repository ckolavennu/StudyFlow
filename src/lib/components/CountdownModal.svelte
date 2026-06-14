<script lang="ts">
	import { CalendarClock, Clock3, Edit3, Save, Sparkles, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { Assignment } from '$lib/types/assignment';
	import SubtaskChecklist from '$lib/components/SubtaskChecklist.svelte';
	import { updateAssignmentDetails } from '$lib/services/assignmentService';

	type Props = {
		assignment: Assignment;
		userId: string;
		onClose: () => void;
	};

	let { assignment, userId, onClose }: Props = $props();

	let now = $state(Date.now());
	let isEditing = $state(false);
	let editTitle = $state(assignment.title);
	let editDescription = $state(assignment.description);
	let editDeadline = $state('');
	let editLoading = $state(false);
	let editError = $state('');

	const secondMs = 1000;
	const minuteMs = secondMs * 60;
	const hourMs = minuteMs * 60;
	const dayMs = hourMs * 24;

	let remainingMs = $derived(Math.max(assignment.deadlineMs - now, 0));
	let totalJourneyMs = $derived(Math.max(assignment.deadlineMs - assignment.createdAtMs, 1));
	let elapsedJourneyMs = $derived(Math.max(now - assignment.createdAtMs, 0));
	let progressPercentage = $derived(
		Math.min(Math.max((elapsedJourneyMs / totalJourneyMs) * 100, 0), 100)
	);
	let days = $derived(Math.floor(remainingMs / dayMs));
	let hours = $derived(Math.floor((remainingMs % dayMs) / hourMs));
	let minutes = $derived(Math.floor((remainingMs % hourMs) / minuteMs));
	let seconds = $derived(Math.floor((remainingMs % minuteMs) / secondMs));
	let daysElapsed = $derived(Math.max(Math.floor(elapsedJourneyMs / dayMs), 0));
	let daysRemaining = $derived(Math.max(Math.ceil(remainingMs / dayMs), 0));
	let isOverdue = $derived(now > assignment.deadlineMs && !assignment.completed);

	function formatNumber(value: number) {
		return String(value).padStart(2, '0');
	}

	function formatDeadline(deadlineMs: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'full',
			timeStyle: 'short'
		}).format(new Date(deadlineMs));
	}

	function toDatetimeLocalValue(ms: number) {
		const date = new Date(ms);
		const offsetMs = date.getTimezoneOffset() * 60 * 1000;
		return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
	}

	function startEditingAssignment() {
		editTitle = assignment.title;
		editDescription = assignment.description;
		editDeadline = toDatetimeLocalValue(assignment.deadlineMs);
		editError = '';
		isEditing = true;
	}

	function cancelEditingAssignment() {
		isEditing = false;
		editError = '';
	}

	async function saveAssignmentEdits() {
		editError = '';

		if (!editTitle.trim()) {
			editError = 'Assignment title cannot be empty.';
			return;
		}

		if (!editDeadline) {
			editError = 'Please select a deadline.';
			return;
		}

		try {
			editLoading = true;
			await updateAssignmentDetails(userId, assignment.id, {
				title: editTitle,
				description: editDescription,
				deadline: editDeadline
			});
			isEditing = false;
		} catch (error) {
			editError = error instanceof Error ? error.message : 'Failed to update assignment.';
		} finally {
			editLoading = false;
		}
	}

	onMount(() => {
		const interval = window.setInterval(() => {
			now = Date.now();
		}, 1000);

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
		}

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.clearInterval(interval);
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
	role="presentation"
	onclick={onClose}
>
	<section
		role="dialog"
		aria-modal="true"
		aria-labelledby="countdown-title"
		class="glass-card relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] p-6 sm:p-8"
		onclick={(event) => event.stopPropagation()}
	>
		<div class="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"></div>
		<div class="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl"></div>

		<div class="relative">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
					<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl">
						<Sparkles class="h-7 w-7 text-cyan-200" />
					</div>

					<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">Assignment countdown</p>

					{#if isEditing}
						<div class="mt-4 space-y-4">
							<label class="block">
								<span class="mb-2 block text-sm font-medium text-white/70">Assignment title</span>
								<input
									id="countdown-title"
									class="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
									type="text"
									bind:value={editTitle}
								/>
							</label>

							<label class="block">
								<span class="mb-2 block text-sm font-medium text-white/70">Deadline</span>
								<input
									class="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-300/60"
									type="datetime-local"
									bind:value={editDeadline}
								/>
							</label>
						</div>
					{:else}
						<h2 id="countdown-title" class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
							{assignment.title}
						</h2>
						<p class="mt-3 text-white/65">The countdown to freedom begins now.</p>
					{/if}
				</div>

				<div class="flex gap-2">
					{#if isEditing}
						<button type="button" disabled={editLoading} class="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-50" aria-label="Save assignment edits" onclick={saveAssignmentEdits}>
							<Save class="h-5 w-5" />
						</button>
						<button type="button" class="rounded-2xl border border-white/20 bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Cancel assignment edit" onclick={cancelEditingAssignment}>
							<X class="h-5 w-5" />
						</button>
					{:else}
						<button type="button" class="rounded-2xl border border-white/20 bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Edit assignment" onclick={startEditingAssignment}>
							<Edit3 class="h-5 w-5" />
						</button>
						<button type="button" class="rounded-2xl border border-white/20 bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white" aria-label="Close countdown modal" onclick={onClose}>
							<X class="h-5 w-5" />
						</button>
					{/if}
				</div>
			</div>

			{#if editError}
				<div class="mt-6 rounded-3xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">{editError}</div>
			{/if}

			{#if assignment.completed}
				<div class="mt-6 rounded-3xl border border-emerald-300/30 bg-emerald-500/10 px-5 py-4 text-emerald-100">This assignment is marked as complete.</div>
			{:else if isOverdue}
				<div class="mt-6 rounded-3xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">This assignment is overdue.</div>
			{/if}

			<div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each [{ label: 'Days', value: days }, { label: 'Hours', value: hours }, { label: 'Minutes', value: minutes }, { label: 'Seconds', value: seconds }] as item}
					<div class="rounded-3xl border border-white/15 bg-white/10 p-5 text-center">
						<p class="text-4xl font-black tracking-tight sm:text-5xl">{formatNumber(item.value)}</p>
						<p class="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">{item.label}</p>
					</div>
				{/each}
			</div>

			<div class="mt-8 rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Journey progress</p>
						<h3 class="mt-2 text-xl font-bold">Time elapsed</h3>
					</div>
					<Clock3 class="h-6 w-6 text-white/45" />
				</div>
				<div class="mt-5 h-4 overflow-hidden rounded-full bg-white/10">
					<div class="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 shadow-lg shadow-cyan-400/20 transition-all duration-500" style={`width: ${progressPercentage}%`}></div>
				</div>
				<p class="mt-3 text-center text-sm font-semibold text-white/70">{progressPercentage.toFixed(1)}%</p>
			</div>

			<div class="mt-5 grid gap-4 sm:grid-cols-2">
				<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
					<p class="text-sm text-white/50">Days Elapsed</p>
					<p class="mt-2 text-4xl font-black">{daysElapsed}</p>
				</div>
				<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
					<p class="text-sm text-white/50">Days Remaining</p>
					<p class="mt-2 text-4xl font-black">{daysRemaining}</p>
				</div>
			</div>

			<SubtaskChecklist userId={userId} assignmentId={assignment.id} />

			<footer class="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center gap-3 text-white/75">
					<CalendarClock class="h-5 w-5 text-cyan-200" />
					<p class="font-semibold">Target deadline: {formatDeadline(assignment.deadlineMs)}</p>
				</div>
				<div class="mt-5 border-t border-white/10 pt-5">
					<p class="text-sm uppercase tracking-[0.25em] text-white/40">Description</p>
					{#if isEditing}
						<textarea class="mt-3 min-h-28 w-full resize-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60" placeholder="Update assignment description..." bind:value={editDescription}></textarea>
					{:else if assignment.description}
						<p class="mt-3 whitespace-pre-wrap leading-7 text-white/70">{assignment.description}</p>
					{:else}
						<p class="mt-3 leading-7 text-white/45">No description added for this assignment.</p>
					{/if}
				</div>
			</footer>
		</div>
	</section>
</div>
