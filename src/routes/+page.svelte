<script lang="ts">
	import { CalendarClock, CheckCircle2, ListChecks, LockKeyhole, Sparkles } from 'lucide-svelte';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import { authState } from '$lib/stores/auth';

	const features = [
		{
			icon: CalendarClock,
			title: 'Deadline countdowns',
			description: 'Open any assignment to see a live countdown and journey progress tracker.'
		},
		{
			icon: ListChecks,
			title: 'Subtask checklists',
			description: 'Break assignments into smaller steps and track checklist progress.'
		},
		{
			icon: LockKeyhole,
			title: 'Private workspace',
			description: 'Firebase Authentication keeps each user in their own secure StudyFlow space.'
		}
	];
</script>

<svelte:head>
	<title>StudyFlow | Assignment Tracker</title>
	<meta
		name="description"
		content="StudyFlow is a multi-user assignment and task tracker with real-time countdowns, subtasks, and secure Firebase accounts."
	/>
</svelte:head>

<main class="min-h-screen px-6 py-8">
	{#if $authState.loading}
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
			<div class="glass-card rounded-3xl px-8 py-6 text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/10">
					<Sparkles class="h-6 w-6 text-cyan-200" />
				</div>
				<p class="text-lg font-semibold">Loading StudyFlow...</p>
				<p class="mt-2 text-sm text-white/60">Preparing your workspace.</p>
			</div>
		</div>
	{:else if $authState.user}
		<Dashboard />
	{:else}
		<section class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
			<div>
				<div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
					<Sparkles class="h-4 w-4" />
					Modern assignment planning for students
				</div>

				<h1 class="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
					Study smarter with a planner that feels alive.
				</h1>

				<p class="mt-5 max-w-2xl text-lg leading-8 text-white/65">
					StudyFlow turns assignments into clear countdowns, progress bars, and checklists so deadlines feel easier to manage.
				</p>

				<div class="mt-8 grid gap-4 sm:grid-cols-3">
					<div class="glass-card rounded-3xl p-5">
						<p class="text-3xl font-black">Live</p>
						<p class="mt-1 text-sm text-white/55">Realtime Firestore updates</p>
					</div>
					<div class="glass-card rounded-3xl p-5">
						<p class="text-3xl font-black">Secure</p>
						<p class="mt-1 text-sm text-white/55">User-specific data paths</p>
					</div>
					<div class="glass-card rounded-3xl p-5">
						<p class="text-3xl font-black">Clear</p>
						<p class="mt-1 text-sm text-white/55">Filters, urgency, and progress</p>
					</div>
				</div>

				<div class="mt-8 grid gap-4">
					{#each features as feature}
						<div class="glass-card flex gap-4 rounded-3xl p-5">
							<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200">
								<svelte:component this={feature.icon} class="h-5 w-5" />
							</div>
							<div>
								<h2 class="font-bold">{feature.title}</h2>
								<p class="mt-1 text-sm leading-6 text-white/55">{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="lg:justify-self-end">
				<AuthCard />
			</div>
		</section>

		<footer class="mx-auto mt-10 max-w-6xl pb-4 text-center text-sm text-white/40">
			Built with SvelteKit, Tailwind CSS, Firebase Authentication, Firestore, and Vercel.
		</footer>
	{/if}
</main>
