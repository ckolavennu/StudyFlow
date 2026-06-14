<script lang="ts">
	import { Check, Edit3, X } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth';
	import { updateCurrentUserName } from '$lib/services/authService';

	let editing = $state(false);
	let name = $state('');
	let saving = $state(false);
	let errorMessage = $state('');

	function getCurrentName() {
		return $authState.user?.displayName || $authState.user?.email?.split('@')[0] || '';
	}

	function startEditing() {
		name = getCurrentName();
		errorMessage = '';
		editing = true;
	}

	function cancelEditing() {
		editing = false;
		errorMessage = '';
		name = '';
	}

	async function saveName() {
		errorMessage = '';

		if (!name.trim()) {
			errorMessage = 'Name cannot be empty.';
			return;
		}

		try {
			saving = true;
			const user = await updateCurrentUserName(name);
			authState.set({ user, loading: false });
			cancelEditing();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not update your name.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
	{#if editing}
		<label class="block">
			<span class="mb-2 block text-sm font-medium text-white/65">Display name</span>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<input
					class="min-h-11 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
					type="text"
					placeholder="Enter your name"
					bind:value={name}
				/>

				<div class="flex gap-2">
					<button
						type="button"
						disabled={saving}
						class="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-50"
						onclick={saveName}
					>
						<Check class="h-4 w-4" />
						{saving ? 'Saving...' : 'Save'}
					</button>

					<button
						type="button"
						class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/15 hover:text-white"
						onclick={cancelEditing}
					>
						<X class="h-4 w-4" />
						Cancel
					</button>
				</div>
			</div>
		</label>
	{:else}
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-semibold text-white/70">Profile name</p>
				<p class="mt-1 text-sm text-white/45">This name appears in your dashboard and profile record.</p>
			</div>

			<button
				type="button"
				class="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
				onclick={startEditing}
			>
				<Edit3 class="h-4 w-4" />
				Edit name
			</button>
		</div>
	{/if}

	{#if errorMessage}
		<div class="mt-3 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
			{errorMessage}
		</div>
	{/if}
</div>
