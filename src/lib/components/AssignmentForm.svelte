<script lang="ts">
	import { AlignLeft, CalendarClock, Plus, Type } from 'lucide-svelte';
	import { createAssignment } from '$lib/services/assignmentService';

	type Props = {
		userId: string;
	};

	let { userId }: Props = $props();

	let title = $state('');
	let description = $state('');
	let deadline = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errorMessage = '';
		successMessage = '';

		if (!title.trim()) {
			errorMessage = 'Please enter an assignment name.';
			return;
		}

		if (!deadline) {
			errorMessage = 'Please select a deadline.';
			return;
		}

		try {
			loading = true;

			await createAssignment(userId, {
				title,
				description,
				deadline
			});

			title = '';
			description = '';
			deadline = '';
			successMessage = 'Assignment added successfully.';

			setTimeout(() => {
				successMessage = '';
			}, 2200);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to create assignment.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="glass-card rounded-3xl p-6">
	<div>
		<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Create</p>
		<h2 class="mt-3 text-2xl font-bold">New assignment</h2>
		<p class="mt-2 text-sm leading-6 text-white/60">
			Add your assignment details and deadline. StudyFlow will keep it linked only to your
			account.
		</p>
	</div>

	<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
		<label class="block">
			<span class="mb-2 block text-sm font-medium text-white/75">Assignment name</span>

			<div
				class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
			>
				<Type class="h-5 w-5 text-white/50" />

				<input
					class="w-full bg-transparent text-white outline-none placeholder:text-white/35"
					type="text"
					placeholder="e.g. Database Security Lab 4"
					bind:value={title}
				/>
			</div>
		</label>

		<label class="block">
			<span class="mb-2 block text-sm font-medium text-white/75">Description</span>

			<div
				class="flex gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
			>
				<AlignLeft class="mt-1 h-5 w-5 text-white/50" />

				<textarea
					class="min-h-28 w-full resize-none bg-transparent text-white outline-none placeholder:text-white/35"
					placeholder="Short notes, requirements, or submission details..."
					bind:value={description}
				></textarea>
			</div>
		</label>

		<label class="block">
			<span class="mb-2 block text-sm font-medium text-white/75">Deadline</span>

			<div
				class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
			>
				<CalendarClock class="h-5 w-5 text-white/50" />

				<input
					class="w-full bg-transparent text-white outline-none"
					type="datetime-local"
					bind:value={deadline}
				/>
			</div>
		</label>

		{#if errorMessage}
			<div class="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div
				class="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
			>
				{successMessage}
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
		>
			<Plus class="h-5 w-5" />
			{loading ? 'Adding assignment...' : 'Add assignment'}
		</button>
	</form>
</section>