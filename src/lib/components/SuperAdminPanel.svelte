<script lang="ts">
	import { ShieldCheck, Sparkles, UsersRound } from 'lucide-svelte';
	import type { UserProfile } from '$lib/types/userProfile';
	import { listenToProfiles } from '$lib/services/profileInsightsService';

	let profiles = $state<UserProfile[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');

	let totalUsers = $derived(profiles.length);
	let totalAssignments = $derived(
		profiles.reduce((total, profile) => total + profile.assignmentCount, 0)
	);
	let totalActive = $derived(profiles.reduce((total, profile) => total + profile.activeCount, 0));
	let totalCompleted = $derived(
		profiles.reduce((total, profile) => total + profile.completedCount, 0)
	);
	let totalOverdue = $derived(profiles.reduce((total, profile) => total + profile.overdueCount, 0));

	$effect(() => {
		loading = true;
		errorMessage = '';

		const unsubscribe = listenToProfiles(
			(items) => {
				profiles = items;
				loading = false;
			},
			(error) => {
				console.error(error);
				errorMessage = 'Could not load profile analytics. Check Firestore owner rules.';
				loading = false;
			}
		);

		return () => {
			unsubscribe();
		};
	});

	function formatDate(ms: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(ms));
	}
</script>

<section class="mt-8 rounded-3xl border border-purple-300/25 bg-purple-500/10 p-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<div class="flex items-center gap-3">
				<ShieldCheck class="h-5 w-5 text-purple-200" />
				<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Owner area</p>
			</div>
			<h2 class="mt-3 text-2xl font-bold">User analytics</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-white/60">
				View registered StudyFlow users and their assignment activity from user profile records.
			</p>
		</div>
		<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-300/25 bg-purple-400/10 text-purple-100">
			<UsersRound class="h-7 w-7" />
		</div>
	</div>

	{#if loading}
		<div class="mt-6 rounded-3xl border border-white/15 bg-white/10 px-5 py-8 text-center">
			<div class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10">
				<Sparkles class="h-6 w-6 text-purple-200" />
			</div>
			<p class="font-semibold">Loading user analytics...</p>
			<p class="mt-2 text-sm text-white/50">Reading profile records from Firestore.</p>
		</div>
	{:else if errorMessage}
		<div class="mt-6 rounded-3xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">
			{errorMessage}
		</div>
	{:else}
		<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<div class="rounded-2xl border border-white/15 bg-white/10 p-4">
				<p class="text-sm text-white/50">Users</p>
				<p class="mt-2 text-3xl font-black">{totalUsers}</p>
			</div>
			<div class="rounded-2xl border border-white/15 bg-white/10 p-4">
				<p class="text-sm text-white/50">Assignments</p>
				<p class="mt-2 text-3xl font-black">{totalAssignments}</p>
			</div>
			<div class="rounded-2xl border border-white/15 bg-white/10 p-4">
				<p class="text-sm text-white/50">Active</p>
				<p class="mt-2 text-3xl font-black">{totalActive}</p>
			</div>
			<div class="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
				<p class="text-sm text-emerald-50/60">Completed</p>
				<p class="mt-2 text-3xl font-black">{totalCompleted}</p>
			</div>
			<div class="rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
				<p class="text-sm text-red-50/60">Overdue</p>
				<p class="mt-2 text-3xl font-black">{totalOverdue}</p>
			</div>
		</div>

		<div class="mt-6 overflow-hidden rounded-3xl border border-white/15 bg-white/10">
			<div class="border-b border-white/10 px-5 py-4">
				<h3 class="text-lg font-bold">Registered users</h3>
				<p class="mt-1 text-sm text-white/50">Sorted by latest login.</p>
			</div>

			{#if profiles.length === 0}
				<div class="px-5 py-8 text-center text-white/55">No profile records found yet.</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full min-w-[760px] text-left text-sm">
						<thead class="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-white/45">
							<tr>
								<th class="px-5 py-4 font-semibold">User</th>
								<th class="px-5 py-4 font-semibold">Assignments</th>
								<th class="px-5 py-4 font-semibold">Active</th>
								<th class="px-5 py-4 font-semibold">Completed</th>
								<th class="px-5 py-4 font-semibold">Overdue</th>
								<th class="px-5 py-4 font-semibold">Last login</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/10">
							{#each profiles as profile (profile.uid)}
								<tr class="transition hover:bg-white/5">
									<td class="px-5 py-4">
										<p class="font-bold text-white">{profile.name}</p>
										<p class="mt-1 text-xs text-white/45">{profile.email || 'No email saved'}</p>
									</td>
									<td class="px-5 py-4 font-bold">{profile.assignmentCount}</td>
									<td class="px-5 py-4">{profile.activeCount}</td>
									<td class="px-5 py-4 text-emerald-100">{profile.completedCount}</td>
									<td class="px-5 py-4 text-red-100">{profile.overdueCount}</td>
									<td class="px-5 py-4 text-white/55">{formatDate(profile.lastLoginAtMs)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</section>
