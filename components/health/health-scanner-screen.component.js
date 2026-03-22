import { HealthService } from '../../services/health.service.js';
import { navigate } from '../../router.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import './barcode-scanner/barcode-scanner.component.js';
import './food-log/food-log.component.js';
export class HealthScannerScreen extends HTMLElement {
    initialized = false;
    scanner = null;
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
        this.scanner = document.createElement('barcode-scanner');
        this.foodLog = document.createElement('food-log');
        this.foodLog.hidden = true;
        this.foodLog.showScanBarcodeAction = false;
        this.foodLog.showAiEstimateAction = false;
        if (this.mealValue) {
            this.foodLog.defaultMealType = this.mealValue;
        }
        this.scanner.onBarcodeDetected = async (barcode) => {
            if (!this.scanner || !this.foodLog)
                return;
            this.scanner.hidden = true;
            this.foodLog.hidden = false;
            await this.foodLog.lookupBarcode(barcode);
        };
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
        this.foodLog.addEventListener('health:food-log-back', () => {
            if (!this.scanner || !this.foodLog)
                return;
            this.foodLog.hidden = true;
            this.scanner.hidden = false;
            this.scanner.reset();
        });
        page.content.appendChild(this.scanner);
        page.content.appendChild(this.foodLog);
    }
    disconnectedCallback() {
        this.scanner?.stopCamera();
    }
    returnToPreviousScreen() {
        if (this.dateValue) {
            navigate(`#/health/day/${encodeURIComponent(this.dateValue)}`, { history: 'replace' });
            return;
        }
        navigate('#/health', { history: 'replace' });
    }
}
customElements.define('health-scanner-screen', HealthScannerScreen);
