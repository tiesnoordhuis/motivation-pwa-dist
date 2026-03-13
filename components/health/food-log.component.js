import styles from './food-log.css' with { type: 'css' };
import { OpenFoodFactsService } from '../../services/openfoodfacts.service.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="food-log-container">
        <!-- Search view -->
        <div id="search-view">
            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Search for food…">
            </div>
            <div id="search-loading" class="loading-text" style="display:none">Searching…</div>
            <div id="search-error" class="error-text" style="display:none"></div>
            <div id="search-results" class="search-results"></div>
        </div>

        <!-- Product detail / log view -->
        <div id="detail-view" style="display:none">
            <div class="product-detail">
                <div class="product-header">
                    <img id="product-image" class="product-image" style="display:none" alt="">
                    <div class="product-info">
                        <h3 id="product-name"></h3>
                        <div class="brand" id="product-brand"></div>
                    </div>
                </div>

                <div class="nutrition-per100">
                    <div class="nutri-item">
                        <div class="nutri-value" id="cal-100">0</div>
                        <div class="nutri-label">kcal</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="protein-100">0</div>
                        <div class="nutri-label">protein</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="carbs-100">0</div>
                        <div class="nutri-label">carbs</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="fat-100">0</div>
                        <div class="nutri-label">fat</div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="serving-size">Serving (g)</label>
                        <input type="number" id="serving-size" min="1" value="100">
                    </div>
                    <div class="form-group">
                        <label for="meal-type">Meal</label>
                        <select id="meal-type">
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snacks">Snacks</option>
                        </select>
                    </div>
                </div>

                <div class="serving-nutrition">
                    <div class="nutri-item">
                        <div class="nutri-value" id="cal-serving">0</div>
                        <div class="nutri-label">kcal</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="protein-serving">0</div>
                        <div class="nutri-label">protein</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="carbs-serving">0</div>
                        <div class="nutri-label">carbs</div>
                    </div>
                    <div class="nutri-item">
                        <div class="nutri-value" id="fat-serving">0</div>
                        <div class="nutri-label">fat</div>
                    </div>
                </div>

                <div class="actions">
                    <button class="btn-back" id="back-btn">← Back</button>
                    <button class="btn-log" id="log-btn">Log Food</button>
                </div>
            </div>
        </div>

        <div id="lookup-loading" class="loading-text" style="display:none">Looking up product…</div>
    </div>
