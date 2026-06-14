<script lang="ts">
	import {
		Activity,
		AlertTriangle,
		BarChart3,
		CheckCircle2,
		Search,
		ShieldCheck,
		Sparkles,
		TrendingUp,
		UsersRound
	} from 'lucide-svelte';
	import type { UserProfile } from '$lib/types/userProfile';
	import { listenToProfiles } from '$lib/services/profileInsightsService';

	type SortMode = 'last-login' | 'assignments' | 'overdue' | 'completion';

	let profiles = $state<UserProfile[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let searchTerm = $state('');
	let sortMode = $state<SortMode>('last-login');

	let totalUsers = $derived(profiles.length);
	let totalAssignments = $derived(
		profiles.reduce((total, profile) => total + profile.assignmentCount, 0)
	);
	let totalActive = $derived(profiles.reduce((total, profile) => total + profile.activeCount, 0));
	let totalCompleted = $derived(
		profiles.reduce((total, profile) => total + profile.completedCount, 0)
	);
	let totalOverdue = $derived(profiles.reduce((total, profile) => total + profile.overdueCount, 0));
	let completionRate = $derived(
		totalAssignments === 0 ? 0 : Math.round((totalCompleted / totalAssignments) * 100)
	);
	let overdueRate = $derived(
		totalAssignments === 0 ? 0 : Math.round((totalOverdue / totalAssignments) * 100)
	);
	let averageAssignments = $derived(
		totalUsers === 0 ? '0.0' : (totalAssignments / totalUsers).toFixed(1)
	);
	let mostActiveUser = $derived(
		profiles.length === 0
			? null
			: [...profiles].sort((a, b) => b.assignmentCount - a.assignmentCount)[0]
	);
	let highestRiskUser = $derived(
		profiles.length === 0 ? null : [...profiles].sort((a, b) => b.overdueCount - a.overdueCount)[0]
	);
	let filteredProfiles = $derived(getFilteredProfiles(profiles, searchTerm, sortMode));

	const sortOptions: { label: string; value: SortMode }[] = [
		{ label: 'Latest login', value: 'last-login' },
		{ label: 'Most assignments', value: 'assignments' },
		{ label: 'Most overdue', value: 'overdue' },
		{ label: 'Highest completion', value: 'completion' }
	];

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

	function getCompletionRate(profile: UserProfile) {
		if (profile.assignmentCount === 0) {
			return 0;
		}

		return Math.round((profile.completedCount / profile.assignmentCount) * 100);
	}

	function getFilteredProfiles(items: UserProfile[], query: string, sort: SortMode) {
		const cleanQuery = query.trim().toLowerCase();

		const filtered = cleanQuery
			? items.filter((profile) => {
					return (
						profile.name.toLowerCase().includes(cleanQuery) ||
						profile.email.toLowerCase().includes(cleanQuery)
					);
				})
			: items;

		return [...filtered].sort((a, b) => {
			if (sort === 'assignments') {
				return b.assignmentCount - a.assignmentCount;
			}

			if (sort === 'overdue') {
				return b.overdueCount - a.overdueCount;
			}

			if (sort === 'completion') {
				return getCompletionRate(b) - getCompletionRate(a);
			}

			return b.lastLoginAtMs - a.lastLoginAtMs;
		});
	}

	function formatDate(ms: number) {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(ms));
	}

	function formatRelativeDate(ms: number) {
		const diffMs = Date.now() - ms;
		const minuteMs = 1000 * 60;
		const hourMs = minuteMs * 60;
		const dayMs = hourMs * 24;

		if (diffMs < minuteMs) {
			return 'Just now';
		}

		if (diffMs < hourMs) {
			const minutes = Math.floor(diffMs / minuteMs);
			return `${minutes}m ago`;
		}

		if (diffMs < dayMs) {
			const hours = Math.floor(diffMs / hourMs);
			return `${hours}h ago`;
		}

		const days = Math.floor(diffMs / dayMs);
		return `${days}d ago`;
	}
</script>

