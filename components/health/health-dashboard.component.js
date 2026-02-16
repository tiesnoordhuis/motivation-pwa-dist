import styles from './health-dashboard.css' with { type: 'css' };
function activityIcon(type) {
    switch (type) {
        case 'gym': return '🏋️';
        case 'tennis': return '🎾';
        case 'ice-skating': return '⛸️';
        case 'running': return '🏃';
        case 'cycling': return '🚴';
        case 'swimming': return '🏊';
        default: return '💪';
    }
}
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function getStartOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(diff);
    return monday;
}
function getEndOfWeek() {
    const start = getStartOfWeek();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}
function computeStreak(activities) {
    if (activities.length === 0)
        return 0;
    // Get unique active dates, sorted descending
    const dates = [...new Set(activities.map(a => a.date.split('T')[0]))].sort().reverse();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);
    // Check if today has activity, if not start from yesterday
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!dates.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
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
        <div class="section-header">
            <button class="back-btn" id="back-btn">←</button>
            <span class="header-icon">🟡</span>
            <h1>Personal Health</h1>
        </div>

        <div id="loading" class="loading">
            <div class="spinner"></div>
            <div>Loading health data…</div>
        </div>

        <div id="error" class="error-banner" style="display:none"></div>

        <div id="content" style="display:none">
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
        </div>

        <button class="health-fab" id="fab-btn" title="Log Activity">+</button>

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
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        // Back button
        shadow.getElementById('back-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('health-navigate-back', {
                bubbles: true, composed: true,
            }));
        });
        // FAB
        shadow.getElementById('fab-btn').addEventListener('click', () => {
            const dialog = shadow.getElementById('activity-dialog');
            const dateInput = shadow.getElementById('act-date');
            dateInput.value = new Date().toISOString().split('T')[0];
            dialog.showModal();
        });
        // Dialog form
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
    showLoading() {
        const shadow = this.shadowRoot;
        shadow.getElementById('loading').style.display = '';
        shadow.getElementById('content').style.display = 'none';
        shadow.getElementById('error').style.display = 'none';
    }
    hideLoading() {
        this.shadowRoot.getElementById('loading').style.display = 'none';
    }
    showError(message) {
        const shadow = this.shadowRoot;
        const el = shadow.getElementById('error');
        el.textContent = message;
        el.style.display = '';
        shadow.getElementById('loading').style.display = 'none';
    }
    showContent() {
        this.shadowRoot.getElementById('content').style.display = '';
    }
    /** Set this week's activities (manual + calendar past) */
    set weekActivities(activities) {
        this._weekActivities = activities;
        this.renderWeekList();
    }
    /** Set upcoming calendar activities */
    set upcomingActivities(activities) {
        this._upcomingActivities = activities;
        this.renderUpcomingList();
    }
    /** Set all activities for streak calculation */
    set allActivities(activities) {
        this._allActivities = activities;
        this.updateStats();
    }
    updateStats() {
        const shadow = this.shadowRoot;
        // Workouts this week
        const weekStart = getStartOfWeek();
        const weekEnd = getEndOfWeek();
        const weekCount = this._weekActivities.filter(a => {
            const d = new Date(a.date);
            return d >= weekStart && d <= weekEnd;
        }).length;
        shadow.getElementById('workouts-count').textContent = String(weekCount);
        // Streak
        const streak = computeStreak(this._allActivities);
        shadow.getElementById('streak-count').textContent = String(streak);
    }
    renderWeekList() {
        const container = this.shadowRoot.getElementById('week-list');
        container.innerHTML = '';
        if (this._weekActivities.length === 0) {
            container.innerHTML = '<div class="empty-state">No activities this week yet. Tap + to log one!</div>';
            return;
        }
        // Sort by date descending
        const sorted = [...this._weekActivities].sort((a, b) => b.date.localeCompare(a.date));
        for (const activity of sorted) {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon">${activityIcon(activity.type)}</div>
                <div class="activity-info">
                    <div class="activity-title">${this.escapeHtml(activity.title)}</div>
                    <div class="activity-meta">${formatDate(activity.date)}${activity.duration_minutes ? ` · ${activity.duration_minutes} min` : ''}</div>
                </div>
                <span class="activity-source">${activity.source}</span>
            `;
            container.appendChild(item);
        }
        this.updateStats();
    }
    renderUpcomingList() {
        const container = this.shadowRoot.getElementById('upcoming-list');
        container.innerHTML = '';
        if (this._upcomingActivities.length === 0) {
            container.innerHTML = '<div class="empty-state">No upcoming workouts scheduled.</div>';
            return;
        }
        // Sort by date ascending (soonest first)
        const sorted = [...this._upcomingActivities].sort((a, b) => a.date.localeCompare(b.date));
        for (const activity of sorted) {
            const date = new Date(activity.date);
            const meta = activity.metadata ? JSON.parse(activity.metadata) : null;
            const startTime = meta?.start ? formatTime(meta.start) : '';
            const item = document.createElement('div');
            item.className = 'upcoming-item';
            item.innerHTML = `
                <div class="upcoming-date">
                    <div class="upcoming-day">${date.getDate()}</div>
                    <div class="upcoming-weekday">${date.toLocaleDateString([], { weekday: 'short' })}</div>
                </div>
                <div class="upcoming-info">
                    <div class="upcoming-title">${activityIcon(activity.type)} ${this.escapeHtml(activity.title)}</div>
                    <div class="upcoming-time">${startTime}${activity.duration_minutes ? ` · ${activity.duration_minutes} min` : ''}</div>
                </div>
            `;
            container.appendChild(item);
        }
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
customElements.define('health-dashboard', HealthDashboard);
