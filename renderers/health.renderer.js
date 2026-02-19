import { HealthService } from '../services/health.service.js';
export class HealthRenderer {
    container;
    dashboard;
    constructor() {
        this.container = document.getElementById('health-view');
        // Ensure section-page classes are set (HealthRenderer owns innerHTML)
        this.container.classList.add('section-page', 'section-page--health');
        this.container.innerHTML = '';
        // Section header with back button
        const header = document.createElement('div');
        header.className = 'section-page__header';
        const backBtn = document.createElement('button');
        backBtn.className = 'section-back-btn';
        backBtn.setAttribute('aria-label', 'Back');
        backBtn.textContent = '←';
        backBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('section-back', { bubbles: true }));
        });
        const title = document.createElement('h2');
        title.className = 'section-page__title';
        title.textContent = 'Health';
        header.appendChild(backBtn);
        header.appendChild(title);
        this.container.appendChild(header);
        // Content wrapper
        const content = document.createElement('div');
        content.className = 'section-page__content';
        this.container.appendChild(content);
        this.dashboard = document.createElement('health-dashboard');
        content.appendChild(this.dashboard);
        // FAB save handler
        this.dashboard.onSave = async (data) => {
            try {
                await HealthService.createActivity(data);
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to create activity', err);
                this.dashboard.showError('Failed to save activity.');
            }
        };
    }
    async init() {
        await this.loadData();
    }
    async loadData() {
        this.dashboard.showLoading();
        try {
            // Fetch manual activities and calendar activities in parallel
            const [manualActivities, calendarActivities] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchCalendarActivities(14, 30),
            ]);
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            // Split calendar activities into past (this week) and upcoming (future)
            const pastCalendar = calendarActivities.filter(a => a.date <= today);
            const upcomingCalendar = calendarActivities.filter(a => a.date > today);
            // This week's activities = manual + past calendar events from this week
            const weekStart = this.getStartOfWeek();
            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekActivities = [
                ...manualActivities.filter(a => a.date >= weekStartStr),
                ...pastCalendar.filter(a => a.date >= weekStartStr),
            ];
            // All activities for streak (manual + past calendar)
            const allActivities = [...manualActivities, ...pastCalendar];
            this.dashboard.weekActivities = weekActivities;
            this.dashboard.upcomingActivities = upcomingCalendar;
            this.dashboard.allActivities = allActivities;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
        }
        catch (err) {
            console.error('Failed to load health data', err);
            this.dashboard.showError('Failed to load health data. Is the server running?');
        }
    }
    getStartOfWeek() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(diff);
        return monday;
    }
}
