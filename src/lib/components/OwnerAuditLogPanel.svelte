<script lang="ts">
	import { ClipboardList, Clock3, Sparkles } from 'lucide-svelte';
	import type { OwnerAuditLog } from '$lib/types/ownerAuditLog';
	import { listenToOwnerAuditLogs } from '$lib/services/ownerAuditService';

	let logs = $state<OwnerAuditLog[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');

	$effect(() => {
		loading = true;
		errorMessage = '';

		const unsubscribe = listenToOwnerAuditLogs(
			(items) => {
				logs = items;
				loading = false;
			},
			(error) => {
				console.error(error);
				errorMessage = 'Could not load owner activity logs. Check Firestore owner rules.';
				loading = false;
			}
		);

		return () => unsubscribe();
	});

	function formatDate(ms: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(ms));
	}

	function getActionLabel(action: OwnerAuditLog['action']) {
		if (action === 'account_created') return 'Account created';
		if (action === 'account_password_updated') return 'Credential updated';
		if (action === 'account_suspended') return 'Access suspended';
		if (action === 'account_restored') return 'Access restored';
		return 'Owner action';
	}

	function getActionClasses(action: OwnerAuditLog['action']) {
		if (action === 'account_created') return 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100';
		if (action === 'account_password_updated') return 'border-purple-300/25 bg-purple-500/10 text-purple-100';
		if (action === 'account_suspended') return 'border-red-300/25 bg-red-500/10 text-red-100';
		if (action === 'account_restored') return 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100';
		return 'border-white/15 bg-white/10 text-white/70';
	}
</script>

<section class="mt-6 overflow-hidden rounded-3xl border border-white/15 bg-white/10">
	<div class="border-b border-white/10 px-5 py-5">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<ClipboardList class="h-5 w-5 text-cyan-200" />
					<p class="text-sm uppercase tracking-[0.2em] text-cyan-200">Admin activity</p>
				</div>
				<h3 class="mt-2 text-xl font-bold">Owner activity log</h3>
				<p class="mt-1 text-sm text-white/50">Recent owner account-management actions are recorded here.</p>
			</div>
			<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
				<p class="text-2xl font-black">{logs.length}</p>
				<p class="text-xs text-white/45">Recent logs</p>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="px-5 py-8 text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10">
				<Sparkles class="h-6 w-6 text-cyan-200" />
			</div>
			<p class="font-semibold">Loading activity logs...</p>
			<p class="mt-2 text-sm text-white/50">Reading owner audit records from Firestore.</p>
		</div>
	{:else if errorMessage}
		<div class="px-5 py-6 text-red-100">
			<div class="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3">{errorMessage}</div>
		</div>
	{:else if logs.length === 0}
		<div class="px-5 py-8 text-center text-white/55">No owner activity has been logged yet.</div>
	{:else}
		<div class="divide-y divide-white/10">
			{#each logs as log (log.id)}
				<div class="px-5 py-4 transition hover:bg-white/5">
					<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
						<div>
							<div class="flex flex-wrap items-center gap-2">
								<span class={`rounded-full border px-3 py-1 text-xs font-bold ${getActionClasses(log.action)}`}>
									{getActionLabel(log.action)}
								</span>
								<span class="text-xs text-white/35">Target: {log.targetEmail || log.targetName}</span>
							</div>
							<p class="mt-3 font-semibold text-white">{log.message}</p>
							<p class="mt-1 text-xs text-white/45">Performed by {log.actorEmail || log.actorUid}</p>
						</div>
						<div class="flex items-center gap-2 text-sm text-white/45">
							<Clock3 class="h-4 w-4" />
							{formatDate(log.createdAtMs)}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
