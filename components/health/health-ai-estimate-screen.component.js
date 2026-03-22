import { HealthService } from '../../services/health.service.js';
import { navigate } from '../../router.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import './ai-estimate/ai-estimate.component.js';
export class HealthAiEstimateScreen extends HTMLElement {
    initialized = false;
    dateValue = null;
    mealValue = null;
    returnToPreviousScreen() {
        if (this.dateValue) {
            navigate(`#/health/day/${encodeURIComponent(this.dateValue)}`, { history: 'replace' });
            return;
        }
        navigate('#/health', { history: 'replace' });
    }
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
        const aiEstimate = document.createElement('ai-estimate');
        aiEstimate.defaultDate = this.dateValue;
        aiEstimate.defaultMealType = this.mealValue;
        aiEstimate.addEventListener('health:estimate-nutrition', (event) => {
            const customEvent = event;
            customEvent.detail.respondWith = HealthService.estimateNutrition(customEvent.detail.description, customEvent.detail.image);
        });
        aiEstimate.addEventListener('health:log-ai-estimate', async (event) => {
            const { detail: entry } = event;
            try {
                await HealthService.createNutritionEntry(entry);
                this.returnToPreviousScreen();
            }
            catch (err) {
                console.error('Failed to log AI nutrition estimate', err);
            }
        });
        page.content.appendChild(aiEstimate);
    }
}
customElements.define('health-ai-estimate-screen', HealthAiEstimateScreen);
