<script lang="ts">
	import { ShieldCheck, UsersRound } from 'lucide-svelte';
</script>

<section class="mt-8 rounded-3xl border border-purple-300/25 bg-purple-500/10 p-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<div class="flex items-center gap-3">
				<ShieldCheck class="h-5 w-5 text-purple-200" />
				<p class="text-sm uppercase tracking-[0.25em] text-purple-200">Owner area</p>
			</div>
			<h2 class="mt-3 text-2xl font-bold">Owner panel enabled</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-white/60">
				The next step is to load user profile records here and show assignment statistics.
			</p>
		</div>
		<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-300/25 bg-purple-400/10 text-purple-100">
			<UsersRound class="h-7 w-7" />
		</div>
	</div>
</section>
