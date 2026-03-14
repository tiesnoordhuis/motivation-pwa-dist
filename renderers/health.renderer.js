import { HealthService } from '../services/health.service.js';
import { buildSectionPage } from './section-page.utils.js';
let instance = null;
export function healthRoutes() {
    return {
        '#/health': {
            view: '#health-view',
            init: () => { instance = new HealthRenderer(); },
            onEnter: async () => {
                instance?.showDashboard();
                await instance?.loadData();
            },
            onLeave: () => { instance?.cleanup(); },
        },
        '#/health/scanner': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showScanner(); },
        },
        '#/health/food-search': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showFoodSearch(); },
        },
        '#/health/ai-estimate': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showAiEstimate(); },
        },
    };
}
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
        // FAB save handler (activity logging)
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
        // FAB nutrition options — navigate via hash
        this.dashboard.onScanBarcode = () => { window.location.hash = '#/health/scanner'; };
        this.dashboard.onSearchFood = () => { window.location.hash = '#/health/food-search'; };
        this.dashboard.onAiEstimate = () => { window.location.hash = '#/health/ai-estimate'; };
    }
    /** Show the health dashboard and load fresh data. */
    showDashboard() {
        this.cleanUpSubViews();
        this.dashboard.style.display = '';
    }
    /** Show the barcode scanner sub-view. */
    showScanner() {
        this.dashboard.style.display = 'none';
        this.cleanUpSubViews();
        const scanner = document.createElement('barcode-scanner');
        const foodLog = document.createElement('food-log');
        foodLog.style.display = 'none';
        scanner.onBarcodeDetected = async (barcode) => {
            scanner.style.display = 'none';
            foodLog.style.display = '';
            await foodLog.lookupBarcode(barcode);
        };
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: new Date().toISOString().split('T')[0],
                    ...entry,
                });
                // Navigate back to dashboard — router's onEnter reloads data
                window.location.hash = '#/health';
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        foodLog.onBack = () => {
            foodLog.style.display = 'none';
            scanner.style.display = '';
            scanner.reset();
        };
        this.content.appendChild(scanner);
        this.content.appendChild(foodLog);
    }
    /** Show the AI nutrition estimate sub-view. */
    showAiEstimate() {
        this.dashboard.style.display = 'none';
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
    /** Show the food search sub-view. */
    showFoodSearch() {
        this.dashboard.style.display = 'none';
        this.cleanUpSubViews();
        const foodLog = document.createElement('food-log');
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: new Date().toISOString().split('T')[0],
                    ...entry,
                });
                // Navigate back to dashboard — router's onEnter reloads data
                window.location.hash = '#/health';
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        // No onBack — food-log's internal back handles detail→search.
        // Section header back button navigates to #/health via history.back().
        this.content.appendChild(foodLog);
    }
    async loadData() {
        const currentLoad = ++this.loadSequence;
        this.dashboard.showLoading();
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            // Calculate 7 days ago for nutrition summary
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 6);
            const weekAgoStr = weekAgo.toISOString().split('T')[0];
            // Tomorrow for summary range end
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            // Fetch core dashboard data first for faster first render.
            const [manualActivities, todayNutrition, nutritionSummary] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchNutritionByDate(today),
                HealthService.fetchNutritionSummary(weekAgoStr, tomorrowStr),
            ]);
            if (currentLoad !== this.loadSequence)
                return;
            const weekStart = this.getStartOfWeek();
            const weekStartStr = weekStart.toISOString().split('T')[0];
            // Show immediate content with manual activities while calendar data is loading.
            this.dashboard.weekActivities = manualActivities.filter(a => a.date >= weekStartStr);
            this.dashboard.upcomingActivities = [];
            this.dashboard.allActivities = manualActivities;
            this.dashboard.todayNutrition = todayNutrition;
            this.dashboard.weekNutritionSummary = nutritionSummary;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
            // Fetch calendar activities in the background and patch UI when ready.
            const calendarActivities = await HealthService.fetchCalendarActivities(14, 30);
            if (currentLoad !== this.loadSequence)
                return;
            // Split calendar activities into past (this week) and upcoming (future).
            const pastCalendar = calendarActivities.filter(a => a.date <= today);
            const upcomingCalendar = calendarActivities.filter(a => a.date > today);
            // This week's activities = manual + past calendar events from this week
            const weekActivities = [
                ...manualActivities.filter(a => a.date >= weekStartStr),
                ...pastCalendar.filter(a => a.date >= weekStartStr),
            ];
            // All activities for streak (manual + past calendar)
            const allActivities = [...manualActivities, ...pastCalendar];
            this.dashboard.weekActivities = weekActivities;
            this.dashboard.upcomingActivities = upcomingCalendar;
            this.dashboard.allActivities = allActivities;
        }
        catch (err) {
            console.error('Failed to load health data', err);
            this.dashboard.showError('Failed to load health data. Is the server running?');
        }
    }
    /** Remove sub-view elements and stop active camera streams. */
    cleanUpSubViews() {
        this.content.querySelectorAll('barcode-scanner').forEach((el) => {
            el.stopCamera?.();
            el.remove();
        });
        this.content.querySelectorAll('food-log').forEach(el => el.remove());
        this.content.querySelectorAll('ai-estimate').forEach(el => el.remove());
    }
    /** Called when leaving the health section entirely. */
    cleanup() {
        this.cleanUpSubViews();
        this.dashboard.style.display = '';
    }
    getStartOfWeek() {
        const now = new Date(); // Change to Temporal
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(diff);
        return monday;
    }
}
