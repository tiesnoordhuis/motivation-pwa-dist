import styles from './nutrition-edit.css' with { type: 'css' };
import { MEAL_TYPES } from '@motivation/shared';
const template = document.createElement('template');
template.innerHTML = `
    <div class="edit-container">
        <div class="edit-header">
            <h3>Edit Entry</h3>
            <span class="source-badge" id="source-badge"></span>
        </div>

        <input type="text" id="food-name" class="food-name-input" placeholder="Food name">

        <div class="macro-grid">
            <div class="macro-item">
                <input type="number" id="macro-cal" class="macro-input" min="0">
                <span class="macro-label">kcal</span>
            </div>
            <div class="macro-item">
                <input type="number" id="macro-protein" class="macro-input" min="0">
                <span class="macro-label">protein</span>
            </div>
            <div class="macro-item">
                <input type="number" id="macro-carbs" class="macro-input" min="0">
                <span class="macro-label">carbs</span>
            </div>
            <div class="macro-item">
                <input type="number" id="macro-fat" class="macro-input" min="0">
                <span class="macro-label">fat</span>
            </div>
        </div>

        <div class="extra-macros">
            <div class="extra-macro-item">
                <span class="extra-macro-label">Fiber (g)</span>
                <input type="number" id="macro-fiber" class="extra-macro-input" min="0">
            </div>
            <div class="extra-macro-item">
                <span class="extra-macro-label">Sugar (g)</span>
                <input type="number" id="macro-sugar" class="extra-macro-input" min="0">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group serving-group" id="serving-section">
                <label for="serving-size">Serving (g)</label>
                <div class="serving-controls">
                    <button class="btn-step" id="step-down">−</button>
                    <input type="number" id="serving-size" class="serving-input" min="1" value="100">
                    <button class="btn-step" id="step-up">+</button>
                </div>
            </div>
            <div class="form-group">
                <label for="meal-type">Meal</label>
                <select id="meal-type" class="form-select">
                    ${MEAL_TYPES.map(m => `<option value="${m}">${m}</option>`).join('\n                    ')}
                </select>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn-delete" id="btn-delete">Delete</button>
            <button class="btn-save" id="btn-save">Save</button>
        </div>
    </div>
`;
const SOURCE_LABELS = {
    manual: 'Manual',
    openfoodfacts: 'Open Food Facts',
    ai_estimate: 'AI Estimate',
};
export class NutritionEdit extends HTMLElement {
    _entry = null;
    _per100 = null;
    _onSave = null;
    _onDelete = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('btn-save').addEventListener('click', () => this.handleSave());
        shadow.getElementById('btn-delete').addEventListener('click', () => this.handleDelete());
        shadow.getElementById('step-down').addEventListener('click', () => this.adjustServing(-1));
        shadow.getElementById('step-up').addEventListener('click', () => this.adjustServing(1));
        const servingInput = shadow.getElementById('serving-size');
        servingInput.addEventListener('input', () => this.recalcFromServing());
    }
    set onSave(handler) {
        this._onSave = handler;
    }
    set onDelete(handler) {
        this._onDelete = handler;
    }
    set entry(val) {
        this._entry = val;
        this.populateForm();
    }
    get entry() {
        return this._entry;
    }
    populateForm() {
        const e = this._entry;
        if (!e)
            return;
        const shadow = this.shadowRoot;
        // Source badge
        const badge = shadow.getElementById('source-badge');
        badge.textContent = SOURCE_LABELS[e.source] ?? e.source;
        // Food name (read-only for openfoodfacts)
        const nameInput = shadow.getElementById('food-name');
        nameInput.value = e.food_name ?? '';
        nameInput.readOnly = e.source === 'openfoodfacts';
        // Macros
        shadow.getElementById('macro-cal').value = String(e.calories ?? 0);
        shadow.getElementById('macro-protein').value = String(e.protein_g ?? 0);
        shadow.getElementById('macro-carbs').value = String(e.carbs_g ?? 0);
        shadow.getElementById('macro-fat').value = String(e.fat_g ?? 0);
        shadow.getElementById('macro-fiber').value = String(e.fiber_g ?? 0);
        shadow.getElementById('macro-sugar').value = String(e.sugar_g ?? 0);
        // Meal type
        shadow.getElementById('meal-type').value = e.meal_type;
        // Serving size — show controls for openfoodfacts/ai_estimate
        const servingSection = shadow.getElementById('serving-section');
        if (e.source === 'openfoodfacts' || e.source === 'ai_estimate') {
            servingSection.hidden = false;
            const servingGrams = parseInt(e.serving_size ?? '100', 10) ?? 100;
            shadow.getElementById('serving-size').value = String(servingGrams);
            // Store per-100g values for recalculation
            if (servingGrams > 0) {
                this._per100 = {
                    calories: ((e.calories ?? 0) / servingGrams) * 100,
                    protein_g: ((e.protein_g ?? 0) / servingGrams) * 100,
                    carbs_g: ((e.carbs_g ?? 0) / servingGrams) * 100,
                    fat_g: ((e.fat_g ?? 0) / servingGrams) * 100,
                    fiber_g: ((e.fiber_g ?? 0) / servingGrams) * 100,
                    sugar_g: ((e.sugar_g ?? 0) / servingGrams) * 100,
                };
            }
        }
        else {
            servingSection.hidden = true;
            this._per100 = null;
        }
    }
    recalcFromServing() {
        if (!this._per100)
            return;
        const shadow = this.shadowRoot;
        const grams = parseInt(shadow.getElementById('serving-size').value, 10) ?? 0;
        const ratio = grams / 100;
        shadow.getElementById('macro-cal').value = String(Math.round(this._per100.calories * ratio));
        shadow.getElementById('macro-protein').value = String(Math.round(this._per100.protein_g * ratio));
        shadow.getElementById('macro-carbs').value = String(Math.round(this._per100.carbs_g * ratio));
        shadow.getElementById('macro-fat').value = String(Math.round(this._per100.fat_g * ratio));
        shadow.getElementById('macro-fiber').value = String(Math.round(this._per100.fiber_g * ratio));
        shadow.getElementById('macro-sugar').value = String(Math.round(this._per100.sugar_g * ratio));
    }
    adjustServing(direction) {
        const shadow = this.shadowRoot;
        const input = shadow.getElementById('serving-size');
        const current = parseInt(input.value, 10) ?? 0;
        const step = current < 50 ? 5 : current < 200 ? 10 : 25;
        const newValue = Math.max(1, current + direction * step);
        input.value = String(newValue);
        this.recalcFromServing();
    }
    handleSave() {
        if (!this._entry || !this._onSave)
            return;
        const shadow = this.shadowRoot;
        const updates = {
            food_name: shadow.getElementById('food-name').value.trim(),
            meal_type: shadow.getElementById('meal-type').value,
            calories: parseInt(shadow.getElementById('macro-cal').value, 10) ?? 0,
            protein_g: parseInt(shadow.getElementById('macro-protein').value, 10) ?? 0,
            carbs_g: parseInt(shadow.getElementById('macro-carbs').value, 10) ?? 0,
            fat_g: parseInt(shadow.getElementById('macro-fat').value, 10) ?? 0,
            fiber_g: parseInt(shadow.getElementById('macro-fiber').value, 10) ?? 0,
            sugar_g: parseInt(shadow.getElementById('macro-sugar').value, 10) ?? 0,
        };
        // Include serving size if visible
        const servingSection = shadow.getElementById('serving-section');
        if (!servingSection.hidden) {
            const grams = parseInt(shadow.getElementById('serving-size').value, 10) ?? 100;
            updates.serving_size = `${grams}g`;
        }
        this._onSave(this._entry.id, updates);
    }
    handleDelete() {
        if (!this._entry || !this._onDelete)
            return;
        if (confirm(`Delete "${this._entry.food_name}"?`)) {
            this._onDelete(this._entry.id);
        }
    }
}
customElements.define('nutrition-edit', NutritionEdit);
