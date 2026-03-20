import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
function waitForTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}
test('Router', async (t) => {
    function setupDOM(hash = '') {
        const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <main id="route-outlet"></main>
</body>
</html>
        `, { url: `http://localhost/${hash ? hash : ''}` });
        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.customElements = dom.window.customElements;
        global.Node = dom.window.Node;
        global.CustomEvent = dom.window.CustomEvent;
        global.Event = dom.window.Event;
        return dom;
    }
    function createScreen(id) {
        const el = document.createElement('section');
        el.id = id;
        return el;
    }
    function createRoutes() {
        return {
            '#/': { render: () => createScreen('home-screen') },
            '#/goals': { render: () => createScreen('goals-screen') },
            '#/agenda': { render: () => createScreen('agenda-screen') },
            '#/health': { render: () => createScreen('health-screen') },
            '#/social': { render: () => createScreen('social-screen') },
            '#/vietnamese': { render: () => createScreen('vietnamese-screen') },
            '#/projects': { render: () => createScreen('projects-screen') },
            '#/todo': { render: () => createScreen('todo-screen') },
        };
    }
    await t.test('resolveRoute returns fallback for empty hash', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        assert.deepStrictEqual(router.resolveRoute(''), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#'), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/'), { route: '#/', params: {} });
    });
    await t.test('resolveRoute returns matching route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        assert.deepStrictEqual(router.resolveRoute('#/health'), { route: '#/health', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/social'), { route: '#/social', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/goals'), { route: '#/goals', params: {} });
    });
    await t.test('resolveRoute returns fallback for unknown route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        assert.deepStrictEqual(router.resolveRoute('#/unknown'), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/doesnotexist'), { route: '#/', params: {} });
    });
    await t.test('currentRoute starts empty before start()', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        assert.strictEqual(router.currentRoute, '');
    });
    await t.test('start() activates the home route in the outlet by default', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        assert.strictEqual(router.currentRoute, '#/');
        const outlet = document.getElementById('route-outlet');
        assert.strictEqual(outlet.firstElementChild?.id, 'home-screen');
    });
    await t.test('render is called every time a route is navigated to', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let renderCount = 0;
        const routes = createRoutes();
        routes['#/social'] = {
            render: () => {
                renderCount++;
                return createScreen('social-screen');
            },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        router.navigate('#/social');
        await waitForTick();
        router.navigate('#/');
        await waitForTick();
        router.navigate('#/social');
        await waitForTick();
        assert.strictEqual(renderCount, 2);
    });
    await t.test('navigate swaps the active screen in the outlet', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        router.navigate('#/health');
        await waitForTick();
        const outlet = document.getElementById('route-outlet');
        assert.strictEqual(outlet.childElementCount, 1);
        assert.strictEqual(outlet.firstElementChild?.id, 'health-screen');
    });
    await t.test('previousRoute tracks navigation history', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        assert.strictEqual(router.previousRoute, '');
        router.navigate('#/health');
        await waitForTick();
        assert.strictEqual(router.previousRoute, '#/');
        router.navigate('#/social');
        await waitForTick();
        assert.strictEqual(router.previousRoute, '#/health');
    });
    await t.test('all expected routes are supported', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const routes = createRoutes();
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        const expectedRoutes = ['#/', '#/goals', '#/agenda', '#/health', '#/social', '#/vietnamese', '#/projects', '#/todo'];
        for (const route of expectedRoutes) {
            assert.deepStrictEqual(router.resolveRoute(route), { route, params: {} }, `Route ${route} should be supported`);
        }
    });
    await t.test('resolveRoute supports dynamic parameters', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const routes = {
            '#/home': { render: () => createScreen('home-screen') },
            '#/user/:id': { render: () => createScreen('user-screen') },
            '#/health/day/:date': { render: () => createScreen('health-screen') },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        assert.deepStrictEqual(router.resolveRoute('#/user/123'), { route: '#/user/:id', params: { id: '123' } });
        assert.deepStrictEqual(router.resolveRoute('#/health/day/2026-03-14'), { route: '#/health/day/:date', params: { date: '2026-03-14' } });
        assert.deepStrictEqual(router.resolveRoute('#/health/day/'), { route: '#/', params: {} });
    });
    await t.test('render receives extracted parameters and query', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let capturedPath = '';
        let capturedParams;
        let capturedQuery = '';
        const routes = {
            ...createRoutes(),
            '#/item/:itemId': {
                render: (ctx) => {
                    capturedPath = ctx.path;
                    capturedParams = ctx.params;
                    capturedQuery = ctx.query.toString();
                    return createScreen('item-screen');
                },
            },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        router.navigate('#/item/42?mode=edit');
        await waitForTick();
        assert.strictEqual(capturedPath, '#/item/42');
        assert.deepStrictEqual(capturedParams, { itemId: '42' });
        assert.strictEqual(capturedQuery, 'mode=edit');
    });
    await t.test('removing the current screen triggers disconnectedCallback before the next screen mounts', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let disconnects = 0;
        class DisconnectProbe extends HTMLElement {
            disconnectedCallback() {
                disconnects++;
            }
        }
        if (!customElements.get('disconnect-probe')) {
            customElements.define('disconnect-probe', DisconnectProbe);
        }
        const routes = {
            '#/': { render: () => document.createElement('disconnect-probe') },
            '#/next': { render: () => createScreen('next-screen') },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        router.navigate('#/next');
        await waitForTick();
        assert.strictEqual(disconnects, 1);
        assert.strictEqual(document.getElementById('route-outlet').firstElementChild?.id, 'next-screen');
    });
    await t.test('2-level section history: root-to-child pushes, child-to-child/root replaces', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let replaceStateCalls = 0;
        const origReplaceState = window.history.replaceState.bind(window.history);
        window.history.replaceState = (data, unused, url) => {
            replaceStateCalls++;
            origReplaceState(data, unused, url);
        };
        const routes = {
            ...createRoutes(),
            '#/health/day/:date': {
                render: () => createScreen('health-day-screen'),
                parent: '#/health',
            },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        replaceStateCalls = 0;
        router.navigate('#/health');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-14');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
        replaceStateCalls = 0;
        router.navigate('#/health');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 1);
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-15');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-16');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 1);
    });
    await t.test('cross-section navigation does not use replaceState', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let replaceStateCalls = 0;
        const origReplaceState = window.history.replaceState.bind(window.history);
        window.history.replaceState = (data, unused, url) => {
            replaceStateCalls++;
            origReplaceState(data, unused, url);
        };
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        replaceStateCalls = 0;
        router.navigate('#/health');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
        replaceStateCalls = 0;
        router.navigate('#/goals');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
        replaceStateCalls = 0;
        router.navigate('#/');
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
    });
    await t.test('explicit history mode overrides auto behavior', async () => {
        setupDOM();
        const { Router, navigate } = await import('./router.js');
        let replaceStateCalls = 0;
        const origReplaceState = window.history.replaceState.bind(window.history);
        window.history.replaceState = (data, unused, url) => {
            replaceStateCalls++;
            origReplaceState(data, unused, url);
        };
        const routes = {
            ...createRoutes(),
            '#/health/day/:date': {
                render: () => createScreen('health-day-screen'),
                parent: '#/health',
            },
        };
        const router = new Router({ routes, target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        navigate('#/health');
        await waitForTick();
        replaceStateCalls = 0;
        navigate('#/health/day/2026-03-14', { history: 'replace' });
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 1);
        replaceStateCalls = 0;
        navigate('#/goals', { history: 'push' });
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 0);
    });
    await t.test('unknown route fallback uses replaceState and renders home', async () => {
        setupDOM('#/missing');
        const { Router } = await import('./router.js');
        let replaceStateCalls = 0;
        const origReplaceState = window.history.replaceState.bind(window.history);
        window.history.replaceState = (data, unused, url) => {
            replaceStateCalls++;
            origReplaceState(data, unused, url);
        };
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        await waitForTick();
        assert.strictEqual(replaceStateCalls, 1);
        assert.strictEqual(window.location.hash, '#/');
        assert.strictEqual(document.getElementById('route-outlet').firstElementChild?.id, 'home-screen');
    });
    await t.test('exported navigate function routes through the active router', async () => {
        setupDOM();
        const { Router, navigate } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), target: document.getElementById('route-outlet') });
        router.start();
        await waitForTick();
        navigate('#/health');
        await waitForTick();
        assert.strictEqual(router.currentRoute, '#/health');
    });
});
