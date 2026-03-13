import { test, mock } from 'node:test';
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
test('FoodLog component', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.Event = dom.window.Event;
    global.CustomEvent = dom.window.CustomEvent;
    global.Node = dom.window.Node;
    global.HTMLImageElement = dom.window.HTMLImageElement;
    const { FoodLog } = await import('./food-log.component.js');
    const sampleProduct = {
        product_name: 'Chocomel',
        brands: 'Chocomel',
        image_url: 'https://example.com/img.jpg',
        barcode: '8710400500247',
        calories_per_100g: 82,
        protein_per_100g: 3.1,
        carbs_per_100g: 11,
        fat_per_100g: 2.7,
        fiber_per_100g: 0.8,
        sugar_per_100g: 10.5,
        sodium_per_100g: 0.05,
    };
    await t.test('showProduct displays product details', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct(sampleProduct);
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('product-name').textContent, 'Chocomel');
        assert.strictEqual(shadow.getElementById('product-brand').textContent, 'Chocomel');
        assert.strictEqual(shadow.getElementById('cal-100').textContent, '82');
        assert.strictEqual(shadow.getElementById('protein-100').textContent, '3.1');
        assert.strictEqual(shadow.getElementById('carbs-100').textContent, '11');
        assert.strictEqual(shadow.getElementById('fat-100').textContent, '2.7');
        // Detail view visible, search hidden
        assert.strictEqual(shadow.getElementById('detail-view').style.display, '');
        assert.strictEqual(shadow.getElementById('search-view').style.display, 'none');
        // Image shown
        const img = shadow.getElementById('product-image');
        assert.strictEqual(img.style.display, '');
        assert.strictEqual(img.src, 'https://example.com/img.jpg');
        dom.window.document.body.removeChild(el);
    });
    await t.test('showProduct hides image when not available', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct({ ...sampleProduct, image_url: undefined });
        const img = el.shadowRoot.getElementById('product-image');
        assert.strictEqual(img.style.display, 'none');
        dom.window.document.body.removeChild(el);
    });
    await t.test('serving size updates calculated nutrition', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct(sampleProduct);
        const shadow = el.shadowRoot;
        // Default 100g → same as per 100g
        assert.strictEqual(shadow.getElementById('cal-serving').textContent, '82');
        // Change to 250g
        const servingInput = shadow.getElementById('serving-size');
        servingInput.value = '250';
        servingInput.dispatchEvent(new dom.window.Event('input'));
        assert.strictEqual(shadow.getElementById('cal-serving').textContent, '205');
        assert.strictEqual(shadow.getElementById('protein-serving').textContent, '7.75');
        dom.window.document.body.removeChild(el);
    });
    await t.test('log button fires onLog with correct data', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let loggedEntry = null;
        el.onLog = (entry) => { loggedEntry = entry; };
        el.showProduct(sampleProduct);
        const shadow = el.shadowRoot;
        // Set serving to 200g, meal to Lunch
        shadow.getElementById('serving-size').value = '200';
        shadow.getElementById('meal-type').value = 'Lunch';
        servingInput_dispatchEvent(shadow, dom);
        shadow.getElementById('log-btn').click();
        assert.ok(loggedEntry);
        assert.strictEqual(loggedEntry.food_name, 'Chocomel');
        assert.strictEqual(loggedEntry.serving_size, '200g');
        assert.strictEqual(loggedEntry.meal_type, 'Lunch');
        assert.strictEqual(loggedEntry.calories, 164);
        assert.strictEqual(loggedEntry.source, 'openfoodfacts');
        assert.strictEqual(loggedEntry.source_ref, '8710400500247');
        dom.window.document.body.removeChild(el);
    });
    await t.test('back button returns to search view', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let backCalled = false;
        el.onBack = () => { backCalled = true; };
        el.showProduct(sampleProduct);
        el.shadowRoot.getElementById('back-btn').click();
        assert.strictEqual(el.shadowRoot.getElementById('search-view').style.display, '');
        assert.strictEqual(el.shadowRoot.getElementById('detail-view').style.display, 'none');
        assert.ok(backCalled);
        dom.window.document.body.removeChild(el);
    });
    await t.test('lookupBarcode shows error when product not found', async () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => ({ status: 0 }),
        }));
        await el.lookupBarcode('0000000000000');
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('search-view').style.display, '');
        const errorEl = shadow.getElementById('search-error');
        assert.ok(errorEl.textContent.includes('not found'));
        assert.strictEqual(errorEl.style.display, '');
        dom.window.document.body.removeChild(el);
    });
    await t.test('lookupBarcode shows product on success', async () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => ({
                status: 1,
                product: {
                    product_name: 'Test Product',
                    brands: 'Brand',
                    nutriments: {
                        'energy-kcal_100g': 100,
                        'proteins_100g': 5,
                        'carbohydrates_100g': 20,
                        'fat_100g': 3,
                        'fiber_100g': 1,
                        'sugars_100g': 2,
                        'sodium_100g': 0.01,
                    },
                },
            }),
        }));
        await el.lookupBarcode('1234567890123');
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('detail-view').style.display, '');
        assert.strictEqual(shadow.getElementById('product-name').textContent, 'Test Product');
        dom.window.document.body.removeChild(el);
    });
});
function servingInput_dispatchEvent(shadow, dom) {
    const servingInput = shadow.getElementById('serving-size');
    servingInput.dispatchEvent(new dom.window.Event('input'));
}
