import { HealthService } from '../../services/health.service.js';
import { navigate } from '../../router.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import './food-log/food-log.component.js';
export class HealthFoodSearchScreen extends HTMLElement {
    initialized = false;
    foodLog = null;
    dateValue = null;
    mealValue = null;
    set date(value) {
        this.dateValue = value;
    }
    set meal(value) {
        this.mealValue = value;
    }
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Health', 'health', '#/health');
        this.foodLog = document.createElement('food-log');
        this.foodLog.showScanBarcodeAction = true;
        this.foodLog.showAiEstimateAction = true;
        if (this.mealValue) {
            this.foodLog.defaultMealType = this.mealValue;
        }
        this.foodLog.addEventListener('health:scan-barcode', () => {
            if (this.dateValue && this.mealValue) {
                navigate(`#/health/scanner/${encodeURIComponent(this.dateValue)}/${encodeURIComponent(this.mealValue)}`, { history: 'replace' });
                return;
            }
            navigate('#/health/scanner', { history: 'replace' });
        });
        this.foodLog.addEventListener('health:ai-estimate', () => {
            if (this.dateValue && this.mealValue) {
                navigate(`#/health/ai-estimate/${encodeURIComponent(this.dateValue)}/${encodeURIComponent(this.mealValue)}`, { history: 'replace' });
                return;
            }
            navigate('#/health/ai-estimate', { history: 'replace' });
        });
        this.foodLog.addEventListener('health:log-food', async (event) => {
            const { detail: entry } = event;
            try {
                await HealthService.createNutritionEntry({
                    date: this.dateValue ?? Temporal.Now.plainDateISO().toString(),
                    ...entry,
                });
                this.returnToPreviousScreen();
            }
            catch (err) {
                console.error('Failed to log nutrition', err);
            }
        });
        page.content.appendChild(this.foodLog);
    }
    returnToPreviousScreen() {
        if (this.dateValue) {
            navigate(`#/health/day/${encodeURIComponent(this.dateValue)}`, { history: 'replace' });
            return;
        }
        navigate('#/health', { history: 'replace' });
    }
}
customElements.define('health-food-search-screen', HealthFoodSearchScreen);
