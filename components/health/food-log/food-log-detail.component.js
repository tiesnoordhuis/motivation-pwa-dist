import styles from './food-log.css' with { type: 'css' };
import { MEAL_TYPES } from '@motivation/shared';
import { OpenFoodFactsService } from '../../../services/openfoodfacts.service.js';
import { getDefaultMealType } from '../health-dashboard/health-utils.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="product-detail">
        <div class="product-header">
            <img id="product-image" class="product-image" hidden alt="">
            <div class="product-info">
                <h3 id="product-name"></h3>
                <div class="brand" id="product-brand"></div>
            </div>
        </div>

        <div class="serving-highlight">
             <div class="main-cal">
                 <div id="cal-serving" class="huge-val">0</div>
                 <div class="lbl">kcal</div>
             </div>
             <div class="macros">
                 <div class="macro">
                     <span class="macro-val" id="protein-serving">0</span>
                     <span class="macro-lbl">protein</span>
                 </div>
                 <div class="macro">
                     <span class="macro-val" id="carbs-serving">0</span>
                     <span class="macro-lbl">carbs</span>
                 </div>
                 <div class="macro">
                     <span class="macro-val" id="fat-serving">0</span>
                     <span class="macro-lbl">fat</span>
                 </div>
             </div>
        </div>

        <div class="form-row">
            <div class="form-group serving-group">
                <label for="serving-size" id="serving-size-label">Serving (g)</label>
                <div class="serving-controls">
                    <button class="btn-step" id="step-down">−</button>
                    <input type="number" id="serving-size" min="0.1" step="0.1" value="100">
                    <button class="btn-step" id="step-up">+</button>
                </div>
                <div class="portion-presets" id="portion-presets"></div>
            </div>
            <div class="form-group">
                <label for="meal-type">Meal</label>
                <select id="meal-type">
                    ${MEAL_TYPES.map(m => `<option value="${m}">${m}</option>`).join('\n                    ')}
                </select>
            </div>
        </div>

        <div class="nutrition-per100">
            <div class="nutri-label" id="nutrition-reference-label">Per 100g</div>
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

        <div class="actions">
            <button class="btn-back" id="back-btn">← Back</button>
            <button class="btn-log" id="log-btn">Log Food</button>
        </div>
    </div>