<section class="mt-8 overflow-hidden rounded-[2rem] border border-purple-300/25 bg-purple-500/10 p-6 shadow-2xl shadow-purple-950/20">
	<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
		<div>
			<div class="flex items-center gap-3">
				<ShieldCheck class="h-5 w-5 text-purple-200" />
				<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Owner area</p>
			</div>
			<h2 class="mt-3 text-3xl font-black tracking-tight">StudyFlow analytics</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-white/60">
				Monitor registered users, assignment activity, completion health, and overdue workload from one dashboard.
			</p>
		</div>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			<div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
				<p class="text-2xl font-black">{completionRate}%</p>
				<p class="text-xs text-white/45">Completion</p>
			</div>
			<div class="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-center">
				<p class="text-2xl font-black">{overdueRate}%</p>
				<p class="text-xs text-red-50/60">Overdue rate</p>
			</div>
			<div class="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-center sm:col-span-1 col-span-2">
				<p class="text-2xl font-black">{averageAssignments}</p>
				<p class="text-xs text-cyan-50/60">Avg/user</p>
			</div>
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
		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
			<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-white/50">Users</p>
					<UsersRound class="h-5 w-5 text-purple-200" />
				</div>
				<p class="mt-3 text-4xl font-black">{totalUsers}</p>
				<p class="mt-1 text-xs text-white/40">Registered profiles</p>
			</div>

			<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-white/50">Assignments</p>
					<BarChart3 class="h-5 w-5 text-cyan-200" />
				</div>
				<p class="mt-3 text-4xl font-black">{totalAssignments}</p>
				<p class="mt-1 text-xs text-white/40">Across all users</p>
			</div>

			<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-white/50">Active</p>
					<Activity class="h-5 w-5 text-blue-200" />
				</div>
				<p class="mt-3 text-4xl font-black">{totalActive}</p>
				<p class="mt-1 text-xs text-white/40">Still in progress</p>
			</div>

			<div class="rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-emerald-50/60">Completed</p>
					<CheckCircle2 class="h-5 w-5 text-emerald-200" />
				</div>
				<p class="mt-3 text-4xl font-black">{totalCompleted}</p>
				<p class="mt-1 text-xs text-emerald-50/45">Finished work</p>
			</div>

			<div class="rounded-3xl border border-red-300/20 bg-red-500/10 p-5">
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-red-50/60">Overdue</p>
					<AlertTriangle class="h-5 w-5 text-red-200" />
				</div>
				<p class="mt-3 text-4xl font-black">{totalOverdue}</p>
				<p class="mt-1 text-xs text-red-50/45">Needs attention</p>
			</div>
		</div>

		<div class="mt-6 grid gap-4 lg:grid-cols-3">
			<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center gap-3">
					<TrendingUp class="h-5 w-5 text-cyan-200" />
					<p class="text-sm uppercase tracking-[0.2em] text-cyan-200">Most active</p>
				</div>
				<p class="mt-4 text-xl font-black">{mostActiveUser?.name ?? 'No users yet'}</p>
				<p class="mt-1 text-sm text-white/50">{mostActiveUser?.assignmentCount ?? 0} assignments created</p>
			</div>

			<div class="rounded-3xl border border-red-300/20 bg-red-500/10 p-5">
				<div class="flex items-center gap-3">
					<AlertTriangle class="h-5 w-5 text-red-200" />
					<p class="text-sm uppercase tracking-[0.2em] text-red-100">Highest overdue</p>
				</div>
				<p class="mt-4 text-xl font-black">{highestRiskUser?.name ?? 'No users yet'}</p>
				<p class="mt-1 text-sm text-red-50/60">{highestRiskUser?.overdueCount ?? 0} overdue assignments</p>
			</div>

			<div class="rounded-3xl border border-white/15 bg-white/10 p-5">
				<div class="flex items-center gap-3">
					<Activity class="h-5 w-5 text-purple-200" />
					<p class="text-sm uppercase tracking-[0.2em] text-purple-200">Recent activity</p>
				</div>
				<p class="mt-4 text-xl font-black">{profiles[0]?.name ?? 'No activity yet'}</p>
				<p class="mt-1 text-sm text-white/50">
					{profiles[0] ? `${formatRelativeDate(profiles[0].lastLoginAtMs)} login` : 'No recent login'}
				</p>
			</div>
		</div>

		<div class="mt-6 overflow-hidden rounded-3xl border border-white/15 bg-white/10">
			<div class="border-b border-white/10 px-5 py-5">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h3 class="text-xl font-bold">Registered users</h3>
						<p class="mt-1 text-sm text-white/50">
							Showing {filteredProfiles.length} of {profiles.length} users.
						</p>
					</div>

					<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div class="flex min-h-11 items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/40 px-4 focus-within:border-cyan-300/60">
							<Search class="h-4 w-4 text-white/45" />
							<input
								class="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:w-52"
								type="search"
								placeholder="Search users..."
								bind:value={searchTerm}
							/>
						</div>

						<select
							class="min-h-11 rounded-2xl border border-white/15 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-cyan-300/60"
							bind:value={sortMode}
						>
							{#each sortOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			{#if profiles.length === 0}
				<div class="px-5 py-8 text-center text-white/55">No profile records found yet.</div>
			{:else if filteredProfiles.length === 0}
				<div class="px-5 py-8 text-center text-white/55">No users match your search.</div>
			{:else}
				<div class="hidden overflow-x-auto lg:block">
					<table class="w-full min-w-[860px] text-left text-sm">
						<thead class="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-white/45">
							<tr>
								<th class="px-5 py-4 font-semibold">User</th>
								<th class="px-5 py-4 font-semibold">Assignments</th>
								<th class="px-5 py-4 font-semibold">Progress</th>
								<th class="px-5 py-4 font-semibold">Active</th>
								<th class="px-5 py-4 font-semibold">Completed</th>
								<th class="px-5 py-4 font-semibold">Overdue</th>
								<th class="px-5 py-4 font-semibold">Last login</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/10">
							{#each filteredProfiles as profile (profile.uid)}
								<tr class="transition hover:bg-white/5">
									<td class="px-5 py-4">
										<p class="font-bold text-white">{profile.name}</p>
										<p class="mt-1 text-xs text-white/45">{profile.email || 'No email saved'}</p>
									</td>
									<td class="px-5 py-4 font-bold">{profile.assignmentCount}</td>
									<td class="px-5 py-4">
										<div class="flex items-center gap-3">
											<div class="h-2 w-24 overflow-hidden rounded-full bg-white/10">
												<div class="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={`width: ${getCompletionRate(profile)}%`}></div>
											</div>
											<span class="text-xs text-white/55">{getCompletionRate(profile)}%</span>
										</div>
									</td>
									<td class="px-5 py-4">{profile.activeCount}</td>
									<td class="px-5 py-4 text-emerald-100">{profile.completedCount}</td>
									<td class="px-5 py-4 text-red-100">{profile.overdueCount}</td>
									<td class="px-5 py-4">
										<p class="text-white/70">{formatRelativeDate(profile.lastLoginAtMs)}</p>
										<p class="mt-1 text-xs text-white/35">{formatDate(profile.lastLoginAtMs)}</p>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="space-y-3 p-4 lg:hidden">
					{#each filteredProfiles as profile (profile.uid)}
						<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="font-bold text-white">{profile.name}</p>
									<p class="mt-1 text-xs text-white/45">{profile.email || 'No email saved'}</p>
								</div>
								<span class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/60">
									{formatRelativeDate(profile.lastLoginAtMs)}
								</span>
							</div>

							<div class="mt-4 grid grid-cols-4 gap-2 text-center">
								<div class="rounded-xl bg-white/10 px-2 py-2">
									<p class="font-bold">{profile.assignmentCount}</p>
									<p class="text-[0.65rem] text-white/40">Total</p>
								</div>
								<div class="rounded-xl bg-white/10 px-2 py-2">
									<p class="font-bold">{profile.activeCount}</p>
									<p class="text-[0.65rem] text-white/40">Active</p>
								</div>
								<div class="rounded-xl bg-emerald-500/10 px-2 py-2 text-emerald-100">
									<p class="font-bold">{profile.completedCount}</p>
									<p class="text-[0.65rem] text-emerald-50/50">Done</p>
								</div>
								<div class="rounded-xl bg-red-500/10 px-2 py-2 text-red-100">
									<p class="font-bold">{profile.overdueCount}</p>
									<p class="text-[0.65rem] text-red-50/50">Late</p>
								</div>
							</div>

							<div class="mt-4">
								<div class="flex items-center justify-between text-xs text-white/45">
									<span>Completion</span>
									<span>{getCompletionRate(profile)}%</span>
								</div>
								<div class="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
									<div class="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={`width: ${getCompletionRate(profile)}%`}></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>
