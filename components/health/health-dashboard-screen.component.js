import { HealthService } from '../../services/health.service.js';
import { navigate } from '../../router.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import './health-dashboard/health-dashboard.component.js';
export class HealthDashboardScreen extends HTMLElement {
    initialized = false;
    dashboard = null;
    loadSequence = 0;
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            const page = buildSectionPage(this, 'Health', 'health', '#/health');
            this.dashboard = document.createElement('health-dashboard');
            page.content.appendChild(this.dashboard);
            this.wireDashboard();
        }
        void this.loadData();
    }
    wireDashboard() {
        if (!this.dashboard)
            return;
        this.dashboard.addEventListener('health:save-activity', async (event) => {
            const { detail } = event;
            try {
                await HealthService.createActivity(detail);
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to create activity', err);
                this.dashboard?.showError('Failed to save activity.');
            }
        });
        this.dashboard.addEventListener('health:scan-barcode', () => { navigate('#/health/scanner'); });
        this.dashboard.addEventListener('health:search-food', () => { navigate('#/health/food-search'); });
        this.dashboard.addEventListener('health:ai-estimate', () => { navigate('#/health/ai-estimate'); });
    }
    async loadData() {
        if (!this.dashboard)
            return;
        const currentLoad = ++this.loadSequence;
        this.dashboard.showLoading();
        try {
            const today = Temporal.Now.plainDateISO();
            const todayStr = today.toString();
            const weekAgoStr = today.subtract({ days: 6 }).toString();
            const tomorrowStr = today.add({ days: 1 }).toString();
            const [activities, nutritionSummary, weekNutrition] = await Promise.all([
                HealthService.fetchDashboardActivities(),
                HealthService.fetchNutritionSummary(weekAgoStr, tomorrowStr),
                HealthService.fetchNutritionByDateRange(weekAgoStr, tomorrowStr),
            ]);
            if (currentLoad !== this.loadSequence || !this.dashboard)
                return;
            const weekStartStr = this.getStartOfWeek().toString();
            const pastAndTodayActivities = activities.filter((activity) => activity.date <= todayStr);
            const futureActivities = activities.filter((activity) => activity.date > todayStr);
            this.dashboard.weekActivities = pastAndTodayActivities.filter((activity) => activity.date >= weekStartStr);
            this.dashboard.upcomingActivities = futureActivities;
            this.dashboard.allActivities = pastAndTodayActivities;
            this.dashboard.allNutrition = weekNutrition;
            this.dashboard.todayNutrition = weekNutrition.filter((entry) => entry.date.startsWith(todayStr));
            this.dashboard.weekNutritionSummary = nutritionSummary;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
        }
        catch (err) {
            console.error('Failed to load health data', err);
            this.dashboard.showError('Failed to load health data. Is the server running?');
        }
    }
    getStartOfWeek() {
        const today = Temporal.Now.plainDateISO();
        return today.subtract({ days: today.dayOfWeek - 1 });
    }
}
customElements.define('health-dashboard-screen', HealthDashboardScreen);