`;
export class FoodLog extends HTMLElement {
    _product = null;
    _searchTimeout = null;
    _searchSeq = 0;
    _onLog = null;
    _onBack = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        // Search input with debounce
        const searchInput = shadow.getElementById('search-input');
        searchInput.addEventListener('input', () => {
            if (this._searchTimeout)
                clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(() => this.performSearch(searchInput.value.trim()), 300);
        });
        // Serving size change — listen to both input and change for mobile number steppers
        const servingInput = shadow.getElementById('serving-size');
        servingInput.addEventListener('input', () => this.updateServingDisplay());
        servingInput.addEventListener('change', () => this.updateServingDisplay());
        // Log button
        shadow.getElementById('log-btn').addEventListener('click', () => this.handleLog());
        // Back button
        shadow.getElementById('back-btn').addEventListener('click', () => {
            this.showSearchView();
            if (this._onBack)
                this._onBack();
        });
    }
    set onLog(handler) {
        this._onLog = handler;
    }
    set onBack(handler) {
        this._onBack = handler;
    }
    /** Look up a barcode and show the product detail view */
    async lookupBarcode(barcode) {
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').style.display = 'none';
        shadow.getElementById('detail-view').style.display = 'none';
        shadow.getElementById('lookup-loading').style.display = '';
        const product = await OpenFoodFactsService.lookupBarcode(barcode);
        shadow.getElementById('lookup-loading').style.display = 'none';
        if (product) {
            this.showProduct(product);
        }
        else {
            // Product not found — show search view with message
            shadow.getElementById('search-view').style.display = '';
            const errorEl = shadow.getElementById('search-error');
            errorEl.textContent = `Product not found for barcode ${barcode}. Try searching by name.`;
            errorEl.style.display = '';
        }
    }
    showProduct(product) {
        this._product = product;
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').style.display = 'none';
        shadow.getElementById('lookup-loading').style.display = 'none';
        shadow.getElementById('detail-view').style.display = '';
        shadow.getElementById('product-name').textContent = product.product_name;
        shadow.getElementById('product-brand').textContent = product.brands ?? '';
        const img = shadow.getElementById('product-image');
        if (product.image_url) {
            img.src = product.image_url;
            img.style.display = '';
        }
        else {
            img.style.display = 'none';
        }
        shadow.getElementById('cal-100').textContent = String(product.calories_per_100g);
        shadow.getElementById('protein-100').textContent = String(product.protein_per_100g);
        shadow.getElementById('carbs-100').textContent = String(product.carbs_per_100g);
        shadow.getElementById('fat-100').textContent = String(product.fat_per_100g);
        // Reset serving to 100g
        shadow.getElementById('serving-size').value = '100';
        this.updateServingDisplay();
    }
    showSearchView() {
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').style.display = '';
        shadow.getElementById('detail-view').style.display = 'none';
        shadow.getElementById('lookup-loading').style.display = 'none';
        this._product = null;
    }
    updateServingDisplay() {
        if (!this._product)
            return;
        const shadow = this.shadowRoot;
        const grams = parseInt(shadow.getElementById('serving-size').value, 10) || 0;
        const serving = OpenFoodFactsService.calculateServing(this._product, grams);
        shadow.getElementById('cal-serving').textContent = String(serving.calories);
        shadow.getElementById('protein-serving').textContent = String(serving.protein_g);
        shadow.getElementById('carbs-serving').textContent = String(serving.carbs_g);
        shadow.getElementById('fat-serving').textContent = String(serving.fat_g);
    }
    handleLog() {
        if (!this._product || !this._onLog)
            return;
        const shadow = this.shadowRoot;
        const grams = parseInt(shadow.getElementById('serving-size').value, 10) || 100;
        const mealType = shadow.getElementById('meal-type').value;
        const serving = OpenFoodFactsService.calculateServing(this._product, grams);
        this._onLog({
            food_name: this._product.product_name,
            serving_size: `${grams}g`,
            meal_type: mealType,
            ...serving,
            source: 'openfoodfacts',
            source_ref: this._product.barcode,
        });
    }
    async performSearch(query) {
        if (query.length < 2)
            return;
        const shadow = this.shadowRoot;
        shadow.getElementById('search-loading').style.display = '';
        shadow.getElementById('search-error').style.display = 'none';
        shadow.getElementById('search-results').innerHTML = '';
        const seq = ++this._searchSeq;
        try {
            const results = await OpenFoodFactsService.searchFood(query);
            // Discard stale results if a newer search was fired
            if (seq !== this._searchSeq)
                return;
            shadow.getElementById('search-loading').style.display = 'none';
            const container = shadow.getElementById('search-results');
            if (results.length === 0) {
                container.innerHTML = '<div class="empty-state">No products found</div>';
                return;
            }
            for (const product of results) {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="result-info">
                        <div class="result-name">${this.escapeHtml(product.product_name)}</div>
                        <div class="result-brand">${this.escapeHtml(product.brands ?? '')}</div>
                    </div>
                    <div class="result-cal">${product.calories_per_100g} kcal</div>
                `;
                item.addEventListener('click', () => this.showProduct(product));
                container.appendChild(item);
            }
        }
        catch {
            if (seq !== this._searchSeq)
                return;
            shadow.getElementById('search-loading').style.display = 'none';
            const errorEl = shadow.getElementById('search-error');
            errorEl.textContent = 'Search failed. Please try again.';
            errorEl.style.display = '';
        }
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
customElements.define('food-log', FoodLog);
