<script lang="ts">
	import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-svelte';
	import { loginUser, registerUser } from '$lib/services/authService';
	import { authState } from '$lib/stores/auth';

	let isRegistering = $state(false);
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');

	function getFriendlyError(error: unknown) {
		const code =
			typeof error === 'object' && error !== null && 'code' in error
				? String((error as { code?: unknown }).code)
				: '';

		if (code === 'auth/email-already-in-use') {
			return 'This email is already registered. Try logging in instead.';
		}

		if (code === 'auth/invalid-email') {
			return 'Please enter a valid email address.';
		}

		if (code === 'auth/weak-password') {
			return 'Your password should be at least 6 characters long.';
		}

		if (
			code === 'auth/invalid-credential' ||
			code === 'auth/user-not-found' ||
			code === 'auth/wrong-password'
		) {
			return 'Incorrect email or password.';
		}

		if (code === 'auth/network-request-failed') {
			return 'Network error. Please check your connection and try again.';
		}

		return 'Authentication failed. Please check your details and try again.';
	}

	function resetFormMode(registering: boolean) {
		isRegistering = registering;
		errorMessage = '';
		password = '';
		confirmPassword = '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		const cleanName = name.trim();
		const cleanEmail = email.trim();

		if (!cleanEmail || !password.trim()) {
			errorMessage = 'Please enter your email and password.';
			return;
		}

		if (isRegistering && !cleanName) {
			errorMessage = 'Please enter your name.';
			return;
		}

		if (isRegistering && password.length < 6) {
			errorMessage = 'Your password should be at least 6 characters long.';
			return;
		}

		if (isRegistering && password !== confirmPassword) {
			errorMessage = 'Passwords do not match.';
			return;
		}

		try {
			loading = true;

			const user = isRegistering
				? await registerUser(cleanName, cleanEmail, password)
				: await loginUser(cleanEmail, password);

			authState.set({
				user,
				loading: false
			});
		} catch (error) {
			errorMessage = getFriendlyError(error);
		} finally {
			loading = false;
		}
	}
</script>

<section class="glass-card relative w-full max-w-md overflow-hidden rounded-3xl p-8">
	<div class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl"></div>
	<div class="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

	<div class="relative">
		<div
			class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl"
		>
			<Sparkles class="h-7 w-7 text-cyan-200" />
		</div>

		<div class="mt-6 text-center">
			<p class="text-sm uppercase tracking-[0.35em] text-cyan-200">StudyFlow</p>

			<h1 class="mt-3 text-4xl font-bold tracking-tight">
				{isRegistering ? 'Create account' : 'Welcome back'}
			</h1>

			<p class="mt-3 text-sm leading-6 text-white/65">
				{isRegistering
					? 'Start tracking your assignments, deadlines, and progress in one beautiful workspace.'
					: 'Log in to continue managing your assignments and countdowns.'}
			</p>
		</div>

		<form class="mt-8 space-y-4" onsubmit={handleSubmit}>
			{#if isRegistering}
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-white/75">Name</span>

					<div
						class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
					>
						<UserRound class="h-5 w-5 text-white/50" />

						<input
							class="w-full bg-transparent text-white outline-none placeholder:text-white/35"
							type="text"
							placeholder="Your name"
							bind:value={name}
							autocomplete="name"
						/>
					</div>
				</label>
			{/if}

			<label class="block">
				<span class="mb-2 block text-sm font-medium text-white/75">Email</span>

				<div
					class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
				>
					<Mail class="h-5 w-5 text-white/50" />

					<input
						class="w-full bg-transparent text-white outline-none placeholder:text-white/35"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						autocomplete="email"
					/>
				</div>
			</label>

			<label class="block">
				<span class="mb-2 block text-sm font-medium text-white/75">Password</span>

				<div
					class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
				>
					<LockKeyhole class="h-5 w-5 text-white/50" />

					<input
						class="w-full bg-transparent text-white outline-none placeholder:text-white/35"
						type={showPassword ? 'text' : 'password'}
						placeholder="••••••••"
						bind:value={password}
						autocomplete={isRegistering ? 'new-password' : 'current-password'}
					/>

					<button
						type="button"
						class="text-white/60 transition hover:text-white"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOff class="h-5 w-5" />
						{:else}
							<Eye class="h-5 w-5" />
						{/if}
					</button>
				</div>
			</label>

			{#if isRegistering}
				<label class="block">
					<span class="mb-2 block text-sm font-medium text-white/75">Confirm Password</span>

					<div
						class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 focus-within:border-cyan-300/60"
					>
						<LockKeyhole class="h-5 w-5 text-white/50" />

						<input
							class="w-full bg-transparent text-white outline-none placeholder:text-white/35"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							bind:value={confirmPassword}
							autocomplete="new-password"
						/>
					</div>
				</label>
			{/if}

			{#if errorMessage}
				<div class="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
					{errorMessage}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if loading}
					Please wait...
				{:else}
					{isRegistering ? 'Create my account' : 'Log in'}
				{/if}
			</button>
		</form>

		<div class="mt-6 text-center text-sm text-white/65">
			{#if isRegistering}
				Already have an account?

				<button
					type="button"
					class="font-semibold text-cyan-200 hover:text-cyan-100"
					onclick={() => resetFormMode(false)}
				>
					Log in
				</button>
			{:else}
				New to StudyFlow?

				<button
					type="button"
					class="font-semibold text-cyan-200 hover:text-cyan-100"
					onclick={() => resetFormMode(true)}
				>
					Create an account
				</button>
			{/if}
		</div>
	</div>
</section>