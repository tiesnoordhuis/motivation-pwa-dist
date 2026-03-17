import styles from './health-dashboard.css' with { type: 'css' };
import { ACTIVITY_TYPES } from '@motivation/shared';
import '../health-timeline/health-timeline.component.js';
import '../calorie-trend-chart/calorie-trend-chart.component.js';
import { navigate } from '../../../router.js';
function getStartOfWeek() {
    const today = Temporal.Now.plainDateISO();
    return today.subtract({ days: today.dayOfWeek - 1 });
}
function getEndOfWeek() {
    return getStartOfWeek().add({ days: 6 });
}
function computeStreak(activities) {
    if (activities.length === 0)
        return 0;
    const dates = [...new Set(activities.map(a => a.date.split('T')[0]))].sort().reverse();
    let checkDate = Temporal.Now.plainDateISO();
    if (!dates.includes(checkDate.toString())) {
        checkDate = checkDate.subtract({ days: 1 });
    }
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        if (dates.includes(checkDate.toString())) {
            streak++;
            checkDate = checkDate.subtract({ days: 1 });
        }
        else {
            break;
        }
    }
    return streak;
}
const template = document.createElement('template');
template.innerHTML = `
    <div class="health-dashboard">
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>Loading health data…</div>
        </div>

        <div id="error" class="error-banner" hidden></div>

        <div id="content" hidden>
            <calorie-trend-chart id="calorie-trend-chart"></calorie-trend-chart>
            <health-timeline id="health-timeline"></health-timeline>
        </div>

        <button class="health-fab" id="fab-btn" title="Log">+</button>

        <div class="fab-menu" id="fab-menu" hidden>
            <button class="fab-option" id="fab-scan">📷 Scan Barcode</button>
            <button class="fab-option" id="fab-search">🔍 Search Food</button>
            <button class="fab-option" id="fab-ai">🤖 AI Estimate</button>
            <button class="fab-option" id="fab-activity">🏃 Log Activity</button>
        </div>

        <dialog class="activity-dialog" id="activity-dialog">
            <form method="dialog" id="activity-form">
                <h2>Log Activity</h2>
                <div class="form-group">
                    <label for="act-title">Title</label>
                    <input type="text" id="act-title" required placeholder="e.g. Morning run">
                </div>
                <div class="form-group">
                    <label for="act-type">Type</label>
                    <select id="act-type">
                        ${ACTIVITY_TYPES.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>`).join('\n                        ')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="act-date">Date</label>
                    <input type="date" id="act-date" required>
                </div>
                <div class="form-group">
                    <label for="act-duration">Duration (minutes)</label>
                    <input type="number" id="act-duration" min="1" placeholder="60">
                </div>
                <div class="dialog-actions">
                    <button value="cancel" formnovalidate>Cancel</button>
                    <button value="save" class="btn-primary">Save</button>
                </div>
            </form>
        </dialog>
    </div>
