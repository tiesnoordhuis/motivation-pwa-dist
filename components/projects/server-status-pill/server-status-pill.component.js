import styles from './server-status-pill.css' with { type: 'css' };
import { fetchServerStatus, isPiGatewayReachable, deriveBootStage, stageLabel, stageColor, wake, unlock, boot, shutdown, } from '../../../services/server-control.service.js';
import { hasStoredCredential, storePassword, getPassword, clearCredential, } from '../../../services/server-credential.service.js';
import { StravaService } from '../../../services/strava.service.js';
// ── Template ─────────────────────────────────────────────────────────────────
const template = document.createElement('template');
template.innerHTML = `
<button class="pill" aria-label="Server status" aria-haspopup="dialog">
    <span class="dot"></span>
    <span class="dot dot--strava" title="Strava"></span>
    <span class="pill-label">…</span>
</button>

<dialog aria-modal="true" aria-labelledby="dialog-title">
    <div class="dialog-header">
        <p class="dialog-title" id="dialog-title">Server</p>
        <button class="close-btn" aria-label="Close">✕</button>
    </div>
    <div class="dialog-body">

        <!-- Status grid -->
        <div class="status-grid" id="status-grid">
            <span class="status-label">Network (MAC)</span>
            <span class="status-badge status-badge--inactive" id="badge-mac">—</span>
            <span class="status-label">Drive (Dropbear)</span>
            <span class="status-badge status-badge--inactive" id="badge-dropbear">—</span>
            <span class="status-label">OS (SSH)</span>
            <span class="status-badge status-badge--inactive" id="badge-ssh">—</span>
            <span class="status-label">Immich</span>
            <span class="status-badge status-badge--inactive" id="badge-immich">—</span>
        </div>

        <!-- Contextual action buttons -->
        <div class="actions" id="actions"></div>

        <!-- Feedback line -->
        <p class="feedback" id="feedback"></p>

        <!-- Credential management -->
        <div class="credential-section" id="credential-section">
            <h3>Password</h3>
            <div id="credential-content"></div>
        </div>

        <!-- Connected Services -->
        <div class="credential-section" id="services-section">
            <h3>Connected Services</h3>
            <div id="services-content"></div>
        </div>

    </div>
</dialog>
`;
// ── Component ─────────────────────────────────────────────────────────────────
export class ServerStatusPill extends HTMLElement {
    shadow;
    dialog;
    pill;
    dot;
    stravaDot;
    pillLabel;
    actionsEl;
    feedbackEl;
    credentialContent;
    servicesContent;
    stage = 'unreachable';
    status = null;
    stravaStatus = { connected: false, last_sync: null };
    hasCredential = false;
    polling = null;
    consecutivePollFailures = 0;
    onHashChange = () => {
        if (this.isPollingActive()) {
            this.schedulePoll(0);
        }
    };
    onVisibilityChange = () => {
        if (this.isPollingActive()) {
            this.schedulePoll(0);
        }
    };
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.adoptedStyleSheets = [styles];
        this.shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.pill = this.shadow.querySelector('.pill');
        this.dot = this.shadow.querySelector('.dot:not(.dot--strava)');
        this.stravaDot = this.shadow.querySelector('.dot--strava');
        this.pillLabel = this.shadow.querySelector('.pill-label');
        this.dialog = this.shadow.querySelector('dialog');
        this.actionsEl = this.shadow.getElementById('actions');
        this.feedbackEl = this.shadow.getElementById('feedback');
        this.credentialContent = this.shadow.getElementById('credential-content');
        this.servicesContent = this.shadow.getElementById('services-content');
        this.pill.addEventListener('click', () => this.openDialog());
        this.shadow.querySelector('.close-btn').addEventListener('click', () => this.dialog.close());
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog)
                this.dialog.close();
        });
        // Listen for Strava OAuth callback events
        window.addEventListener('strava-connected', () => void this.refreshStravaStatus());
        window.addEventListener('strava-connection-failed', () => void this.refreshStravaStatus());
        window.addEventListener('hashchange', this.onHashChange);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.schedulePoll(0);
    }
    disconnectedCallback() {
        if (this.polling)
            clearTimeout(this.polling);
        window.removeEventListener('hashchange', this.onHashChange);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    // ── Poll + update state ───────────────────────────────────────────────────
    isHomeRoute() {
        return window.location.hash === '#/' || window.location.hash === '';
    }
    isPollingActive() {
        if (document.visibilityState !== 'visible')
            return false;
        return (this.dialog?.open ?? false) || this.isHomeRoute();
    }
    schedulePoll(delayMs) {
        if (this.polling)
            clearTimeout(this.polling);
        this.polling = setTimeout(() => {
            void this.pollOnce();
        }, delayMs);
    }
    getBackoffDelay() {
        const baseDelayMs = 30_000;
        const factor = Math.min(4, this.consecutivePollFailures);
        return Math.min(5 * 60_000, baseDelayMs * 2 ** factor);
    }
    async pollOnce() {
        if (!this.isPollingActive()) {
            this.schedulePoll(60_000);
            return;
        }
        const [statusOk, stravaOk] = await Promise.all([
            this.refresh(),
            this.refreshStravaStatus(),
        ]);
        if (statusOk && stravaOk) {
            this.consecutivePollFailures = 0;
            this.schedulePoll(30_000);
            return;
        }
        this.consecutivePollFailures += 1;
        this.schedulePoll(this.getBackoffDelay());
    }
    async refresh() {
        const reachable = await isPiGatewayReachable();
        if (!reachable) {
            this.applyStage('unreachable', null);
            return false;
        }
        const status = await fetchServerStatus().catch(() => null);
        if (!status) {
            this.applyStage('unreachable', null);
            return false;
        }
        this.applyStage(deriveBootStage(status), status);
        return true;
    }
    async refreshStravaStatus() {
        try {
            this.stravaStatus = await StravaService.getStatus();
        }
        catch {
            this.stravaStatus = { connected: false, last_sync: null };
            this.stravaDot.className = 'dot dot--strava dot--gray';
            if (this.dialog.open) {
                this.renderServicesSection();
            }
            return false;
        }
        this.stravaDot.className = `dot dot--strava ${this.stravaStatus.connected ? 'dot--green' : 'dot--gray'}`;
        if (this.dialog.open) {
            this.renderServicesSection();
        }
        return true;
    }
    applyStage(stage, status) {
        this.stage = stage;
        this.status = status;
        // Pill
        const color = stageColor(stage);
        this.dot.className = `dot dot--${color}`;
        this.pillLabel.textContent = stageLabel(stage);
        // If dialog open, live-update it
        if (this.dialog.open) {
            this.renderDialogContent();
        }
    }
    // ── Dialog ────────────────────────────────────────────────────────────────
    openDialog() {
        this.hasCredential = hasStoredCredential();
        this.renderDialogContent();
        this.clearFeedback();
        this.dialog.showModal();
    }
    renderDialogContent() {
        this.renderStatusGrid();
        this.renderActions();
        this.renderCredentialSection();
        this.renderServicesSection();
    }
    renderStatusGrid() {
        const badges = [
            ['badge-mac', this.status?.mac ?? null],
            ['badge-dropbear', this.status?.dropbear ?? null],
            ['badge-ssh', this.status?.ssh ?? null],
            ['badge-immich', this.status?.immich ?? null],
        ];
        const active = ['PRESENT', 'LISTENING', 'RUNNING'];
        for (const [id, state] of badges) {
            const el = this.shadow.getElementById(id);
            const isActive = state !== null && active.includes(state);
            el.textContent = state ?? '—';
            el.className = `status-badge ${isActive ? 'status-badge--active' : 'status-badge--inactive'}`;
        }
    }
    renderActions() {
        this.actionsEl.replaceChildren();
        if (this.stage === 'unreachable') {
            const p = document.createElement('p');
            p.style.cssText = 'margin:0;font-size:0.85rem;opacity:0.5;text-align:center';
            p.textContent = 'Not on home network — Pi gateway unreachable.';
            this.actionsEl.appendChild(p);
            return;
        }
        switch (this.stage) {
            case 'off':
                this.addActionButton('Wake', 'primary', () => this.doWake());
                break;
            case 'present':
                this.addActionButton('Wake', 'primary', () => this.doWake());
                break;
            case 'dropbear':
                this.addActionButton('Decrypt Drive', 'primary', () => this.doUnlock());
                break;
            case 'ssh':
                this.addActionButton('Boot Ubuntu', 'success', () => this.doBoot());
                break;
            case 'running':
                this.addActionButton('Shutdown', 'danger', () => this.doShutdown());
                break;
        }
        // Always allow refresh
        const refreshBtn = this.addActionButton('Refresh Status', 'primary', async () => {
            refreshBtn.disabled = true;
            await this.refresh();
            this.renderDialogContent();
            refreshBtn.disabled = false;
        });
    }
    addActionButton(label, variant, handler) {
        const btn = document.createElement('button');
        btn.className = `action-btn action-btn--${variant}`;
        btn.textContent = label;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                await handler();
            }
            finally {
                btn.disabled = false;
            }
        });
        this.actionsEl.appendChild(btn);
        return btn;
    }
    renderCredentialSection() {
        this.credentialContent.replaceChildren();
        if (this.hasCredential) {
            const row = document.createElement('div');
            row.className = 'credential-row';
            const status = document.createElement('span');
            status.className = 'credential-status credential-status--set';
            status.textContent = '✓ Password saved for this session';
            row.appendChild(status);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'action-btn action-btn--danger';
            removeBtn.style.cssText = 'padding:0.3rem 0.75rem;font-size:0.78rem;margin-left:auto';
            removeBtn.textContent = 'Clear';
            removeBtn.addEventListener('click', () => {
                clearCredential();
                this.hasCredential = false;
                this.renderCredentialSection();
                this.showFeedback('Password cleared.', 'ok');
            });
            row.appendChild(removeBtn);
            this.credentialContent.appendChild(row);
        }
        else {
            const form = document.createElement('form');
            form.className = 'credential-row';
            form.autocomplete = 'on';
            const input = document.createElement('input');
            input.type = 'password';
            input.name = 'password';
            input.autocomplete = 'current-password';
            input.placeholder = 'Master password';
            form.appendChild(input);
            const saveBtn = document.createElement('button');
            saveBtn.type = 'submit';
            saveBtn.className = 'action-btn action-btn--primary';
            saveBtn.style.cssText = 'padding:0.35rem 0.85rem;font-size:0.85rem;white-space:nowrap';
            saveBtn.textContent = 'Save';
            form.appendChild(saveBtn);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const pw = input.value.trim();
                if (!pw) {
                    this.showFeedback('Enter the master password first.', 'err');
                    return;
                }
                storePassword(pw);
                input.value = '';
                this.hasCredential = true;
                this.renderCredentialSection();
                this.showFeedback('Password saved for this session.', 'ok');
            });
            this.credentialContent.appendChild(form);
        }
    }
    // ── Connected Services ──────────────────────────────────────────────────
    renderServicesSection() {
        this.servicesContent.replaceChildren();
        const row = document.createElement('div');
        row.className = 'service-row';
        const left = document.createElement('div');
        left.className = 'service-info';
        const label = document.createElement('span');
        label.className = 'service-name';
        label.textContent = 'Strava';
        left.appendChild(label);
        if (this.stravaStatus.connected) {
            const meta = document.createElement('span');
            meta.className = 'service-meta';
            meta.textContent = this.stravaStatus.last_sync
                ? `Synced ${this.formatRelativeTime(this.stravaStatus.last_sync)}`
                : 'Connected — not yet synced';
            left.appendChild(meta);
        }
        else {
            const meta = document.createElement('span');
            meta.className = 'service-meta';
            meta.textContent = 'Not connected';
            left.appendChild(meta);
        }
        row.appendChild(left);
        const actions = document.createElement('div');
        actions.className = 'service-actions';
        if (this.stravaStatus.connected) {
            const syncBtn = document.createElement('button');
            syncBtn.className = 'action-btn action-btn--primary';
            syncBtn.style.cssText = 'padding:0.3rem 0.75rem;font-size:0.78rem';
            syncBtn.textContent = 'Sync';
            syncBtn.addEventListener('click', async () => {
                syncBtn.disabled = true;
                syncBtn.textContent = 'Syncing…';
                try {
                    const result = await StravaService.sync();
                    this.showFeedback(`Synced ${result.synced} new activities (${result.total} total from Strava)`, 'ok');
                    await this.refreshStravaStatus();
                }
                catch (err) {
                    this.showFeedback(err instanceof Error ? err.message : 'Sync failed', 'err');
                }
                finally {
                    syncBtn.disabled = false;
                    syncBtn.textContent = 'Sync';
                }
            });
            actions.appendChild(syncBtn);
            const disconnectBtn = document.createElement('button');
            disconnectBtn.className = 'action-btn action-btn--danger';
            disconnectBtn.style.cssText = 'padding:0.3rem 0.75rem;font-size:0.78rem';
            disconnectBtn.textContent = 'Disconnect';
            disconnectBtn.addEventListener('click', async () => {
                disconnectBtn.disabled = true;
                try {
                    await StravaService.disconnect();
                    this.showFeedback('Strava disconnected', 'ok');
                    await this.refreshStravaStatus();
                }
                catch {
                    this.showFeedback('Failed to disconnect', 'err');
                }
                finally {
                    disconnectBtn.disabled = false;
                }
            });
            actions.appendChild(disconnectBtn);
        }
        else {
            const connectBtn = document.createElement('button');
            connectBtn.className = 'action-btn action-btn--success';
            connectBtn.style.cssText = 'padding:0.3rem 0.75rem;font-size:0.78rem';
            connectBtn.textContent = 'Connect';
            connectBtn.addEventListener('click', async () => {
                connectBtn.disabled = true;
                connectBtn.textContent = 'Connecting…';
                try {
                    const url = await StravaService.getAuthUrl();
                    window.location.href = url;
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to start Strava auth';
                    this.showFeedback(message, 'err');
                    connectBtn.disabled = false;
                    connectBtn.textContent = 'Connect';
                }
            });
            actions.appendChild(connectBtn);
        }
        row.appendChild(actions);
        this.servicesContent.appendChild(row);
    }
    formatRelativeTime(isoDate) {
        const diff = Date.now() - new Date(isoDate).getTime();
        const minutes = Math.floor(diff / 60_000);
        if (minutes < 1)
            return 'just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
    // ── Actions ───────────────────────────────────────────────────────────────
    async doWake() {
        const result = await wake().catch((e) => ({ success: false, error: e.message }));
        if (result.success) {
            this.showFeedback(result.message ?? 'WoL packet sent. Server waking…', 'ok');
            setTimeout(() => void this.refresh(), 8_000);
        }
        else {
            this.showFeedback(result.error ?? 'Wake failed.', 'err');
        }
    }
    async doUnlock() {
        const pw = await this.requirePassword();
        if (!pw)
            return;
        const result = await unlock(pw).catch((e) => ({ success: false, error: e.message }));
        if (result.success) {
            this.showFeedback(result.message ?? 'Drive decrypted. Booting…', 'ok');
            setTimeout(() => void this.refresh(), 5_000);
        }
        else {
            this.showFeedback(result.error ?? 'Unlock failed.', 'err');
        }
    }
    async doBoot() {
        const pw = await this.requirePassword();
        if (!pw)
            return;
        const result = await boot(pw).catch((e) => ({ success: false, error: e.message }));
        if (result.success) {
            this.showFeedback(result.message ?? 'Boot command sent.', 'ok');
            setTimeout(() => void this.refresh(), 10_000);
        }
        else {
            this.showFeedback(result.error ?? 'Boot failed.', 'err');
        }
    }
    async doShutdown() {
        const pw = await this.requirePassword();
        if (!pw)
            return;
        const result = await shutdown(pw).catch((e) => ({ success: false, error: e.message }));
        if (result.success) {
            this.showFeedback(result.message ?? 'Shutdown initiated.', 'ok');
            setTimeout(() => void this.refresh(), 8_000);
        }
        else {
            this.showFeedback(result.error ?? 'Shutdown failed.', 'err');
        }
    }
    requirePassword() {
        const pw = getPassword();
        if (!pw) {
            this.showFeedback('No password set. Enter it below first.', 'err');
            return null;
        }
        return pw;
    }
    // ── Feedback ──────────────────────────────────────────────────────────────
    showFeedback(message, type) {
        this.feedbackEl.textContent = message;
        this.feedbackEl.className = `feedback feedback--visible feedback--${type}`;
    }
    clearFeedback() {
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';
    }
}
customElements.define('server-status-pill', ServerStatusPill);
