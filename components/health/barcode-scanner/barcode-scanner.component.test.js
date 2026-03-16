import { test, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { register } from 'node:module';
// Register a loader that stubs .css imports with an empty object
register('data:text/javascript,' + encodeURIComponent(`
export async function load(url, context, nextLoad) {
    if (url.endsWith('.css') || (context.importAttributes && context.importAttributes.type === 'css')) {
        return {
            shortCircuit: true,
            format: 'module',
            source: 'export default {};',
        };
    }
    return nextLoad(url, context);
}
`));
test('BarcodeScanner component', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.Event = dom.window.Event;
    global.CustomEvent = dom.window.CustomEvent;
    global.Node = dom.window.Node;
    Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
    global.navigator.mediaDevices = {
        getUserMedia: async () => ({
            getTracks: () => []
        })
    };
    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
    // BarcodeDetector not available by default
    delete dom.window.BarcodeDetector;
    delete global.BarcodeDetector;
    const { BarcodeScanner } = await import('./barcode-scanner.component.js');
    await t.test('shows manual fallback when BarcodeDetector is unavailable', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        const shadow = el.shadowRoot;
        const permissionPrompt = shadow.getElementById('permission-prompt');
        const fallback = shadow.getElementById('fallback');
        assert.strictEqual(permissionPrompt.style.display, 'none');
        assert.strictEqual(fallback.style.display, '');
        dom.window.document.body.removeChild(el);
    });
    await t.test('manual entry fires onBarcodeDetected callback', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        let detectedBarcode = '';
        el.onBarcodeDetected = (barcode) => { detectedBarcode = barcode; };
        const shadow = el.shadowRoot;
        const input = shadow.getElementById('manual-input');
        const btn = shadow.getElementById('manual-btn');
        input.value = '8710400500247';
        btn.click();
        assert.strictEqual(detectedBarcode, '8710400500247');
        dom.window.document.body.removeChild(el);
    });
    await t.test('manual entry shows error for empty input', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        const shadow = el.shadowRoot;
        const input = shadow.getElementById('manual-input');
        const btn = shadow.getElementById('manual-btn');
        input.value = '';
        btn.click();
        const status = shadow.getElementById('status');
        assert.ok(status.textContent.includes('enter a barcode'));
        assert.ok(status.className.includes('error'));
        dom.window.document.body.removeChild(el);
    });
    await t.test('shows detected barcode after manual entry', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        el.onBarcodeDetected = () => { };
        const shadow = el.shadowRoot;
        const input = shadow.getElementById('manual-input');
        input.value = '1234567890';
        shadow.getElementById('manual-btn').click();
        const detected = shadow.getElementById('detected');
        assert.strictEqual(detected.style.display, '');
        assert.ok(detected.textContent.includes('1234567890'));
        dom.window.document.body.removeChild(el);
    });
    await t.test('reset clears state', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        el.onBarcodeDetected = () => { };
        const shadow = el.shadowRoot;
        const input = shadow.getElementById('manual-input');
        input.value = '1234567890';
        shadow.getElementById('manual-btn').click();
        // Now reset
        el.reset();
        const detected = shadow.getElementById('detected');
        assert.strictEqual(detected.style.display, 'none');
        assert.strictEqual(shadow.getElementById('status').textContent, '');
        assert.strictEqual(input.value, '');
        dom.window.document.body.removeChild(el);
    });
    await t.test('shows camera prompt when BarcodeDetector is available', () => {
        // Temporarily make BarcodeDetector available
        dom.window.BarcodeDetector = class {
        };
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        const shadow = el.shadowRoot;
        const permissionPrompt = shadow.getElementById('permission-prompt');
        const fallback = shadow.getElementById('fallback');
        assert.notStrictEqual(permissionPrompt.style.display, 'none');
        assert.strictEqual(fallback.style.display, 'none');
        dom.window.document.body.removeChild(el);
        delete dom.window.BarcodeDetector;
    });
    await t.test('stopCamera cleans up stream tracks', () => {
        const el = dom.window.document.createElement('barcode-scanner');
        dom.window.document.body.appendChild(el);
        // Simulate a stream
        const mockStop = mock.fn();
        el._stream = { getTracks: () => [{ stop: mockStop }] };
        el.stopCamera();
        assert.strictEqual(mockStop.mock.callCount(), 1);
        assert.strictEqual(el._stream, null);
        dom.window.document.body.removeChild(el);
    });
});
