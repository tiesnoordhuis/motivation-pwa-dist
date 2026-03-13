/**
 * server-credential.service.ts
 *
 * Holds the Pi gateway master password in memory for the browser session.
 * Designed to work with password managers (e.g. Enpass) that autofill
 * a visible <input type="password"> in the component UI.
 *
 * The password lives only in a module-scoped variable — never persisted
 * to disk / IndexedDB / sessionStorage. It is cleared on page unload.
 */
// ── Session store ────────────────────────────────────────────────────────────
let sessionPassword = null;
// ── Public API ───────────────────────────────────────────────────────────────
/** True if a password has been saved for this session. */
export function hasStoredCredential() {
    return sessionPassword !== null;
}
/** Save the password in memory for the duration of this page session. */
export function storePassword(password) {
    sessionPassword = password;
}
/** Return the stored password, or null if none is set. */
export function getPassword() {
    return sessionPassword;
}
/** Clear the in-memory password. */
export function clearCredential() {
    sessionPassword = null;
}
