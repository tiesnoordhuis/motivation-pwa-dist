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
            <div id="search-loading" class="loading-text" hidden>Searching…</div>
            <div id="search-error" class="error-text" hidden></div>
            <div id="search-results" class="search-results"></div>
        </div>

        <!-- Product detail / log view -->
        <div id="detail-view" hidden>
            <div class="product-detail">
                <div class="product-header">
                    <img id="product-image" class="product-image" hidden alt="">
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
                    <div class="form-group serving-group">
                        <label for="serving-size">Serving (g)</label>
                        <div class="serving-controls">
                            <button class="btn-step" id="step-down">−</button>
                            <input type="number" id="serving-size" min="1" value="100">
                            <button class="btn-step" id="step-up">+</button>
                        </div>
                        <div class="portion-presets" id="portion-presets"></div>
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

        <div id="lookup-loading" class="loading-text" hidden>Looking up product…</div>
    </div>
`;
export class FoodLog extends HTMLElement {
    _product = null;
    _defaultGrams = 100;
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
        const searchInput = shadow.getElementById('search-input');
        searchInput.addEventListener('input', () => {
            if (this._searchTimeout)
                clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(() => this.performSearch(searchInput.value.trim()), 300);
        });
        const servingInput = shadow.getElementById('serving-size');
        servingInput.addEventListener('input', () => this.updateServingDisplay());
        servingInput.addEventListener('change', () => this.updateServingDisplay());
        shadow.getElementById('step-down').addEventListener('click', () => this.adjustServing(-1));
        shadow.getElementById('step-up').addEventListener('click', () => this.adjustServing(1));
        shadow.getElementById('log-btn').addEventListener('click', () => this.handleLog());
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
    async lookupBarcode(barcode) {
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = true;
        shadow.getElementById('detail-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = false;
        const product = await OpenFoodFactsService.lookupBarcode(barcode);
        shadow.getElementById('lookup-loading').hidden = true;
        if (product) {
            this.showProduct(product);
        }
        else {
            shadow.getElementById('search-view').hidden = false;
            const errorEl = shadow.getElementById('search-error');
            errorEl.textContent = `Product not found for barcode ${barcode}. Try searching by name.`;
            errorEl.hidden = false;
        }
    }
    showProduct(product) {
        this._product = product;
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = true;
        shadow.getElementById('detail-view').hidden = false;
        shadow.getElementById('product-name').textContent = product.product_name;
        shadow.getElementById('product-brand').textContent = product.brands ?? '';
        const img = shadow.getElementById('product-image');
        if (product.image_url) {
            img.src = product.image_url;
            img.hidden = false;
        }
        else {
            img.hidden = true;
        }
        shadow.getElementById('cal-100').textContent = String(product.calories_per_100g);
        shadow.getElementById('protein-100').textContent = String(product.protein_per_100g);
        shadow.getElementById('carbs-100').textContent = String(product.carbs_per_100g);
        shadow.getElementById('fat-100').textContent = String(product.fat_per_100g);
        this._defaultGrams = OpenFoodFactsService.getDefaultServing(product);
        const servingInput = shadow.getElementById('serving-size');
        servingInput.value = String(this._defaultGrams);
        this.renderPortionPresets();
        this.updateServingDisplay();
    }
    showSearchView() {
        const shadow = this.shadowRoot;
        shadow.getElementById('search-view').hidden = false;
        shadow.getElementById('detail-view').hidden = true;
        shadow.getElementById('lookup-loading').hidden = true;
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
    adjustServing(direction) {
        const shadow = this.shadowRoot;
        const input = shadow.getElementById('serving-size');
        const current = parseInt(input.value, 10) || 0;
        const step = OpenFoodFactsService.getServingStep(current);
        const newValue = Math.max(1, current + direction * step);
        input.value = String(newValue);
        this.updateServingDisplay();
    }
    renderPortionPresets() {
        const shadow = this.shadowRoot;
        const container = shadow.getElementById('portion-presets');
        container.replaceChildren();
        const presets = OpenFoodFactsService.getPortionPresets(this._defaultGrams);
        for (const preset of presets) {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = `${preset.label}× (${preset.grams}g)`;
            btn.addEventListener('click', () => {
                shadow.getElementById('serving-size').value = String(preset.grams);
                this.updateServingDisplay();
            });
            container.appendChild(btn);
        }
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
        shadow.getElementById('search-loading').hidden = false;
        shadow.getElementById('search-error').hidden = true;
        shadow.getElementById('search-results').replaceChildren();
        const seq = ++this._searchSeq;
        try {
            const results = await OpenFoodFactsService.searchFood(query);
            if (seq !== this._searchSeq)
                return;
            shadow.getElementById('search-loading').hidden = true;
            const container = shadow.getElementById('search-results');
            if (results.length === 0) {
                const empty = document.createElement('p');
                empty.className = 'empty-state';
                empty.textContent = 'No products found';
                container.appendChild(empty);
                return;
            }
            for (const product of results) {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                const info = document.createElement('div');
                info.className = 'result-info';
                const name = document.createElement('div');
                name.className = 'result-name';
                name.textContent = product.product_name;
                const brand = document.createElement('div');
                brand.className = 'result-brand';
                brand.textContent = product.brands ?? '';
                const cal = document.createElement('div');
                cal.className = 'result-cal';
                cal.textContent = `${product.calories_per_100g} kcal`;
                info.appendChild(name);
                info.appendChild(brand);
                item.appendChild(info);
                item.appendChild(cal);
                item.addEventListener('click', () => this.showProduct(product));
                container.appendChild(item);
            }
        }
        catch {
            if (seq !== this._searchSeq)
                return;
            shadow.getElementById('search-loading').hidden = true;
            const errorEl = shadow.getElementById('search-error');
            errorEl.textContent = 'Search failed. Please try again.';
            errorEl.hidden = false;
        }
    }
}
customElements.define('food-log', FoodLog);
