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
    const sampleLibraryItem = {
        id: 1,
        canonical_name: 'breakfast bread',
        display_name: 'Breakfast bread',
        serving_label: '1 serving',
        calories: 740.05,
        protein_g: 41.97,
        carbs_g: 61.93,
        fat_g: 33.64,
        fiber_g: 11.25,
        sugar_g: 0.28,
        sodium_mg: 225.98,
        source: 'mfp_import',
        source_ref: '90037322296549',
        use_count: 3,
        last_used_at: '2026-03-21T10:00:00Z',
        created_at: '2026-03-21T10:00:00Z',
        updated_at: '2026-03-21T10:00:00Z',
    };
    await t.test('showProduct displays product details', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct(sampleProduct);
        const shadow = el.shadowRoot;
        const detailShadow = getDetailShadow(el);
        assert.strictEqual(detailShadow.getElementById('product-name').textContent, 'Chocomel');
        assert.strictEqual(detailShadow.getElementById('product-brand').textContent, 'Chocomel');
        assert.strictEqual(detailShadow.getElementById('cal-100').textContent, '82');
        assert.strictEqual(detailShadow.getElementById('protein-100').textContent, '3.1');
        assert.strictEqual(detailShadow.getElementById('carbs-100').textContent, '11');
        assert.strictEqual(detailShadow.getElementById('fat-100').textContent, '2.7');
        // Detail view visible, search hidden
        assert.strictEqual(shadow.getElementById('detail-view').hidden, false);
        assert.strictEqual(shadow.getElementById('search-view').hidden, true);
        // Image shown
        const img = detailShadow.getElementById('product-image');
        assert.strictEqual(img.hidden, false);
        assert.strictEqual(img.src, 'https://example.com/img.jpg');
        dom.window.document.body.removeChild(el);
    });
    await t.test('showProduct hides image when not available', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct({ ...sampleProduct, image_url: undefined });
        const img = getDetailShadow(el).getElementById('product-image');
        assert.strictEqual(img.hidden, true);
        dom.window.document.body.removeChild(el);
    });
    await t.test('serving size updates calculated nutrition', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct(sampleProduct);
        const detailShadow = getDetailShadow(el);
        // Default 100g → same as per 100g
        assert.strictEqual(detailShadow.getElementById('cal-serving').textContent, '82');
        // Change to 250g
        const servingInput = detailShadow.getElementById('serving-size');
        servingInput.value = '250';
        servingInput.dispatchEvent(new dom.window.Event('input'));
        assert.strictEqual(detailShadow.getElementById('cal-serving').textContent, '205');
        assert.strictEqual(detailShadow.getElementById('protein-serving').textContent, '7.75');
        dom.window.document.body.removeChild(el);
    });
    await t.test('log button fires onLog with correct data', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let loggedEntry = null;
        el.addEventListener('health:log-food', (event) => {
            loggedEntry = event.detail;
        });
        el.showProduct(sampleProduct);
        const detailShadow = getDetailShadow(el);
        // Set serving to 200g, meal to Lunch
        detailShadow.getElementById('serving-size').value = '200';
        detailShadow.getElementById('meal-type').value = 'Lunch';
        servingInput_dispatchEvent(detailShadow, dom);
        detailShadow.getElementById('log-btn').click();
        assert.ok(loggedEntry);
        assert.strictEqual(loggedEntry.food_name, 'Chocomel');
        assert.strictEqual(loggedEntry.serving_size, '200g');
        assert.strictEqual(loggedEntry.meal_type, 'Lunch');
        assert.strictEqual(loggedEntry.calories, 164);
        assert.strictEqual(loggedEntry.source, 'openfoodfacts');
        assert.strictEqual(loggedEntry.source_ref, '8710400500247');
        dom.window.document.body.removeChild(el);
    });
    await t.test('log event is emitted only once from detail interactions', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let logCount = 0;
        el.addEventListener('health:log-food', () => {
            logCount += 1;
        });
        el.showProduct(sampleProduct);
        getDetailShadow(el).getElementById('log-btn').click();
        assert.strictEqual(logCount, 1);
        dom.window.document.body.removeChild(el);
    });
    await t.test('back button returns to search view', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let backCalled = false;
        el.addEventListener('health:food-log-back', () => { backCalled = true; });
        el.showProduct(sampleProduct);
        getDetailShadow(el).getElementById('back-btn').click();
        assert.strictEqual(el.shadowRoot.getElementById('search-view').hidden, false);
        assert.strictEqual(el.shadowRoot.getElementById('detail-view').hidden, true);
        assert.ok(backCalled);
        dom.window.document.body.removeChild(el);
    });
    await t.test('alt actions visibility follows screen flags', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        const actions = el.shadowRoot.getElementById('alt-log-actions');
        const scanButton = el.shadowRoot.getElementById('scan-btn');
        const aiButton = el.shadowRoot.getElementById('ai-btn');
        assert.strictEqual(actions.hidden, true);
        el.showScanBarcodeAction = true;
        assert.strictEqual(actions.hidden, false);
        assert.strictEqual(scanButton.hidden, false);
        assert.strictEqual(aiButton.hidden, true);
        el.showAiEstimateAction = true;
        assert.strictEqual(aiButton.hidden, false);
        dom.window.document.body.removeChild(el);
    });
    await t.test('lookupBarcode shows error when product not found', async () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        global.fetch = mock.fn(async (url) => {
            if (url.includes('/food-library/barcode/')) {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                };
            }
            return {
                ok: true,
                json: async () => ({ status: 0 }),
            };
        });
        await el.lookupBarcode('0000000000000');
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('search-view').hidden, false);
        const errorEl = shadow.getElementById('search-error');
        assert.ok(errorEl.textContent.includes('not found'));
        assert.strictEqual(errorEl.hidden, false);
        dom.window.document.body.removeChild(el);
    });
    await t.test('lookupBarcode shows product on success', async () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        global.fetch = mock.fn(async (url) => {
            if (url.includes('/food-library/barcode/')) {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                };
            }
            return {
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
            };
        });
        await el.lookupBarcode('1234567890123');
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('detail-view').hidden, false);
        assert.strictEqual(getDetailShadow(el).getElementById('product-name').textContent, 'Test Product');
        dom.window.document.body.removeChild(el);
    });
    await t.test('showLibraryItem displays fixed-serving library item and logs it', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        let loggedEntry = null;
        el.addEventListener('health:log-food', (event) => {
            loggedEntry = event.detail;
        });
        el.showLibraryItem(sampleLibraryItem);
        const detailShadow = getDetailShadow(el);
        assert.strictEqual(detailShadow.getElementById('product-name').textContent, 'Breakfast bread');
        assert.strictEqual(detailShadow.getElementById('serving-size-label').textContent, 'Servings');
        assert.strictEqual(detailShadow.getElementById('nutrition-reference-label').textContent, 'Per serving');
        detailShadow.getElementById('serving-size').value = '2';
        detailShadow.getElementById('log-btn').click();
        assert.ok(loggedEntry);
        assert.strictEqual(loggedEntry.food_name, 'Breakfast bread');
        assert.strictEqual(loggedEntry.serving_size, '2 x 1 serving');
        assert.strictEqual(loggedEntry.calories, 1480.1);
        assert.strictEqual(loggedEntry.source, 'mfp_import');
        dom.window.document.body.removeChild(el);
    });
    await t.test('portion presets apply relative scaling repeatedly', () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        el.showProduct(sampleProduct);
        const detailShadow = getDetailShadow(el);
        const presetButtons = Array.from(detailShadow.querySelectorAll('.preset-btn'));
        const doubleButton = presetButtons.find((button) => button.textContent?.startsWith('x2'));
        const halfButton = presetButtons.find((button) => button.textContent?.startsWith('x0.5'));
        const servingInput = detailShadow.getElementById('serving-size');
        assert.ok(doubleButton);
        assert.ok(halfButton);
        assert.strictEqual(servingInput.value, '100');
        doubleButton.click();
        assert.strictEqual(servingInput.value, '200');
        doubleButton.click();
        assert.strictEqual(servingInput.value, '400');
        halfButton.click();
        assert.strictEqual(servingInput.value, '200');
        dom.window.document.body.removeChild(el);
    });
    await t.test('library search result selection opens item detail', async () => {
        const el = dom.window.document.createElement('food-log');
        dom.window.document.body.appendChild(el);
        global.fetch = mock.fn(async (url) => {
            if (url.includes('/food-library/search')) {
                return {
                    ok: true,
                    json: async () => [sampleLibraryItem],
                };
            }
            if (url.includes('/openfoodfacts/search')) {
                return {
                    ok: true,
                    json: async () => ({ products: [] }),
                };
            }
            throw new Error(`Unexpected fetch: ${url}`);
        });
        const searchInput = el.shadowRoot.getElementById('search-input');
        searchInput.value = 'bread';
        searchInput.dispatchEvent(new dom.window.Event('input'));
        await new Promise((resolve) => setTimeout(resolve, 350));
        await new Promise((resolve) => setTimeout(resolve, 0));
        const resultsComponent = el.shadowRoot.getElementById('search-results-component');
        const libraryRow = resultsComponent.shadowRoot.querySelector('.search-result-item');
        assert.ok(libraryRow);
        libraryRow.click();
        assert.strictEqual(el.shadowRoot.getElementById('detail-view').hidden, false);
        assert.strictEqual(getDetailShadow(el).getElementById('product-name').textContent, 'Breakfast bread');
        dom.window.document.body.removeChild(el);
    });
});
function getDetailShadow(el) {
    const detail = el.shadowRoot.getElementById('detail-component');
    if (!detail.shadowRoot) {
        throw new Error('Expected nested detail component shadow root');
    }
    return detail.shadowRoot;
}
function servingInput_dispatchEvent(shadow, dom) {
    const servingInput = shadow.getElementById('serving-size');
    servingInput.dispatchEvent(new dom.window.Event('input'));
}
