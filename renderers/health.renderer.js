import { HealthService } from '../services/health.service.js';
export class HealthRenderer {
    container;
    content;
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
        this.content = document.createElement('div');
        this.content.className = 'section-page__content';
        this.container.appendChild(this.content);
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
        // FAB nutrition options
        this.dashboard.onScanBarcode = () => this.showScannerView();
        this.dashboard.onSearchFood = () => this.showFoodSearchView();
    }
    async init() {
        await this.loadData();
    }
    async loadData() {
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
            // Fetch all data in parallel
            const [manualActivities, calendarActivities, todayNutrition, nutritionSummary] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchCalendarActivities(14, 30),
                HealthService.fetchNutritionByDate(today),
                HealthService.fetchNutritionSummary(weekAgoStr, tomorrowStr),
            ]);
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
            this.dashboard.todayNutrition = todayNutrition;
            this.dashboard.weekNutritionSummary = nutritionSummary;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
        }
        catch (err) {
            console.error('Failed to load health data', err);
            this.dashboard.showError('Failed to load health data. Is the server running?');
        }
    }
    showScannerView() {
        // Hide dashboard, show scanner + food log flow
        this.dashboard.style.display = 'none';
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
                this.returnToDashboard();
                await this.loadData();
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
    showFoodSearchView() {
        this.dashboard.style.display = 'none';
        const foodLog = document.createElement('food-log');
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: new Date().toISOString().split('T')[0],
                    ...entry,
                });
                this.returnToDashboard();
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        foodLog.onBack = () => {
            this.returnToDashboard();
        };
        this.content.appendChild(foodLog);
    }
    returnToDashboard() {
        // Remove scanner and food-log elements if present
        this.content.querySelectorAll('barcode-scanner, food-log').forEach(el => el.remove());
        this.dashboard.style.display = '';
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
