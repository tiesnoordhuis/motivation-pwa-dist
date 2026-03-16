import { HealthService } from '../../services/health.service.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
export class HealthRenderer {
    content;
    dashboard;
    loadSequence = 0;
    constructor() {
        const container = document.getElementById('health-view');
        const page = buildSectionPage(container, 'Health', 'health', '#/health');
        this.content = page.content;
        this.dashboard = document.createElement('health-dashboard');
        this.content.appendChild(this.dashboard);
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
        this.dashboard.onScanBarcode = () => { window.location.hash = '#/health/scanner'; };
        this.dashboard.onSearchFood = () => { window.location.hash = '#/health/food-search'; };
        this.dashboard.onAiEstimate = () => { window.location.hash = '#/health/ai-estimate'; };
    }
    showDashboard() {
        this.cleanUpSubViews();
        this.dashboard.hidden = false;
    }
    showScanner() {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const scanner = document.createElement('barcode-scanner');
        const foodLog = document.createElement('food-log');
        foodLog.hidden = true;
        scanner.onBarcodeDetected = async (barcode) => {
            scanner.hidden = true;
            foodLog.hidden = false;
            await foodLog.lookupBarcode(barcode);
        };
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: Temporal.Now.plainDateISO().toString(),
                    ...entry,
                });
                window.location.hash = '#/health';
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        foodLog.onBack = () => {
            foodLog.hidden = true;
            scanner.hidden = false;
            scanner.reset();
        };
        this.content.appendChild(scanner);
        this.content.appendChild(foodLog);
    }
    showAiEstimate() {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const aiEstimate = document.createElement('ai-estimate');
        aiEstimate.onEstimate = async (description, image) => {
            return HealthService.estimateNutrition(description, image);
        };
        aiEstimate.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry(entry);
                window.location.hash = '#/health';
            }
            catch (err) {
                console.error('Failed to log AI nutrition estimate', err);
            }
        };
        this.content.appendChild(aiEstimate);
    }
    showFoodSearch() {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const foodLog = document.createElement('food-log');
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: Temporal.Now.plainDateISO().toString(),
                    ...entry,
                });
                window.location.hash = '#/health';
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        this.content.appendChild(foodLog);
    }
    async loadData() {
        const currentLoad = ++this.loadSequence;
        this.dashboard.showLoading();
        try {
            const today = Temporal.Now.plainDateISO();
            const todayStr = today.toString();
            const weekAgoStr = today.subtract({ days: 6 }).toString();
            const tomorrowStr = today.add({ days: 1 }).toString();
            const [manualActivities, todayNutrition, nutritionSummary] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchNutritionByDate(todayStr),
                HealthService.fetchNutritionSummary(weekAgoStr, tomorrowStr),
            ]);
            if (currentLoad !== this.loadSequence)
                return;
            const weekStartStr = this.getStartOfWeek().toString();
            this.dashboard.weekActivities = manualActivities.filter(a => a.date >= weekStartStr);
            this.dashboard.upcomingActivities = [];
            this.dashboard.allActivities = manualActivities;
            this.dashboard.todayNutrition = todayNutrition;
            this.dashboard.weekNutritionSummary = nutritionSummary;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
            const calendarActivities = await HealthService.fetchCalendarActivities(14, 30);
            if (currentLoad !== this.loadSequence)
                return;
            const pastCalendar = calendarActivities.filter(a => a.date <= todayStr);
            const upcomingCalendar = calendarActivities.filter(a => a.date > todayStr);
            const weekActivities = [
                ...manualActivities.filter(a => a.date >= weekStartStr),
                ...pastCalendar.filter(a => a.date >= weekStartStr),
            ];
            this.dashboard.weekActivities = weekActivities;
            this.dashboard.upcomingActivities = upcomingCalendar;
            this.dashboard.allActivities = [...manualActivities, ...pastCalendar];
        }
        catch (err) {
            console.error('Failed to load health data', err);
            this.dashboard.showError('Failed to load health data. Is the server running?');
        }
    }
    cleanUpSubViews() {
        this.content.querySelectorAll('barcode-scanner').forEach((el) => {
            el.stopCamera?.();
            el.remove();
        });
        this.content.querySelectorAll('food-log').forEach(el => el.remove());
        this.content.querySelectorAll('ai-estimate').forEach(el => el.remove());
    }
    cleanup() {
        this.cleanUpSubViews();
        this.dashboard.hidden = false;
    }
    getStartOfWeek() {
        const today = Temporal.Now.plainDateISO();
        return today.subtract({ days: today.dayOfWeek - 1 });
    }
}
