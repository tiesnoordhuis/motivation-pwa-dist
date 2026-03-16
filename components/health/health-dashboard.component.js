import styles from './health-dashboard.css' with { type: 'css' };
import { activityIcon } from './sub/health-utils.js';
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
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-value" id="workouts-count">0</div>
                    <div class="stat-label">Workouts this week</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="streak-count">0</div>
                    <div class="stat-label">Day streak</div>
                </div>
            </div>

            <div>
                <h3 class="subsection-title"><span class="accent-bar"></span> Upcoming Workouts</h3>
                <div class="activity-list" id="upcoming-list"></div>
            </div>

            <div>
                <h3 class="subsection-title"><span class="accent-bar"></span> This Week</h3>
                <div class="activity-list" id="week-list"></div>
            </div>

            <div>
                <h3 class="subsection-title"><span class="accent-bar"></span> Nutrition Today</h3>
                <nutrition-widget id="nutrition-widget"></nutrition-widget>
            </div>
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
                        <option value="workout">Workout</option>
                        <option value="running">Running</option>
                        <option value="cycling">Cycling</option>
                        <option value="swimming">Swimming</option>
                        <option value="gym">Gym</option>
                        <option value="tennis">Tennis</option>
                        <option value="ice-skating">Ice Skating</option>
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
            const dialog = shadow.getElementById('activity-dialog');
            const dateInput = shadow.getElementById('act-date');
            dateInput.value = Temporal.Now.plainDateISO().toString();
            dialog.showModal();
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
        this._weekActivities = activities;
        this.renderWeekList();
    }
    set upcomingActivities(activities) {
        this._upcomingActivities = activities;
        this.renderUpcomingList();
    }
    set allActivities(activities) {
        this._allActivities = activities;
        this.updateStats();
    }
    set todayNutrition(entries) {
        const widget = this.shadowRoot.getElementById('nutrition-widget');
        if (widget)
            widget.todayEntries = entries;
    }
    set weekNutritionSummary(summaries) {
        const widget = this.shadowRoot.getElementById('nutrition-widget');
        if (widget)
            widget.weekSummary = summaries;
    }
    updateStats() {
        const shadow = this.shadowRoot;
        const weekStart = getStartOfWeek();
        const weekEnd = getEndOfWeek();
        const weekCount = this._weekActivities.filter(a => {
            const d = Temporal.PlainDate.from(a.date.split('T')[0]);
            return Temporal.PlainDate.compare(d, weekStart) >= 0 &&
                Temporal.PlainDate.compare(d, weekEnd) <= 0;
        }).length;
        shadow.getElementById('workouts-count').textContent = String(weekCount);
        shadow.getElementById('streak-count').textContent = String(computeStreak(this._allActivities));
    }
    renderWeekList() {
        const container = this.shadowRoot.getElementById('week-list');
        container.replaceChildren();
        if (this._weekActivities.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'No activities this week yet. Tap + to log one!';
            container.appendChild(empty);
            return;
        }
        const sorted = [...this._weekActivities].sort((a, b) => b.date.localeCompare(a.date));
        for (const activity of sorted) {
            const item = document.createElement('health-activity-item');
            container.appendChild(item);
            item.activity = activity;
        }
        this.updateStats();
    }
    renderUpcomingList() {
        const container = this.shadowRoot.getElementById('upcoming-list');
        container.replaceChildren();
        if (this._upcomingActivities.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'No upcoming workouts scheduled.';
            container.appendChild(empty);
            return;
        }
        const sorted = [...this._upcomingActivities].sort((a, b) => a.date.localeCompare(b.date));
        for (const activity of sorted) {
            const item = document.createElement('health-upcoming-item');
            container.appendChild(item);
            item.activity = activity;
        }
    }
}
customElements.define('health-dashboard', HealthDashboard);
