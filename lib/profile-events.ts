/**
 * Profile changes happen in a Server Action, so Better Auth's client-side
 * broadcast is not triggered. Navbar listens for this event and refetches the
 * session to show the new picture immediately, without a logout or reload.
 */
export const PROFILE_UPDATED_EVENT = "easyrent:profile-updated"

export function notifyProfileUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT))
}
