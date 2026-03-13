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
            { date: today, total_calories: 2000, total_protein_g: 80, total_carbs_g: 250, total_fat_g: 70, entry_count: 4 },
        ];
        el.weekSummary = summaries;
        const bars = el.shadowRoot.getElementById('trend-bars');
        const barWrappers = bars.querySelectorAll('.trend-bar-wrapper');
        assert.strictEqual(barWrappers.length, 7);
        // Trend section visible
        assert.strictEqual(el.shadowRoot.getElementById('trend-section').style.display, '');
        dom.window.document.body.removeChild(el);
    });
    await t.test('weekSummary hides trend when empty', () => {
        const el = dom.window.document.createElement('nutrition-widget');
        dom.window.document.body.appendChild(el);
        el.weekSummary = [];
        assert.strictEqual(el.shadowRoot.getElementById('trend-section').style.display, 'none');
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
});