`;
export class HealthDashboard extends HTMLElement {
    _weekActivities = [];
    _upcomingActivities = [];
    _allActivities = [];
    _onSave = null;
    _onScanBarcode = null;
    _onSearchFood = null;
    _onAiEstimate = null;
    _fabMenuOpen = false;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        const timeline = shadow.getElementById('health-timeline');
        timeline.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('timeline-day')) {
                const date = target.dayData?.date;
                if (date) {
                    navigate(`#/health/day/${date}`);
                }
            }
            else if (target.matches('.fab-mini') || target.closest('.fab-mini')) {
                const dayEl = target.closest('timeline-day');
                if (dayEl) {
                    const date = dayEl.dayData?.date;
                    if (date) {
                        this.openManualAddDialog(date);
                    }
                }
            }
        });
        shadow.getElementById('fab-btn').addEventListener('click', () => this.toggleFabMenu());
        shadow.getElementById('fab-scan').addEventListener('click', () => {
            this.closeFabMenu();
            if (this._onScanBarcode)
                this._onScanBarcode();
        });
        shadow.getElementById('fab-search').addEventListener('click', () => {
            this.closeFabMenu();
            if (this._onSearchFood)
                this._onSearchFood();
        });
        shadow.getElementById('fab-ai').addEventListener('click', () => {
            this.closeFabMenu();
            if (this._onAiEstimate)
                this._onAiEstimate();
        });
        shadow.getElementById('fab-activity').addEventListener('click', () => {
            this.closeFabMenu();
            this.openManualAddDialog(Temporal.Now.plainDateISO().toString());
        });
        const form = shadow.getElementById('activity-form');
        const dialog = shadow.getElementById('activity-dialog');
        dialog.addEventListener('close', () => {
            if (dialog.returnValue === 'save' && this._onSave) {
                const title = shadow.getElementById('act-title').value;
                const type = shadow.getElementById('act-type').value;
                const date = shadow.getElementById('act-date').value;
                const durationStr = shadow.getElementById('act-duration').value;
                const duration_minutes = durationStr ? parseInt(durationStr, 10) : undefined;
                if (title && date) {
                    this._onSave({ title, type, date, duration_minutes });
                }
            }
            form.reset();
        });
    }
    openManualAddDialog(dateStr) {
        const shadow = this.shadowRoot;
        const dialog = shadow.getElementById('activity-dialog');
        const dateInput = shadow.getElementById('act-date');
        dateInput.value = dateStr;
        dialog.showModal();
    }
    set onSave(handler) {
        this._onSave = handler;
    }
    set onScanBarcode(handler) {
        this._onScanBarcode = handler;
    }
    set onSearchFood(handler) {
        this._onSearchFood = handler;
    }
    set onAiEstimate(handler) {
        this._onAiEstimate = handler;
    }
    toggleFabMenu() {
        this._fabMenuOpen = !this._fabMenuOpen;
        const shadow = this.shadowRoot;
        shadow.getElementById('fab-menu').hidden = !this._fabMenuOpen;
        shadow.getElementById('fab-btn').textContent = this._fabMenuOpen ? '×' : '+';
    }
    closeFabMenu() {
        this._fabMenuOpen = false;
        const shadow = this.shadowRoot;
        shadow.getElementById('fab-menu').hidden = true;
        shadow.getElementById('fab-btn').textContent = '+';
    }
    showLoading() {
        const shadow = this.shadowRoot;
        shadow.getElementById('loading').hidden = false;
        shadow.getElementById('content').hidden = true;
        shadow.getElementById('error').hidden = true;
    }
    hideLoading() {
        this.shadowRoot.getElementById('loading').hidden = true;
    }
    showError(message) {
        const shadow = this.shadowRoot;
        const el = shadow.getElementById('error');
        el.textContent = message;
        el.hidden = false;
        shadow.getElementById('loading').hidden = true;
    }
    showContent() {
        this.shadowRoot.getElementById('content').hidden = false;
    }
    set weekActivities(activities) {
        // weekActivities are passed via allActivities to timeline
    }
    set upcomingActivities(activities) {
        // Future feature: add upcoming to timeline or handle separately
    }
    set allActivities(activities) {
        this._allActivities = activities;
        const timeline = this.shadowRoot.getElementById('health-timeline');
        if (timeline) {
            timeline.activities = this._allActivities;
        }
        this.updateStats();
    }
    set allNutrition(entries) {
        const timeline = this.shadowRoot.getElementById('health-timeline');
        if (timeline) {
            timeline.nutrition = entries;
        }
    }
    set todayNutrition(entries) {
        // Kept for backward compatibility or future use if needed
    }
    set weekNutritionSummary(summaries) {
        const chart = this.shadowRoot.getElementById('calorie-trend-chart');
        if (chart)
            chart.weekSummary = summaries;
        const timeline = this.shadowRoot.getElementById('health-timeline');
        if (timeline && summaries.length > 0) {
            const activeDays = summaries.filter(s => s.total_calories > 0);
            if (activeDays.length > 0) {
                const total = activeDays.reduce((sum, s) => sum + s.total_calories, 0);
                timeline.avgCalories = total / activeDays.length;
            }
            else {
                timeline.avgCalories = 0;
            }
        }
    }
    updateStats() {
        const shadow = this.shadowRoot;
        const timeline = shadow.getElementById('health-timeline');
        if (timeline) {
            timeline.streak = computeStreak(this._allActivities);
        }
    }
}
customElements.define('health-dashboard', HealthDashboard);