`;
export class FoodLogDetail extends HTMLElement {
    productValue = null;
    libraryItemValue = null;
    defaultGrams = 100;
    defaultMealTypeValue = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('serving-size').addEventListener('input', () => this.updateServingDisplay());
        shadow.getElementById('serving-size').addEventListener('change', () => this.updateServingDisplay());
        shadow.getElementById('step-down').addEventListener('click', () => this.adjustServing(-1));
        shadow.getElementById('step-up').addEventListener('click', () => this.adjustServing(1));
        shadow.getElementById('back-btn').addEventListener('click', () => this.dispatchEventWithDetail('health:food-log-back'));
        shadow.getElementById('log-btn').addEventListener('click', () => this.handleLog());
        this.applyMealTypeSelection();
    }
    set defaultMealType(mealType) {
        if (!mealType || !MEAL_TYPES.includes(mealType)) {
            this.defaultMealTypeValue = null;
            this.applyMealTypeSelection();
            return;
        }
        this.defaultMealTypeValue = mealType;
        this.applyMealTypeSelection();
    }
    showProduct(product) {
        this.productValue = product;
        this.libraryItemValue = null;
        const shadow = this.shadowRoot;
        shadow.getElementById('product-name').textContent = product.product_name;
        shadow.getElementById('product-brand').textContent = product.brands ?? '';
        const img = shadow.getElementById('product-image');
        if (product.image_url) {
            img.src = product.image_url;
            img.hidden = false;
        }
        else {
            img.hidden = true;
            img.src = '';
        }
        shadow.getElementById('nutrition-reference-label').textContent = 'Per 100g';
        shadow.getElementById('serving-size-label').textContent = 'Serving (g)';
        this.defaultGrams = OpenFoodFactsService.getDefaultServing(product);
        shadow.getElementById('serving-size').value = String(this.defaultGrams);
        this.renderNutritionReference({
            calories: product.calories_per_100g,
            protein_g: product.protein_per_100g,
            carbs_g: product.carbs_per_100g,
            fat_g: product.fat_per_100g,
        });
        this.renderPortionPresets();
        this.applyMealTypeSelection();
        this.updateServingDisplay();
    }
    showLibraryItem(item) {
        this.libraryItemValue = item;
        this.productValue = null;
        const shadow = this.shadowRoot;
        shadow.getElementById('product-name').textContent = item.display_name;
        shadow.getElementById('product-brand').textContent = item.brands ?? '';
        const img = shadow.getElementById('product-image');
        img.hidden = true;
        img.src = '';
        const per100 = this.getLibraryPer100(item);
        if (per100) {
            shadow.getElementById('nutrition-reference-label').textContent = 'Per 100g';
            shadow.getElementById('serving-size-label').textContent = 'Serving (g)';
            this.defaultGrams = item.serving_quantity && item.serving_quantity > 0 ? Math.round(item.serving_quantity) : 100;
            shadow.getElementById('serving-size').value = String(this.defaultGrams);
            this.renderNutritionReference(per100);
            this.renderPortionPresets();
        }
        else {
            shadow.getElementById('nutrition-reference-label').textContent = 'Per serving';
            shadow.getElementById('serving-size-label').textContent = 'Servings';
            shadow.getElementById('serving-size').value = '1';
            this.renderNutritionReference({
                calories: item.calories ?? 0,
                protein_g: item.protein_g ?? 0,
                carbs_g: item.carbs_g ?? 0,
                fat_g: item.fat_g ?? 0,
            });
            shadow.getElementById('portion-presets').replaceChildren();
        }
        this.applyMealTypeSelection();
        this.updateServingDisplay();
    }
    updateServingDisplay() {
        const shadow = this.shadowRoot;
        const amount = this.getServingAmount();
        const serving = this.calculateServing(amount);
        if (!serving)
            return;
        shadow.getElementById('cal-serving').textContent = String(Math.round(serving.calories));
        shadow.getElementById('protein-serving').textContent = this.formatNutritionValue(serving.protein_g);
        shadow.getElementById('carbs-serving').textContent = this.formatNutritionValue(serving.carbs_g);
        shadow.getElementById('fat-serving').textContent = this.formatNutritionValue(serving.fat_g);
    }
    calculateServing(amount) {
        if (this.productValue) {
            const serving = OpenFoodFactsService.calculateServing(this.productValue, amount);
            return {
                food_name: this.productValue.product_name,
                serving_size: `${this.formatAmount(amount)}g`,
                meal_type: this.getSelectedMealType(),
                ...serving,
                source: 'openfoodfacts',
                source_ref: this.productValue.barcode,
            };
        }
        if (!this.libraryItemValue)
            return null;
        const per100 = this.getLibraryPer100(this.libraryItemValue);
        if (per100) {
            const serving = OpenFoodFactsService.calculateServing({
                calories_per_100g: per100.calories,
                protein_per_100g: per100.protein_g,
                carbs_per_100g: per100.carbs_g,
                fat_per_100g: per100.fat_g,
                fiber_per_100g: per100.fiber_g ?? 0,
                sugar_per_100g: per100.sugar_g ?? 0,
                sodium_per_100g: (per100.sodium_mg ?? 0) / 1000,
            }, amount);
            return {
                food_name: this.libraryItemValue.display_name,
                serving_size: `${this.formatAmount(amount)}g`,
                meal_type: this.getSelectedMealType(),
                ...serving,
                source: this.libraryItemValue.source,
                source_ref: this.libraryItemValue.barcode ?? this.libraryItemValue.source_ref,
            };
        }
        const multiplier = Math.max(0.1, amount);
        return {
            food_name: this.libraryItemValue.display_name,
            serving_size: multiplier === 1
                ? (this.libraryItemValue.serving_label ?? '1 serving')
                : `${this.formatAmount(multiplier)} x ${this.libraryItemValue.serving_label ?? 'serving'}`,
            meal_type: this.getSelectedMealType(),
            calories: (this.libraryItemValue.calories ?? 0) * multiplier,
            protein_g: (this.libraryItemValue.protein_g ?? 0) * multiplier,
            carbs_g: (this.libraryItemValue.carbs_g ?? 0) * multiplier,
            fat_g: (this.libraryItemValue.fat_g ?? 0) * multiplier,
            fiber_g: (this.libraryItemValue.fiber_g ?? 0) * multiplier,
            sugar_g: (this.libraryItemValue.sugar_g ?? 0) * multiplier,
            sodium_mg: (this.libraryItemValue.sodium_mg ?? 0) * multiplier,
            source: this.libraryItemValue.source,
            source_ref: this.libraryItemValue.barcode ?? this.libraryItemValue.source_ref,
        };
    }
    handleLog() {
        const amount = this.getServingAmount();
        const detail = this.calculateServing(amount);
        if (detail) {
            this.dispatchEventWithDetail('health:log-food', detail);
        }
    }
    renderNutritionReference(values) {
        const shadow = this.shadowRoot;
        shadow.getElementById('cal-100').textContent = String(Math.round(values.calories));
        shadow.getElementById('protein-100').textContent = this.formatNutritionValue(values.protein_g);
        shadow.getElementById('carbs-100').textContent = this.formatNutritionValue(values.carbs_g);
        shadow.getElementById('fat-100').textContent = this.formatNutritionValue(values.fat_g);
    }
    renderPortionPresets() {
        const container = this.shadowRoot.getElementById('portion-presets');
        container.replaceChildren();
        const presets = OpenFoodFactsService.getPortionPresets(this.defaultGrams);
        for (const preset of presets) {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.type = 'button';
            btn.textContent = `x${preset.multiplier} (${preset.grams}g)`;
            btn.addEventListener('click', () => {
                const input = this.shadowRoot.getElementById('serving-size');
                const current = Number.parseFloat(input.value) || this.defaultGrams;
                const next = Math.max(0.1, current * preset.multiplier);
                input.value = this.formatAmount(next);
                this.updateServingDisplay();
            });
            container.appendChild(btn);
        }
    }
    adjustServing(direction) {
        const shadow = this.shadowRoot;
        const input = shadow.getElementById('serving-size');
        const current = Number.parseFloat(input.value) || 0;
        const hasVariableWeight = Boolean(this.productValue || this.getLibraryPer100(this.libraryItemValue));
        const step = hasVariableWeight ? OpenFoodFactsService.getServingStep(current) : 1;
        input.value = this.formatAmount(Math.max(0.1, current + direction * step));
        this.updateServingDisplay();
    }
    formatNutritionValue(value) {
        return Number(value.toFixed(2)).toString();
    }
    formatAmount(value) {
        return Number(value.toFixed(2)).toString();
    }
    getServingAmount() {
        const input = this.shadowRoot.getElementById('serving-size');
        return Math.max(0.1, Number.parseFloat(input.value) || 0.1);
    }
    applyMealTypeSelection() {
        const mealSelect = this.shadowRoot?.getElementById('meal-type');
        if (mealSelect) {
            mealSelect.value = this.defaultMealTypeValue ?? getDefaultMealType();
        }
    }
    getSelectedMealType() {
        return this.shadowRoot?.getElementById('meal-type')?.value ?? getDefaultMealType();
    }
    getLibraryPer100(item) {
        if (!item?.per_100g_json)
            return null;
        try {
            return JSON.parse(item.per_100g_json);
        }
        catch {
            return null;
        }
    }
    dispatchEventWithDetail(type, detail) {
        const CustomEventCtor = this.ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
        this.dispatchEvent(new CustomEventCtor(type, {
            bubbles: true,
            composed: true,
            detail,
        }));
    }
}
customElements.define('food-log-detail', FoodLogDetail);
