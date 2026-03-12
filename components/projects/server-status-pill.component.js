import styles from './server-status-pill.css' with { type: 'css' };
import { fetchServerStatus, isPiGatewayReachable, deriveBootStage, stageLabel, stageColor, wake, unlock, boot, shutdown, } from '../../services/server-control.service.js';
import { hasStoredCredential, setupCredential, getPassword, clearCredential, isPrfLikelySupported, } from '../../services/server-credential.service.js';
// ── Template ─────────────────────────────────────────────────────────────────
const template = document.createElement('template');
template.innerHTML = `
<button class="pill" aria-label="Server status" aria-haspopup="dialog">
    <span class="dot"></span>
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
            <h3>Biometric Credential</h3>
            <div id="credential-content"></div>
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
    pillLabel;
    actionsEl;
    feedbackEl;
    credentialContent;
    stage = 'unreachable';
    status = null;
    hasCredential = false;
    polling = null;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.adoptedStyleSheets = [styles];
        this.shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.pill = this.shadow.querySelector('.pill');
        this.dot = this.shadow.querySelector('.dot');
        this.pillLabel = this.shadow.querySelector('.pill-label');
        this.dialog = this.shadow.querySelector('dialog');
        this.actionsEl = this.shadow.getElementById('actions');
        this.feedbackEl = this.shadow.getElementById('feedback');
        this.credentialContent = this.shadow.getElementById('credential-content');
        this.pill.addEventListener('click', () => this.openDialog());
        this.shadow.querySelector('.close-btn').addEventListener('click', () => this.dialog.close());
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog)
                this.dialog.close();
        });
        void this.refresh();
        this.polling = setInterval(() => void this.refresh(), 30_000);
    }
    disconnectedCallback() {
        if (this.polling)
            clearInterval(this.polling);
    }
    // ── Poll + update state ───────────────────────────────────────────────────
    async refresh() {
        const reachable = await isPiGatewayReachable();
        if (!reachable) {
            this.applyStage('unreachable', null);
            return;
        }
        const status = await fetchServerStatus().catch(() => null);
        console.log(status);
        if (!status) {
            this.applyStage('unreachable', null);
            return;
        }
        this.applyStage(deriveBootStage(status), status);
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
    async openDialog() {
        this.hasCredential = await hasStoredCredential();
        this.renderDialogContent();
        this.clearFeedback();
        this.dialog.showModal();
    }
    renderDialogContent() {
        this.renderStatusGrid();
        this.renderActions();
        this.renderCredentialSection();
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
        this.actionsEl.innerHTML = '';
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
                this.addActionButton('Decrypt Drive', 'primary', () => this.doUnlock());
                break;
            case 'dropbear':
                this.addActionButton('Boot Ubuntu', 'success', () => this.doBoot());
                break;
            case 'ssh':
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
        this.credentialContent.innerHTML = '';
        if (!isPrfLikelySupported()) {
            const p = document.createElement('p');
            p.className = 'credential-status';
            p.textContent = 'WebAuthn PRF not supported in this browser (needs Chrome 116+ or Safari 17.4+).';
            this.credentialContent.appendChild(p);
            return;
        }
        if (this.hasCredential) {
            const row = document.createElement('div');
            row.className = 'credential-row';
            const status = document.createElement('span');
            status.className = 'credential-status credential-status--set';
            status.textContent = '✓ Biometric credential stored';
            row.appendChild(status);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'action-btn action-btn--danger';
            removeBtn.style.cssText = 'padding:0.3rem 0.75rem;font-size:0.78rem;margin-left:auto';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', async () => {
                await clearCredential();
                this.hasCredential = false;
                this.renderCredentialSection();
                this.showFeedback('Credential removed.', 'ok');
            });
            row.appendChild(removeBtn);
            this.credentialContent.appendChild(row);
        }
        else {
            const row = document.createElement('div');
            row.className = 'credential-row';
            const input = document.createElement('input');
            input.type = 'password';
            input.placeholder = 'Master password';
            row.appendChild(input);
            const setupBtn = document.createElement('button');
            setupBtn.className = 'action-btn action-btn--primary';
            setupBtn.style.cssText = 'padding:0.35rem 0.85rem;font-size:0.85rem;white-space:nowrap';
            setupBtn.textContent = 'Set up';
            setupBtn.addEventListener('click', async () => {
                const pw = input.value.trim();
                if (!pw) {
                    this.showFeedback('Enter the master password first.', 'err');
                    return;
                }
                setupBtn.disabled = true;
                try {
                    await setupCredential(pw);
                    input.value = '';
                    this.hasCredential = true;
                    this.renderCredentialSection();
                    this.showFeedback('Biometric credential set up successfully.', 'ok');
                }
                catch (e) {
                    this.showFeedback(e.message, 'err');
                }
                finally {
                    setupBtn.disabled = false;
                }
            });
            row.appendChild(setupBtn);
            this.credentialContent.appendChild(row);
        }
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
    /**
     * Retrieve password via WebAuthn biometric.
     * Falls back to a null return if no credential is set, showing a prompt to set one up.
     */
    async requirePassword() {
        if (!this.hasCredential) {
            this.showFeedback('No biometric credential set up. Add one below.', 'err');
            return null;
        }
        try {
            return await getPassword();
        }
        catch (e) {
            this.showFeedback(e.message, 'err');
            return null;
        }
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
