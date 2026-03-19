import { HealthService } from '../../services/health.service.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import { navigate } from '../../router.js';
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
        this.dashboard.onScanBarcode = () => { navigate('#/health/scanner'); };
        this.dashboard.onSearchFood = () => { navigate('#/health/food-search'); };
        this.dashboard.onAiEstimate = () => { navigate('#/health/ai-estimate'); };
    }
    showDashboard() {
        this.cleanUpSubViews();
        this.dashboard.hidden = false;
    }
    showScanner(dateStr, mealType) {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const scanner = document.createElement('barcode-scanner');
        const foodLog = document.createElement('food-log');
        if (mealType) {
            foodLog.defaultMealType = mealType;
        }
        foodLog.hidden = true;
        scanner.onBarcodeDetected = async (barcode) => {
            scanner.hidden = true;
            foodLog.hidden = false;
            await foodLog.lookupBarcode(barcode);
        };
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: dateStr ?? Temporal.Now.plainDateISO().toString(),
                    ...entry,
                });
                navigate('#/health');
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
    showAiEstimate(dateStr, mealType) {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const aiEstimate = document.createElement('ai-estimate');
        aiEstimate.defaultDate = dateStr ?? null;
        aiEstimate.defaultMealType = mealType ?? null;
        aiEstimate.onEstimate = async (description, image) => {
            return HealthService.estimateNutrition(description, image);
        };
        aiEstimate.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry(entry);
                navigate('#/health');
            }
            catch (err) {
                console.error('Failed to log AI nutrition estimate', err);
            }
        };
        this.content.appendChild(aiEstimate);
    }
    showFoodSearch(dateStr, mealType) {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const foodLog = document.createElement('food-log');
        if (mealType) {
            foodLog.defaultMealType = mealType;
        }
        foodLog.onScanBarcode = () => {
            if (dateStr && mealType) {
                navigate(`#/health/scanner/${encodeURIComponent(dateStr)}/${encodeURIComponent(mealType)}`);
                return;
            }
            navigate('#/health/scanner');
        };
        foodLog.onAiEstimate = () => {
            if (dateStr && mealType) {
                navigate(`#/health/ai-estimate/${encodeURIComponent(dateStr)}/${encodeURIComponent(mealType)}`);
                return;
            }
            navigate('#/health/ai-estimate');
        };
        foodLog.onLog = async (entry) => {
            try {
                await HealthService.createNutritionEntry({
                    date: dateStr ?? Temporal.Now.plainDateISO().toString(),
                    ...entry,
                });
                navigate('#/health');
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        };
        this.content.appendChild(foodLog);
    }
    async showDayDetail(dateStr) {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const detail = document.createElement('health-day-detail');
        detail.dateContext = dateStr;
        detail.showLoading();
        detail.onAddWorkout = (d) => {
            // Re-use dashboard logic to show workout modal pre-filled with date
            this.dashboard.hidden = false;
            detail.hidden = true;
            this.dashboard.openManualAddDialog(d);
        };
        detail.onAddFood = (d, meal) => {
            navigate(`#/health/food-search/${encodeURIComponent(d)}/${encodeURIComponent(meal)}`);
        };
        detail.onEditFood = (entry) => {
            detail.hidden = true;
            const editor = document.createElement('nutrition-edit');
            editor.entry = entry;
            editor.onSave = async (id, updates) => {
                try {
                    await HealthService.updateNutritionEntry(id, updates);
                    editor.remove();
                    await this.showDayDetail(dateStr);
                }
                catch (err) {
                    console.error('Failed to update nutrition entry', err);
                }
            };
            editor.onDelete = async (id) => {
                try {
                    await HealthService.deleteNutritionEntry(id);
                    editor.remove();
                    await this.showDayDetail(dateStr);
                }
                catch (err) {
                    console.error('Failed to delete nutrition entry', err);
                }
            };
            this.content.appendChild(editor);
        };
        detail.onEditWorkout = (activity) => {
            detail.hidden = true;
            const editor = document.createElement('activity-edit');
            editor.activity = activity;
            editor.onSave = async (id, updates) => {
                try {
                    await HealthService.updateActivity(id, updates);
                    editor.remove();
                    await this.showDayDetail(dateStr);
                }
                catch (err) {
                    console.error('Failed to update activity', err);
                }
            };
            editor.onDelete = async (id) => {
                try {
                    await HealthService.deleteActivity(id);
                    editor.remove();
                    await this.showDayDetail(dateStr);
                }
                catch (err) {
                    console.error('Failed to delete activity', err);
                }
            };
            this.content.appendChild(editor);
        };
        this.content.appendChild(detail);
        const currentLoad = ++this.loadSequence;
        try {
            // Load DB activities (which now includes calendar activities) and nutrition
            const [activities, nutrition] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchNutritionByDate(dateStr)
            ]);
            if (currentLoad !== this.loadSequence)
                return;
            // Only grab activities for the specific date
            const dayActivities = activities.filter(a => a.date.startsWith(dateStr));
            detail.activities = dayActivities;
            detail.nutrition = nutrition;
            detail.hideLoading();
            detail.showContent();
        }
        catch (err) {
            console.error('Failed to load day detail data', err);
            if (currentLoad === this.loadSequence) {
                detail.showError('Failed to load detail for ' + dateStr);
            }
        }
    }
    async loadData() {
        const currentLoad = ++this.loadSequence;
        this.dashboard.showLoading();
        try {
            const today = Temporal.Now.plainDateISO();
            const todayStr = today.toString();
            const weekAgoStr = today.subtract({ days: 6 }).toString();
            const tomorrowStr = today.add({ days: 1 }).toString();
            const [manualActivities, nutritionSummary, weekNutrition] = await Promise.all([
                HealthService.fetchActivities(),
                HealthService.fetchNutritionSummary(weekAgoStr, tomorrowStr),
                HealthService.fetchNutritionByDateRange(weekAgoStr, tomorrowStr)
            ]);
            if (currentLoad !== this.loadSequence)
                return;
            const weekStartStr = this.getStartOfWeek().toString();
            const pastAndTodayActivities = manualActivities.filter(a => a.date <= todayStr);
            const futureActivities = manualActivities.filter(a => a.date > todayStr);
            this.dashboard.weekActivities = pastAndTodayActivities.filter(a => a.date >= weekStartStr);
            this.dashboard.upcomingActivities = futureActivities;
            this.dashboard.allActivities = pastAndTodayActivities;
            this.dashboard.allNutrition = weekNutrition;
            this.dashboard.todayNutrition = weekNutrition.filter(n => n.date.startsWith(todayStr));
            this.dashboard.weekNutritionSummary = nutritionSummary;
            this.dashboard.hideLoading();
            this.dashboard.showContent();
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
        this.content.querySelectorAll('health-day-detail').forEach(el => el.remove());
        this.content.querySelectorAll('nutrition-edit').forEach(el => el.remove());
        this.content.querySelectorAll('activity-edit').forEach(el => el.remove());
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
