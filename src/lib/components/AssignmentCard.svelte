<script lang="ts">
	import { CalendarClock, CheckCircle2, Circle, Trash2 } from 'lucide-svelte';
	import {
		deleteAssignment,
		updateAssignmentCompletion
	} from '$lib/services/assignmentService';
	import type { Assignment } from '$lib/types/assignment';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import {
		getAssignmentBadgeClasses,
		getAssignmentCardClasses,
		getAssignmentStatus,
		getAssignmentStatusLabel
	} from '$lib/utils/assignmentUtils';

	type Props = {
		assignment: Assignment;
		userId: string;
		onSelect?: (assignment: Assignment) => void;
	};

	let { assignment, userId, onSelect }: Props = $props();

	let updating = $state(false);
	let deleting = $state(false);
	let showConfirm = $state(false);

	let status = $derived(getAssignmentStatus(assignment));
	let cardClasses = $derived(getAssignmentCardClasses(assignment));
	let badgeClasses = $derived(getAssignmentBadgeClasses(assignment));
	let statusLabel = $derived(getAssignmentStatusLabel(assignment));

	function formatDeadline(deadlineMs: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(deadlineMs));
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

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		showConfirm = true;
	}

	async function confirmAction() {
		try {
			deleting = true;
			await deleteAssignment(userId, assignment.id);
			showConfirm = false;
		} finally {
			deleting = false;
		}
	}
</script>

<article
	role="button"
	tabindex="0"
	class={cardClasses}
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
				<h3 class={assignment.completed ? 'text-xl font-bold text-white/45 line-through' : 'text-xl font-bold text-white'}>
					{assignment.title}
				</h3>

				<span class={badgeClasses}>{statusLabel}</span>

				{#if status === 'overdue'}
					<span class="rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100">Needs attention</span>
				{:else if status === 'due-today'}
					<span class="rounded-full border border-pink-300/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-100">Final day</span>
				{/if}
			</div>

			<div class="mt-3 flex items-center gap-2 text-sm text-white/60">
				<CalendarClock class="h-4 w-4" />
				<span>{formatDeadline(assignment.deadlineMs)}</span>
			</div>

			{#if assignment.description}
				<p class={assignment.completed ? 'mt-3 line-clamp-2 text-sm leading-6 text-white/35 line-through' : 'mt-3 line-clamp-2 text-sm leading-6 text-white/60'}>
					{assignment.description}
				</p>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-2">
			<button type="button" disabled={updating || deleting} class="rounded-2xl border border-white/15 bg-white/10 p-3 text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label={assignment.completed ? 'Mark as incomplete' : 'Mark as complete'} onclick={handleToggle}>
				{#if assignment.completed}<CheckCircle2 class="h-5 w-5 text-emerald-200" />{:else}<Circle class="h-5 w-5" />{/if}
			</button>

			<button type="button" disabled={updating || deleting} class="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Confirm action" onclick={handleDelete}>
				<Trash2 class="h-5 w-5" />
			</button>
		</div>
	</div>
</article>

{#if showConfirm}
	<ConfirmDialog
		title="Confirm action?"
		message="This item will be cleared from your workspace."
		confirmLabel="Confirm"
		loading={deleting}
		onCancel={() => {
			showConfirm = false;
		}}
		onConfirm={confirmAction}
	/>
{/if}
