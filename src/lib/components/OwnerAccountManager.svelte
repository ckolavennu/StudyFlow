<script lang="ts">
	import { Check, KeyRound, Plus, RefreshCw, UserRoundX } from 'lucide-svelte';
	import { authState } from '$lib/stores/auth';
	import type { UserProfile } from '$lib/types/userProfile';
	import {
		changeAccountPassword,
		createAccount,
		restoreAccount,
		suspendAccount
	} from '$lib/services/ownerAccountService';

	type Props = {
		profiles: UserProfile[];
	};

	type ProfileWithAccess = UserProfile & {
		disabled?: boolean;
	};

	let { profiles }: Props = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let selectedUid = $state('');
	let newPassword = $state('');
	let creating = $state(false);
	let updatingUid = $state<string | null>(null);
	let successMessage = $state('');
	let errorMessage = $state('');

	let selectedProfile = $derived(profiles.find((profile) => profile.uid === selectedUid) ?? null);
	let userProfiles = $derived(profiles.filter((profile) => profile.role !== 'super-admin'));

	function isCurrentUser(profile: UserProfile) {
		return profile.uid === $authState.user?.uid;
	}

	function isSuspended(profile: UserProfile) {
		return Boolean((profile as ProfileWithAccess).disabled);
	}

	function clearMessages() {
		successMessage = '';
		errorMessage = '';
	}

	async function handleCreateAccount(event: SubmitEvent) {
		event.preventDefault();
		clearMessages();

		if (!name.trim() || !email.trim() || password.length < 6) {
			errorMessage = 'Enter a name, email, and password with at least 6 characters.';
			return;
		}

		try {
			creating = true;
			await createAccount({ name, email, password });
			successMessage = 'Account created successfully.';
			name = '';
			email = '';
			password = '';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not create account.';
		} finally {
			creating = false;
		}
	}

	async function handlePasswordUpdate(event: SubmitEvent) {
		event.preventDefault();
		clearMessages();

		if (!selectedProfile) {
			errorMessage = 'Select a user first.';
			return;
		}

		if (newPassword.length < 6) {
			errorMessage = 'New password must be at least 6 characters.';
			return;
		}

		try {
			updatingUid = selectedProfile.uid;
			await changeAccountPassword(selectedProfile.uid, newPassword);
			successMessage = `Password updated for ${selectedProfile.name}.`;
			newPassword = '';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not update password.';
		} finally {
			updatingUid = null;
		}
	}

	async function handleAccessToggle(profile: UserProfile) {
		clearMessages();

		if (isCurrentUser(profile)) {
			errorMessage = 'You cannot change access for your own owner account here.';
			return;
		}

		try {
			updatingUid = profile.uid;

			if (isSuspended(profile)) {
				await restoreAccount(profile.uid);
				successMessage = `${profile.name} can sign in again.`;
			} else {
				await suspendAccount(profile.uid);
				successMessage = `${profile.name} can no longer sign in.`;
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not update account access.';
		} finally {
			updatingUid = null;
		}
	}
</script>

<section class="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<p class="text-sm uppercase tracking-[0.2em] text-cyan-200">Account management</p>
			<h3 class="mt-2 text-xl font-bold">Create users and manage access</h3>
			<p class="mt-1 text-sm text-white/50">
				Create login accounts, set temporary passwords, and suspend access when needed.
			</p>
		</div>
	</div>

	{#if successMessage}
		<div class="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
			{successMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div class="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
			{errorMessage}
		</div>
	{/if}

	<div class="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
		<form class="rounded-3xl border border-white/10 bg-white/5 p-4" onsubmit={handleCreateAccount}>
			<div class="flex items-center gap-3">
				<Plus class="h-5 w-5 text-cyan-200" />
				<h4 class="font-bold">Add user manually</h4>
			</div>

			<div class="mt-4 grid gap-3">
				<input
					class="min-h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
					type="text"
					placeholder="Full name"
					bind:value={name}
				/>
				<input
					class="min-h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
					type="email"
					placeholder="Email address"
					bind:value={email}
				/>
				<input
					class="min-h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
					type="password"
					placeholder="Temporary password"
					bind:value={password}
				/>
			</div>

			<button
				type="submit"
				disabled={creating}
				class="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-purple-400 px-4 font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
			>
				<Check class="h-4 w-4" />
				{creating ? 'Creating...' : 'Create user'}
			</button>
		</form>

		<form class="rounded-3xl border border-white/10 bg-white/5 p-4" onsubmit={handlePasswordUpdate}>
			<div class="flex items-center gap-3">
				<KeyRound class="h-5 w-5 text-purple-200" />
				<h4 class="font-bold">Set user password</h4>
			</div>

			<div class="mt-4 grid gap-3">
				<select
					class="min-h-11 rounded-2xl border border-white/15 bg-slate-950/70 px-4 text-white outline-none focus:border-cyan-300/60"
					bind:value={selectedUid}
				>
					<option value="">Select a user</option>
					{#each userProfiles as profile (profile.uid)}
						<option value={profile.uid}>{profile.name} — {profile.email}</option>
					{/each}
				</select>

				<input
					class="min-h-11 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
					type="password"
					placeholder="New password"
					bind:value={newPassword}
				/>
			</div>

			<button
				type="submit"
				disabled={!selectedUid || updatingUid === selectedUid}
				class="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-purple-300/25 bg-purple-500/15 px-4 font-bold text-purple-100 transition hover:bg-purple-500/25 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<KeyRound class="h-4 w-4" />
				{updatingUid === selectedUid ? 'Updating...' : 'Update password'}
			</button>
		</form>
	</div>

	<div class="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
		<div class="flex items-center gap-3">
			<UserRoundX class="h-5 w-5 text-red-200" />
			<h4 class="font-bold">User access</h4>
		</div>

		<div class="mt-4 space-y-3">
			{#if userProfiles.length === 0}
				<p class="text-sm text-white/50">No regular users found yet.</p>
			{:else}
				{#each userProfiles as profile (profile.uid)}
					<div class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div class="flex flex-wrap items-center gap-2">
								<p class="font-bold">{profile.name}</p>
								{#if isSuspended(profile)}
									<span class="rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100">Suspended</span>
								{:else}
									<span class="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">Active</span>
								{/if}
							</div>
							<p class="mt-1 text-xs text-white/45">{profile.email}</p>
						</div>

						<button
							type="button"
							disabled={updatingUid === profile.uid}
							class={isSuspended(profile)
								? 'rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60'
								: 'rounded-2xl border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60'}
							onclick={() => handleAccessToggle(profile)}
						>
							{#if updatingUid === profile.uid}
								Updating...
							{:else if isSuspended(profile)}
								Restore access
							{:else}
								Suspend access
							{/if}
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</section>
