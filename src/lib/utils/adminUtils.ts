const superAdminUid = import.meta.env.VITE_SUPERADMIN_UID;

export function isSuperAdmin(userId: string | undefined | null) {
	return Boolean(superAdminUid) && userId === superAdminUid;
}
