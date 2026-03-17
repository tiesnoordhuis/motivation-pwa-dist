import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { register } from 'node:module';
// Stub CSS imports
register('data:text/javascript,' + encodeURIComponent(`
export async function load(url, context, nextLoad) {
    if (url.endsWith('.css') || (context.importAttributes && context.importAttributes.type === 'css')) {
        return { shortCircuit: true, format: 'module', source: 'export default {};' };
    }
    return nextLoad(url, context);
}
`));
test('NutritionWidget component', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.Node = dom.window.Node;
    global.localStorage = dom.window.localStorage;
    const { NutritionWidget } = await import('./nutrition-widget.component.js');
    function makeEntry(overrides = {}) {
        return {
            id: 1, date: '2025-01-15', meal_type: 'Breakfast', food_name: 'Oats',
            calories: 300, protein_g: 10, carbs_g: 50, fat_g: 8,
            source: 'manual', created_at: '2025-01-15T08:00:00Z',
            ...overrides,
        };
    }
    await t.test('todayEntries updates summary values', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        el.todayEntries = [
            makeEntry({ calories: 300, protein_g: 10, carbs_g: 50, fat_g: 8 }),
            makeEntry({ id: 2, calories: 500, protein_g: 25, carbs_g: 60, fat_g: 15 }),
        ];
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('today-cal').textContent, '800');
        assert.strictEqual(shadow.getElementById('today-protein').textContent, '35g');
        assert.strictEqual(shadow.getElementById('today-carbs').textContent, '110g');
        assert.strictEqual(shadow.getElementById('today-fat').textContent, '23g');
        dom.window.document.body.removeChild(el);
    });
    await t.test('todayEntries with empty list shows zeros', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        el.todayEntries = [];
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('today-cal').textContent, '0');
        assert.strictEqual(shadow.getElementById('today-protein').textContent, '0g');
        // Empty state visible
        assert.strictEqual(shadow.getElementById('empty-state').style.display, '');
        dom.window.document.body.removeChild(el);
    });
    await t.test('weekSummary renders 7 bars', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        const today = new Date().toISOString().split('T')[0];
        const summaries = [
            { date: today, total_calories: 2500, total_protein_g: 80, total_carbs_g: 250, total_fat_g: 70, entry_count: 4 },
        ];
        el.weekSummary = summaries;
        const bars = el.shadowRoot.getElementById('trend-bars');
        const barWrappers = bars.querySelectorAll('.trend-bar-wrapper');
        assert.strictEqual(barWrappers.length, 7);
        // Trend section visible
        assert.strictEqual(el.shadowRoot.getElementById('trend-section').hidden, false);
        dom.window.document.body.removeChild(el);
    });
    await t.test('weekSummary hides trend when empty', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        el.weekSummary = [];
        assert.strictEqual(el.shadowRoot.getElementById('trend-section').hidden, true);
        dom.window.document.body.removeChild(el);
    });
    await t.test('handles entries with missing nutrition values', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        el.todayEntries = [
            makeEntry({ calories: undefined, protein_g: undefined, carbs_g: undefined, fat_g: undefined }),
        ];
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('today-cal').textContent, '0');
        assert.strictEqual(shadow.getElementById('today-protein').textContent, '0g');
        dom.window.document.body.removeChild(el);
    });
    await t.test('weekSummary renders target line', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        const today = new Date().toISOString().split('T')[0];
        const summaries = [
            { date: today, total_calories: 2500, total_protein_g: 100, total_carbs_g: 300, total_fat_g: 90, entry_count: 5 },
        ];
        el.weekSummary = summaries;
        const shadow = el.shadowRoot;
        const targetLine = shadow.getElementById('target-line');
        assert.notStrictEqual(targetLine.style.display, 'none');
        // Target label should show the target value
        const targetLabel = shadow.getElementById('target-label');
        assert.strictEqual(targetLabel.textContent, '2500');
        dom.window.document.body.removeChild(el);
    });
    await t.test('weekSummary marks bars over target', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        const today = new Date().toISOString().split('T')[0];
        const summaries = [
            { date: today, total_calories: 2800, total_protein_g: 100, total_carbs_g: 300, total_fat_g: 90, entry_count: 5 },
        ];
        el.weekSummary = summaries;
        const shadow = el.shadowRoot;
        const bars = shadow.querySelectorAll('.trend-bar');
        // Today's bar should have over-target class (2800 > 2500)
        const todayBar = bars[bars.length - 1]; // Last bar is today
        assert.ok(todayBar.classList.contains('over-target'));
        dom.window.document.body.removeChild(el);
    });
    await t.test('calorieTarget defaults to 2500 and can be changed', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        assert.strictEqual(el.calorieTarget, 2500);
        el.calorieTarget = 1800;
        assert.strictEqual(el.calorieTarget, 1800);
        dom.window.document.body.removeChild(el);
    });
});
