import { test } from 'node:test';
import assert from 'node:assert';
import { NutritionEdit } from './nutrition-edit.component.js';
function makeEntry(overrides = {}) {
    return {
        id: 1,
        date: '2026-03-15',
        meal_type: 'Lunch',
        food_name: 'Chicken breast',
        serving_size: '150g',
        calories: 248,
        protein_g: 47,
        carbs_g: 0,
        fat_g: 5,
        fiber_g: 0,
        sugar_g: 0,
        source: 'manual',
        created_at: '2026-03-15T12:00:00Z',
        ...overrides,
    };
}
test('NutritionEdit Component', async (t) => {
    await t.test('populates form from entry', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry();
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('food-name').value, 'Chicken breast');
        assert.strictEqual(shadow.getElementById('macro-cal').value, '248');
        assert.strictEqual(shadow.getElementById('macro-protein').value, '47');
        assert.strictEqual(shadow.getElementById('meal-type').value, 'Lunch');
    });
    await t.test('food name is read-only for openfoodfacts entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'openfoodfacts' });
        const nameInput = el.shadowRoot.getElementById('food-name');
        assert.strictEqual(nameInput.readOnly, true);
    });
    await t.test('food name is editable for ai_estimate entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'ai_estimate' });
        const nameInput = el.shadowRoot.getElementById('food-name');
        assert.strictEqual(nameInput.readOnly, false);
    });
    await t.test('food name is editable for manual entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'manual' });
        const nameInput = el.shadowRoot.getElementById('food-name');
        assert.strictEqual(nameInput.readOnly, false);
    });
    await t.test('shows serving controls for openfoodfacts entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'openfoodfacts', serving_size: '100g' });
        const servingSection = el.shadowRoot.getElementById('serving-section');
        assert.strictEqual(servingSection.hidden, false);
    });
    await t.test('shows serving controls for ai_estimate entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'ai_estimate' });
        const servingSection = el.shadowRoot.getElementById('serving-section');
        assert.strictEqual(servingSection.hidden, false);
    });
    await t.test('hides serving controls for manual entries', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'manual' });
        const servingSection = el.shadowRoot.getElementById('serving-section');
        assert.strictEqual(servingSection.hidden, true);
    });
    await t.test('shows source badge', () => {
        const el = new NutritionEdit();
        el.entry = makeEntry({ source: 'ai_estimate' });
        const badge = el.shadowRoot.getElementById('source-badge');
        assert.strictEqual(badge.textContent, 'AI Estimate');
    });
    await t.test('fires save with updated values', () => {
        return new Promise((resolve) => {
            const el = new NutritionEdit();
            document.body.appendChild(el);
            el.entry = makeEntry();
            el.onSave = (id, updates) => {
                assert.strictEqual(id, 1);
                assert.strictEqual(updates.food_name, 'Chicken breast');
                assert.strictEqual(updates.meal_type, 'Lunch');
                assert.strictEqual(updates.calories, 248);
                el.remove();
                resolve();
            };
            el.shadowRoot.getElementById('btn-save').click();
        });
    });
    await t.test('fires delete with confirmation', () => {
        return new Promise((resolve) => {
            const el = new NutritionEdit();
            document.body.appendChild(el);
            el.entry = makeEntry();
            // Mock confirm
            const origConfirm = globalThis.confirm;
            globalThis.confirm = () => true;
            el.onDelete = (id) => {
                assert.strictEqual(id, 1);
                globalThis.confirm = origConfirm;
                el.remove();
                resolve();
            };
            el.shadowRoot.getElementById('btn-delete').click();
        });
    });
});
