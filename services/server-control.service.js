import { PI_GATEWAY_URL } from '../config.js';
// ── Stage derivation ────────────────────────────────────────────────────────
export function deriveBootStage(status) {
    if (status.ssh === 'LISTENING' && status.immich === 'RUNNING')
        return 'running';
    if (status.ssh === 'LISTENING')
        return 'ssh';
    if (status.dropbear === 'LISTENING')
        return 'dropbear';
    if (status.mac === 'PRESENT')
        return 'present';
    return 'off';
}
export function stageLabel(stage) {
    switch (stage) {
        case 'off': return 'Off';
        case 'present': return 'Waking…';
        case 'dropbear': return 'Unlocking…';
        case 'ssh': return 'Booting…';
        case 'running': return 'Running';
        case 'unreachable': return 'Not home';
    }
}
export function stageColor(stage) {
    switch (stage) {
        case 'running': return 'green';
        case 'ssh':
        case 'dropbear':
        case 'present': return 'orange';
        case 'off': return 'red';
        case 'unreachable': return 'gray';
    }
}
// ── Status polling ──────────────────────────────────────────────────────────
async function fetchState(endpoint) {
    const res = await fetch(`${PI_GATEWAY_URL}${endpoint}`);
    const data = await res.json();
    return (data.state ?? 'UNKNOWN');
}
export async function fetchServerStatus() {
    const [mac, dropbear, ssh, immich] = await Promise.all([
        fetchState('/api/status/mac'),
        fetchState('/api/status/dropbear'),
        fetchState('/api/status/ssh'),
        fetchState('/api/status/immich'),
    ]);
    return { mac, dropbear, ssh, immich };
}
export async function isPiGatewayReachable() {
    try {
        await fetchState('/api/status/mac');
        return true;
    }
    catch {
        return false;
    }
}
// ── Actions ─────────────────────────────────────────────────────────────────
async function postAction(endpoint, password) {
    const res = await fetch(`${PI_GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(password !== undefined ? { body: JSON.stringify({ password }) } : {}),
    });
    return res.json();
}
export const wake = () => postAction('/api/action/wake');
export const unlock = (pw) => postAction('/api/action/unlock', pw);
export const boot = (pw) => postAction('/api/action/boot', pw);
export const shutdown = (pw) => postAction('/api/action/shutdown', pw);
