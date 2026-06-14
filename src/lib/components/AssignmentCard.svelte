<script lang="ts">
	import { CalendarClock, CheckCircle2, Circle, Trash2 } from 'lucide-svelte';
	import {
		deleteAssignment,
		updateAssignmentCompletion
	} from '$lib/services/assignmentService';
	import type { Assignment } from '$lib/types/assignment';

	type Props = {
		assignment: Assignment;
		userId: string;
		onSelect?: (assignment: Assignment) => void;
	};

	let { assignment, userId, onSelect }: Props = $props();

	let updating = $state(false);
	let deleting = $state(false);

	function formatDeadline(deadlineMs: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(deadlineMs));
	}

	function getDeadlineLabel(deadlineMs: number) {
		const diffMs = deadlineMs - Date.now();
		const dayMs = 1000 * 60 * 60 * 24;

		if (assignment.completed) {
			return 'Completed';
		}

		if (diffMs < 0) {
			return 'Overdue';
		}

		const days = Math.ceil(diffMs / dayMs);

		if (days === 0) {
			return 'Due today';
		}

		if (days === 1) {
			return '1 day left';
		}

		return `${days} days left`;
	}

	async function handleToggle(event: MouseEvent) {
		event.stopPropagation();

		try {
			updating = true;
			await updateAssignmentCompletion(userId, assignment.id, !assignment.completed);
		} finally {
			updating = false;
		}
	}

	async function handleDelete(event: MouseEvent) {
		event.stopPropagation();

		const confirmed = window.confirm(`Delete "${assignment.title}"?`);

		if (!confirmed) {
			return;
		}

		try {
			deleting = true;
			await deleteAssignment(userId, assignment.id);
		} finally {
			deleting = false;
		}
	}
</script>

<article
	role="button"
	tabindex="0"
	class="glass-card group cursor-pointer rounded-3xl p-5 transition hover:-translate-y-1 hover:bg-white/15"
	onclick={() => onSelect?.(assignment)}
	onkeydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelect?.(assignment);
		}
	}}
>
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<h3
					class={assignment.completed
						? 'text-xl font-bold text-white/45 line-through'
						: 'text-xl font-bold text-white'}
				>
					{assignment.title}
				</h3>

				<span
					class={assignment.completed
						? 'rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100'
						: 'rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100'}
				>
					{getDeadlineLabel(assignment.deadlineMs)}
				</span>
			</div>

			<div class="mt-3 flex items-center gap-2 text-sm text-white/60">
				<CalendarClock class="h-4 w-4" />
				<span>{formatDeadline(assignment.deadlineMs)}</span>
			</div>

			{#if assignment.description}
				<p
					class={assignment.completed
						? 'mt-3 line-clamp-2 text-sm leading-6 text-white/35 line-through'
						: 'mt-3 line-clamp-2 text-sm leading-6 text-white/60'}
				>
					{assignment.description}
				</p>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				disabled={updating || deleting}
				class="rounded-2xl border border-white/15 bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
				aria-label={assignment.completed ? 'Mark as incomplete' : 'Mark as complete'}
				onclick={handleToggle}
			>
				{#if assignment.completed}
					<CheckCircle2 class="h-5 w-5 text-emerald-200" />
				{:else}
					<Circle class="h-5 w-5" />
				{/if}
			</button>

			<button
				type="button"
				disabled={updating || deleting}
				class="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
				aria-label="Delete assignment"
				onclick={handleDelete}
			>
				<Trash2 class="h-5 w-5" />
			</button>
		</div>
	</div>
</article>