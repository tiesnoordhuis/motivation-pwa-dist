/**
 * server-credential.service.ts
 *
 * Stores the Pi gateway master password using WebAuthn PRF:
 * – The plaintext password is NEVER written to storage.
 * – An AES-GCM key is derived from the PRF output (biometric-locked).
 * – Only the AES-GCM ciphertext lives in IndexedDB.
 *
 * Browser support: Chrome/Edge 116+, Safari 17.4+
 */
// ── Constants ────────────────────────────────────────────────────────────────
const DB_NAME = 'motivation-server';
const DB_STORE = 'credentials';
const DB_KEY = 'server-master-pw';
const PRF_INFO = 'motivation-server-pw-v1';
function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
function dbGet(db, key) {
    return new Promise((resolve, reject) => {
        const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
function dbPut(db, key, value) {
    return new Promise((resolve, reject) => {
        const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
function dbDelete(db, key) {
    return new Promise((resolve, reject) => {
        const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
// ── Crypto helpers ───────────────────────────────────────────────────────────
/**
 * Fixed PRF salt: SHA-256 of the constant info string.
 * Must be identical on registration and every subsequent authentication
 * so the same AES-GCM key can always be re-derived.
 */
async function getPrfSalt() {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(PRF_INFO));
}
async function deriveKeyFromPrf(prfOutput) {
    const rawKey = await crypto.subtle.importKey('raw', prfOutput, 'HKDF', false, ['deriveKey']);
    return crypto.subtle.deriveKey({
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32),
        info: new TextEncoder().encode(PRF_INFO),
    }, rawKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
// ── Public API ───────────────────────────────────────────────────────────────
/** Returns false if the browser cannot support WebAuthn PRF (show a fallback UI). */
export function isPrfLikelySupported() {
    return (typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential !== 'undefined' &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function');
}
/** True if an encrypted credential is stored in IndexedDB. */
export async function hasStoredCredential() {
    const db = await openDb();
    const existing = await dbGet(db, DB_KEY);
    return existing !== undefined;
}
/**
 * One-time setup (call while the Motivation backend is reachable).
 * Registers a WebAuthn credential, derives a key from the PRF output,
 * encrypts `password`, and stores the ciphertext in IndexedDB.
 */
export async function setupCredential(password) {
    const salt = await getPrfSalt();
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp: {
                name: 'Motivation',
                id: window.location.hostname,
            },
            user: {
                id: new TextEncoder().encode('server-pw-user'),
                name: 'server-pw-user',
                displayName: 'Server Password',
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 }, // ES256
                { type: 'public-key', alg: -257 }, // RS256
            ],
            authenticatorSelection: {
                userVerification: 'required',
                requireResidentKey: false,
            },
            extensions: {
                prf: { eval: { first: salt } },
            },
        },
    });
    if (!credential)
        throw new Error('WebAuthn registration was cancelled.');
    const prfOutput = credential.getClientExtensionResults()?.prf?.results?.first;
    if (!prfOutput) {
        throw new Error('WebAuthn PRF extension is not available on this browser or authenticator. ' +
            'Try Chrome 116+ or Safari 17.4+ with a platform authenticator.');
    }
    const key = await deriveKeyFromPrf(prfOutput);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(password));
    const db = await openDb();
    await dbPut(db, DB_KEY, {
        credentialId: credential.rawId,
        ciphertext,
        iv: iv.buffer,
    });
}
/**
 * Authenticate with biometrics, decrypt and return the master password.
 * The plaintext string is held only in the JS call stack — never persisted.
 */
export async function getPassword() {
    const db = await openDb();
    const stored = await dbGet(db, DB_KEY);
    if (!stored)
        throw new Error('No stored credential — run setupCredential() first.');
    const salt = await getPrfSalt();
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{ id: stored.credentialId, type: 'public-key' }],
            userVerification: 'required',
            extensions: {
                prf: { eval: { first: salt } },
            },
        },
    });
    if (!assertion)
        throw new Error('WebAuthn authentication was cancelled.');
    const prfOutput = assertion.getClientExtensionResults()?.prf?.results?.first;
    if (!prfOutput)
        throw new Error('PRF output unavailable — credential may not support PRF.');
    const key = await deriveKeyFromPrf(prfOutput);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: stored.iv }, key, stored.ciphertext);
    return new TextDecoder().decode(decrypted);
}
/** Remove the stored credential from IndexedDB. */
export async function clearCredential() {
    const db = await openDb();
    await dbDelete(db, DB_KEY);
}
