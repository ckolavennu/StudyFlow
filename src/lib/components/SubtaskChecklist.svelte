<script lang="ts">
	import { Check, CheckCircle2, Circle, Edit3, ListChecks, Plus, Trash2, X } from 'lucide-svelte';
	import {
		createSubtask,
		deleteSubtask,
		listenToSubtasks,
		updateSubtaskCompletion,
		updateSubtaskTitle
	} from '$lib/services/subtaskService';
	import type { Subtask } from '$lib/types/subtask';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	type Props = {
		userId: string;
		assignmentId: string;
	};

	let { userId, assignmentId }: Props = $props();

	let subtasks = $state<Subtask[]>([]);
	let title = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let errorMessage = $state('');
	let subtaskToConfirm = $state<Subtask | null>(null);
	let confirming = $state(false);

	let editingSubtaskId = $state<string | null>(null);
	let editingTitle = $state('');
	let editingLoading = $state(false);

	let completedCount = $derived(subtasks.filter((subtask) => subtask.completed).length);
	let totalCount = $derived(subtasks.length);
	let progressPercentage = $derived(
		totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
	);

	$effect(() => {
		if (!userId || !assignmentId) {
			subtasks = [];
			loading = false;
			return;
		}

		loading = true;
		errorMessage = '';

		const unsubscribe = listenToSubtasks(
			userId,
			assignmentId,
			(items) => {
				subtasks = items;
				loading = false;
			},
			(error) => {
				console.error(error);
				errorMessage = 'Could not load subtasks.';
				loading = false;
			}
		);

		return () => {
			unsubscribe();
		};
	});

	async function handleAddSubtask(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		if (!title.trim()) {
			errorMessage = 'Please enter a subtask.';
			return;
		}

		try {
			saving = true;
			await createSubtask(userId, assignmentId, { title });
			title = '';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to add subtask.';
		} finally {
			saving = false;
		}
	}

	async function handleToggle(subtask: Subtask) {
		await updateSubtaskCompletion(userId, assignmentId, subtask.id, !subtask.completed);
	}

	function handleDelete(subtask: Subtask) {
		subtaskToConfirm = subtask;
	}

	async function confirmSubtaskAction() {
		if (!subtaskToConfirm) return;

		try {
			confirming = true;
			await deleteSubtask(userId, assignmentId, subtaskToConfirm.id);
			subtaskToConfirm = null;
		} finally {
			confirming = false;
		}
	}

	function startEditing(subtask: Subtask) {
		editingSubtaskId = subtask.id;
		editingTitle = subtask.title;
		errorMessage = '';
	}

	function cancelEditing() {
		editingSubtaskId = null;
		editingTitle = '';
	}

	async function saveEditing(subtask: Subtask) {
		errorMessage = '';

		if (!editingTitle.trim()) {
			errorMessage = 'Subtask title cannot be empty.';
			return;
		}

		try {
			editingLoading = true;
			await updateSubtaskTitle(userId, assignmentId, subtask.id, editingTitle);
			cancelEditing();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to update subtask.';
		} finally {
			editingLoading = false;
		}
	}
</script>

<section class="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<div class="flex items-center gap-3">
				<ListChecks class="h-5 w-5 text-cyan-200" />
				<p class="text-sm uppercase tracking-[0.25em] text-cyan-200">Checklist</p>
			</div>

			<h3 class="mt-3 text-xl font-bold">Subtasks</h3>
			<p class="mt-2 text-sm text-white/55">Break this assignment into smaller steps and tick them off as you go.</p>
		</div>

		<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
			<p class="text-xl font-black">{completedCount}/{totalCount}</p>
			<p class="text-xs text-white/45">Done</p>
		</div>
	</div>

	<div class="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
		<div class="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-400 transition-all duration-500" style={`width: ${progressPercentage}%`}></div>
	</div>

	<p class="mt-2 text-center text-xs font-semibold text-white/55">{progressPercentage}% checklist progress</p>

	<form class="mt-5 flex flex-col gap-3 sm:flex-row" onsubmit={handleAddSubtask}>
		<input class="min-h-12 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60" type="text" placeholder="Add a subtask, e.g. Review Chapter 3" bind:value={title} />
		<button type="submit" disabled={saving} class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
			<Plus class="h-5 w-5" />
			{saving ? 'Adding...' : 'Add'}
		</button>
	</form>

	{#if errorMessage}
		<div class="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{errorMessage}</div>
	{/if}

	<div class="mt-5 space-y-3">
		{#if loading}
			<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/55">Loading subtasks...</div>
		{:else if subtasks.length === 0}
			<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/55">No subtasks yet. Add your first step above.</div>
		{:else}
			{#each subtasks as subtask (subtask.id)}
				<div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					{#if editingSubtaskId === subtask.id}
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<input class="min-h-11 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 text-white outline-none focus:border-cyan-300/60" type="text" bind:value={editingTitle} />
							<div class="flex gap-2">
								<button type="button" disabled={editingLoading} class="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-2 text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-50" aria-label="Save subtask" onclick={() => saveEditing(subtask)}><Check class="h-4 w-4" /></button>
								<button type="button" class="rounded-xl border border-white/15 bg-white/10 p-2 text-white/70 transition hover:bg-white/15" aria-label="Cancel edit" onclick={cancelEditing}><X class="h-4 w-4" /></button>
							</div>
						</div>
					{:else}
						<div class="flex items-center justify-between gap-3">
							<button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" onclick={() => handleToggle(subtask)}>
								{#if subtask.completed}<CheckCircle2 class="h-5 w-5 shrink-0 text-emerald-200" />{:else}<Circle class="h-5 w-5 shrink-0 text-white/55" />{/if}
								<span class={subtask.completed ? 'truncate text-sm text-white/40 line-through' : 'truncate text-sm text-white/80'}>{subtask.title}</span>
							</button>

							<div class="flex gap-2">
								<button type="button" class="rounded-xl border border-white/15 bg-white/10 p-2 text-white/70 transition hover:bg-white/15" aria-label="Edit subtask" onclick={() => startEditing(subtask)}><Edit3 class="h-4 w-4" /></button>
								<button type="button" class="rounded-xl border border-red-300/20 bg-red-500/10 p-2 text-red-100 transition hover:bg-red-500/20" aria-label="Confirm action" onclick={() => handleDelete(subtask)}><Trash2 class="h-4 w-4" /></button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</section>

{#if subtaskToConfirm}
	<ConfirmDialog
		title="Confirm action?"
		message="This checklist item will be cleared from the assignment."
		confirmLabel="Confirm"
		loading={confirming}
		onCancel={() => {
			subtaskToConfirm = null;
		}}
		onConfirm={confirmSubtaskAction}
	/>
{/if}
