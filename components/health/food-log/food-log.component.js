import styles from './food-log.css' with { type: 'css' };
import { MEAL_TYPES } from '@motivation/shared';
import { OpenFoodFactsService } from '../../../services/openfoodfacts.service.js';
import { HealthService } from '../../../services/health.service.js';
import { getDefaultMealType } from '../health-dashboard/health-utils.js';
import './food-search-results.component.js';
import './food-log-detail.component.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="food-log-container">
        <div id="search-view">
            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Search for food…">
            </div>
            <div class="alt-log-actions" id="alt-log-actions" hidden>
                <button class="alt-log-btn" id="scan-btn">Scan Barcode</button>
                <button class="alt-log-btn" id="ai-btn">AI Estimate</button>
            </div>
            <div id="search-loading" class="loading-text" hidden>Searching…</div>
            <div id="search-error" class="error-text" hidden></div>
            <food-search-results id="search-results-component"></food-search-results>
        </div>

        <div id="detail-view" hidden>
            <food-log-detail id="detail-component"></food-log-detail>
        </div>

        <div id="lookup-loading" class="loading-text" hidden>Looking up product…</div>
    </div>
`;
export class FoodLog extends HTMLElement {
    searchTimeout = null;
    searchSeq = 0;
    offSearchAbortController = null;
    showScanBarcodeActionValue = false;
    showAiEstimateActionValue = false;
    defaultMealTypeValue = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        const searchInput = shadow.getElementById('search-input');
        const detail = shadow.getElementById('detail-component');
        const results = shadow.getElementById('search-results-component');
        searchInput.addEventListener('input', () => {
            if (this.searchTimeout)
                clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => void this.performSearch(searchInput.value.trim()), 300);
        });
        shadow.getElementById('scan-btn').addEventListener('click', () => this.dispatchFoodLogEvent('health:scan-barcode'));
        shadow.getElementById('ai-btn').addEventListener('click', () => this.dispatchFoodLogEvent('health:ai-estimate'));
        detail.addEventListener('health:food-log-back', () => {
            this.showSearchView();
        });
        results.addEventListener('health:select-library-item', (event) => {
            this.abortOffSearch();
            this.showLibraryItem(event.detail);
        });
        results.addEventListener('health:select-off-item', (event) => {
            this.abortOffSearch();
            this.showProduct(event.detail);
        });
        this.applyMealTypeSelection();
        this.updateAltLogActionsVisibility();
    }
    set showScanBarcodeAction(show) {
        this.showScanBarcodeActionValue = show;
        this.updateAltLogActionsVisibility();
    }
    set showAiEstimateAction(show) {
        this.showAiEstimateActionValue = show;
        this.updateAltLogActionsVisibility();
    }
    set defaultMealType(mealType) {
        if (!mealType || !MEAL_TYPES.includes(mealType)) {
            this.defaultMealTypeValue = null;
        }
        else {
            this.defaultMealTypeValue = mealType;
        }
        this.applyMealTypeSelection();
    }
    async lookupBarcode(barcode) {
        this.abortOffSearch();
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = true;
        shadow.getElementById('detail-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = false;
        const libraryItem = await HealthService.fetchFoodLibraryByBarcode(barcode);
        if (libraryItem) {
            shadow.getElementById('lookup-loading').hidden = true;
            this.showLibraryItem(libraryItem);
            return;
        }
        const product = await OpenFoodFactsService.lookupBarcode(barcode);
        shadow.getElementById('lookup-loading').hidden = true;
        if (product) {
            this.showProduct(product);
            return;
        }
        shadow.getElementById('search-view').hidden = false;
        const errorEl = shadow.getElementById('search-error');
        errorEl.textContent = `Product not found for barcode ${barcode}. Try searching by name.`;
        errorEl.hidden = false;
    }
    showProduct(product) {
        this.abortOffSearch();
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = true;
        shadow.getElementById('detail-view').hidden = false;
        const detail = shadow.getElementById('detail-component');
        detail.showProduct(product);
        this.applyMealTypeSelection();
    }
    showLibraryItem(item) {
        this.abortOffSearch();
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = true;
        shadow.getElementById('detail-view').hidden = false;
        const detail = shadow.getElementById('detail-component');
        detail.showLibraryItem(item);
        this.applyMealTypeSelection();
    }
    showSearchView() {
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = false;
        shadow.getElementById('detail-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = true;
    }
    async performSearch(query) {
        if (query.length < 2)
            return;
        const shadow = this.shadowRoot;
        const results = shadow.getElementById('search-results-component');
        this.abortOffSearch();
        shadow.getElementById('search-loading').hidden = false;
        shadow.getElementById('search-error').hidden = true;
        results.clear();
        const seq = ++this.searchSeq;
        this.offSearchAbortController = new AbortController();
        const offSearchPromise = OpenFoodFactsService.searchFood(query, {
            signal: this.offSearchAbortController.signal,
        });
        try {
            const libraryResults = await HealthService.fetchFoodLibrarySearch(query).catch(() => []);
            if (seq !== this.searchSeq)
                return;
            if (libraryResults.length > 0) {
                results.libraryItems = libraryResults;
            }
            const offResults = await offSearchPromise;
            if (seq !== this.searchSeq)
                return;
            shadow.getElementById('search-loading').hidden = true;
            this.offSearchAbortController = null;
            if (libraryResults.length === 0 && offResults.length === 0) {
                results.showEmpty('No products found');
                return;
            }
            results.offItems = offResults;
        }
        catch (error) {
            if (seq !== this.searchSeq)
                return;
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            shadow.getElementById('search-loading').hidden = true;
            const errorEl = shadow.getElementById('search-error');
            errorEl.textContent = 'Search failed. Please try again.';
            errorEl.hidden = false;
        }
    }
    abortOffSearch() {
        this.offSearchAbortController?.abort();
        this.offSearchAbortController = null;
    }
    applyMealTypeSelection() {
        const detail = this.shadowRoot?.getElementById('detail-component');
        if (detail) {
            detail.defaultMealType = this.defaultMealTypeValue ?? getDefaultMealType();
        }
    }
    updateAltLogActionsVisibility() {
        const shadow = this.shadowRoot;
        if (!shadow)
            return;
        const actionsEl = shadow.getElementById('alt-log-actions');
        if (!actionsEl)
            return;
        const hasAltActions = this.showScanBarcodeActionValue || this.showAiEstimateActionValue;
        actionsEl.hidden = !hasAltActions;
        const scanButton = shadow.getElementById('scan-btn');
        if (scanButton)
            scanButton.hidden = !this.showScanBarcodeActionValue;
        const aiButton = shadow.getElementById('ai-btn');
        if (aiButton)
            aiButton.hidden = !this.showAiEstimateActionValue;
    }
    dispatchFoodLogEvent(type, detail) {
        const CustomEventCtor = this.ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
        this.dispatchEvent(new CustomEventCtor(type, {
            bubbles: true,
            composed: true,
            detail,
        }));
    }
}
customElements.define('food-log', FoodLog);
