<script lang="ts">
	import { Bell, CalendarClock, CheckCircle2, X } from 'lucide-svelte';
	import type { Assignment } from '$lib/types/assignment';
	import {
		getAssignmentNotifications,
		getNotificationSummary,
		type StudyFlowNotification
	} from '$lib/utils/notificationUtils';

	type Props = {
		assignments: Assignment[];
		onSelectAssignment: (assignment: Assignment) => void;
	};

	let { assignments, onSelectAssignment }: Props = $props();
	let open = $state(false);

	let notifications = $derived(getAssignmentNotifications(assignments));
	let summary = $derived(getNotificationSummary(notifications));

	function getToneClasses(tone: StudyFlowNotification['tone']) {
		if (tone === 'danger') {
			return 'border-red-300/30 bg-red-500/10 text-red-100';
		}

		if (tone === 'warning') {
			return 'border-pink-300/30 bg-pink-500/10 text-pink-100';
		}

		if (tone === 'success') {
			return 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100';
		}

		return 'border-cyan-300/30 bg-cyan-500/10 text-cyan-100';
	}

	function openAssignment(notification: StudyFlowNotification) {
		const assignment = assignments.find((item) => item.id === notification.assignmentId);

		if (!assignment) {
			return;
		}

		onSelectAssignment(assignment);
		open = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15"
		onclick={() => {
			open = !open;
		}}
	>
		<Bell class="h-5 w-5 text-cyan-200" />
		<span class="hidden sm:inline">Notifications</span>

		{#if notifications.length > 0}
			<span class="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-purple-400 px-1 text-xs font-black text-slate-950">
				{notifications.length}
			</span>
		{/if}
	</button>

	{#if open}
		<div class="absolute right-0 z-40 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/15 bg-slate-950/95 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm uppercase tracking-[0.25em] text-cyan-200">Reminder center</p>
					<h2 class="mt-2 text-xl font-bold">{summary}</h2>
				</div>

				<button
					type="button"
					class="rounded-2xl border border-white/15 bg-white/10 p-2 text-white/60 transition hover:bg-white/15 hover:text-white"
					aria-label="Close notifications"
					onclick={() => {
						open = false;
					}}
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="mt-4 space-y-3">
				{#if notifications.length === 0}
					<div class="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-4 text-emerald-100">
						<div class="flex items-center gap-3">
							<CheckCircle2 class="h-5 w-5" />
							<div>
								<p class="font-semibold">You're clear for now.</p>
								<p class="mt-1 text-sm text-emerald-50/65">No overdue or upcoming deadlines in the next few days.</p>
							</div>
						</div>
					</div>
				{:else}
					{#each notifications as notification (notification.id)}
						<button
							type="button"
							class={`w-full rounded-2xl border px-4 py-4 text-left transition hover:scale-[1.01] ${getToneClasses(notification.tone)}`}
							onclick={() => openAssignment(notification)}
						>
							<div class="flex items-start gap-3">
								<CalendarClock class="mt-0.5 h-5 w-5 shrink-0" />
								<div>
									<p class="font-bold">{notification.title}</p>
									<p class="mt-1 text-sm opacity-75">{notification.message}</p>
									<p class="mt-2 text-xs font-semibold opacity-60">Click to open countdown</p>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
