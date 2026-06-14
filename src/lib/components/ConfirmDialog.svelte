<script lang="ts">
	import { X } from 'lucide-svelte';

	type Props = {
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		loading?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	};

	let {
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		loading = false,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

<div class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm" role="presentation" onclick={onCancel}>
	<section class="glass-card relative w-full max-w-md overflow-hidden rounded-3xl p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onclick={(event) => event.stopPropagation()}>
		<div class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-400/20 blur-3xl"></div>
		<div class="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

		<div class="relative">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm uppercase tracking-[0.25em] text-red-100/80">Please confirm</p>
					<h2 id="confirm-title" class="mt-2 text-2xl font-bold text-white">{title}</h2>
					<p class="mt-3 text-sm leading-6 text-white/65">{message}</p>
				</div>

				<button type="button" class="rounded-2xl border border-white/15 bg-white/10 p-2 text-white/60 transition hover:bg-white/15 hover:text-white" aria-label="Close dialog" onclick={onCancel}>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button type="button" class="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15" onclick={onCancel} disabled={loading}>
					{cancelLabel}
				</button>

				<button type="button" class="rounded-2xl border border-red-300/30 bg-red-500/20 px-5 py-3 text-sm font-bold text-red-50 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60" onclick={onConfirm} disabled={loading}>
					{loading ? 'Working...' : confirmLabel}
				</button>
			</div>
		</div>
	</section>
</div>
