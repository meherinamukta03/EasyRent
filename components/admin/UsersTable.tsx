"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { showError, showSuccess } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  adminSelectClass,
  EmptyState,
  ErrorNotice,
  formatDate,
  getInitials,
  StatusBadge,
} from "@/components/admin/AdminUI"
import { authClient } from "@/lib/auth-client"
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from "@/lib/actions/admin"
import { USER_ROLES, type UserRole } from "@/lib/roles"
import type { AdminUser } from "@/types/admin"

const roleTone = (role: UserRole) =>
  role === "admin" ? "success" : role === "owner" ? "info" : "neutral"

export default function UsersTable() {
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole>("customer")
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const requestRef = useRef(0)

  const loadUsers = useCallback(async (silent = false) => {
    const currentRequest = ++requestRef.current

    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const data = await getAdminUsers()

      if (requestRef.current !== currentRequest) return
      setUsers(data)
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return
      setUsers([])
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load users"
      )
    } finally {
      if (requestRef.current === currentRequest) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch happens on mount; state updates are intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)

    return matchesRole && matchesSearch
  })

  async function handleRoleChange() {
    if (!roleTarget || busyId) return

    setBusyId(roleTarget.id)

    try {
      const message = await updateAdminUserRole(roleTarget.id, pendingRole)

      setUsers((current) =>
        current.map((user) =>
          user.id === roleTarget.id ? { ...user, role: pendingRole } : user
        )
      )
      setRoleTarget(null)
      showSuccess(message)
      void loadUsers(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to change user role"
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget || busyId) return

    setBusyId(deleteTarget.id)

    try {
      const message = await deleteAdminUser(deleteTarget.id)

      // Remove the row immediately, then re-fetch from MongoDB so the table
      // always reflects the server state after a destructive action.
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id))
      setDeleteTarget(null)
      showSuccess(message)
      void loadUsers(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to delete user"
      )
    } finally {
      setBusyId(null)
    }
  }

  function openRoleDialog(user: AdminUser) {
    setPendingRole(user.role)
    setRoleTarget(user)
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorNotice message={error} onRetry={() => void loadUsers()} /> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered users</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review accounts and manage platform roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && !error ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadUsers()}
              disabled={isLoading || Boolean(busyId)}
              title="Reload users from the database"
              className="h-9 gap-1.5 rounded-full border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:px-6">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search users"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
            className={`${adminSelectClass} sm:w-48`}
          >
            <option value="all">All roles</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin text-emerald-600" aria-hidden="true" />
            Loading users…
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wide text-slate-500 uppercase">
                    <TableHead className="px-5 sm:px-6">Name</TableHead>
                    <TableHead className="px-5 sm:px-6">Email</TableHead>
                    <TableHead className="px-5 sm:px-6">Role</TableHead>
                    <TableHead className="px-5 sm:px-6">Registered</TableHead>
                    <TableHead className="px-5 text-right sm:px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isSelf = Boolean(currentUserId && user.id === currentUserId)
                    const isBusy = busyId === user.id

                    return (
                      <TableRow
                        key={user.id}
                        className="border-slate-100 transition hover:bg-emerald-50/40"
                      >
                        <TableCell className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-slate-200">
                              {user.image ? (
                                <AvatarImage src={user.image} alt={user.name} />
                              ) : null}
                              <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                                {getInitials(user.name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-900">
                              {user.name || "Unnamed user"}
                              {isSelf ? (
                                <span className="ml-2 text-[0.65rem] font-bold tracking-wide text-emerald-600 uppercase">
                                  You
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600 sm:px-6">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6">
                          <StatusBadge
                            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            tone={roleTone(user.role)}
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600 sm:px-6">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isBusy || isSelf}
                              title={isSelf ? "You cannot change your own role" : undefined}
                              onClick={() => openRoleDialog(user)}
                              className="text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                            >
                              {isBusy ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                              ) : (
                                <Pencil className="size-4" aria-hidden="true" />
                              )}
                              Change role
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isBusy || isSelf}
                              title={isSelf ? "You cannot delete your own account" : undefined}
                              onClick={() => setDeleteTarget(user)}
                              className="text-red-600 hover:bg-red-50 disabled:opacity-40"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredUsers.map((user) => {
                const isSelf = Boolean(currentUserId && user.id === currentUserId)
                const isBusy = busyId === user.id

                return (
                  <article key={user.id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10 border border-slate-200">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                          {getInitials(user.name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <StatusBadge
                        value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        tone={roleTone(user.role)}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Registered {formatDate(user.createdAt)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy || isSelf}
                        onClick={() => openRoleDialog(user)}
                        className="flex-1 border-emerald-200 text-emerald-700 disabled:opacity-40"
                      >
                        Change role
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy || isSelf}
                        onClick={() => setDeleteTarget(user)}
                        className="flex-1 border-red-200 text-red-600 disabled:opacity-40"
                      >
                        Delete
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Users className="size-7" aria-hidden="true" />}
            title={search || roleFilter !== "all" ? "No matching users" : "No users yet"}
            description={
              search || roleFilter !== "all"
                ? "Try a different search term or role filter."
                : "Registered accounts will appear here once users sign up."
            }
          />
        )}
      </div>

      <Dialog
        open={Boolean(roleTarget)}
        onOpenChange={(open) => {
          if (!open && !busyId) setRoleTarget(null)
        }}
      >
        {roleTarget ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Change user role
              </DialogTitle>
              <DialogDescription>
                Choose the new role for {roleTarget.name || roleTarget.email}.
                This change is saved immediately after you confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label
                htmlFor="admin-role-select"
                className="text-sm font-semibold text-slate-700"
              >
                New role
              </label>
              <select
                id="admin-role-select"
                value={pendingRole}
                onChange={(event) => setPendingRole(event.target.value as UserRole)}
                disabled={Boolean(busyId)}
                className={adminSelectClass}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              {roleTarget.id === currentUserId ? (
                <p className="text-xs font-medium text-red-600">
                  You cannot change your own admin role.
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" disabled={Boolean(busyId)} />}>
                Cancel
              </DialogClose>
              <Button
                type="button"
                onClick={() => void handleRoleChange()}
                disabled={Boolean(busyId) || roleTarget.id === currentUserId}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {busyId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Confirm change
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !busyId) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600">
              <AlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Delete user account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the account and signs out all of its sessions. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteTarget ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              {deleteTarget.name || "Unnamed user"} · {deleteTarget.email}
            </p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busyId)}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={Boolean(busyId)}
              onClick={() => void handleDelete()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {busyId ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete user
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
