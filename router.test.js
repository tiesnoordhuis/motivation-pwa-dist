import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('Router', async (t) => {
    function setupDOM(hash = '') {
        const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div id="home-view" class="view-section"></div>
    <div id="goals-view" class="view-section hidden"></div>
    <div id="agenda-view" class="view-section hidden"></div>
    <div id="health-view" class="view-section hidden"></div>
    <div id="social-view" class="view-section hidden"></div>
    <div id="vietnamese-view" class="view-section hidden"></div>
    <div id="projects-view" class="view-section hidden"></div>
    <div id="todo-view" class="view-section hidden"></div>
</body>
</html>
        `, { url: `http://localhost${hash ? '/#' + hash : ''}` });
        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.customElements = dom.window.customElements;
        return dom;
    }
    function createRoutes() {
        return {
            '#/': { view: '#home-view' },
            '#/goals': { view: '#goals-view' },
            '#/agenda': { view: '#agenda-view' },
            '#/health': { view: '#health-view' },
            '#/social': { view: '#social-view' },
            '#/vietnamese': { view: '#vietnamese-view' },
            '#/projects': { view: '#projects-view' },
            '#/todo': { view: '#todo-view' },
        };
    }
    await t.test('resolveRoute returns fallback for empty hash', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.deepStrictEqual(router.resolveRoute(''), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#'), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/'), { route: '#/', params: {} });
    });
    await t.test('resolveRoute returns matching route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.deepStrictEqual(router.resolveRoute('#/health'), { route: '#/health', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/social'), { route: '#/social', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/goals'), { route: '#/goals', params: {} });
    });
    await t.test('resolveRoute returns fallback for unknown route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.deepStrictEqual(router.resolveRoute('#/unknown'), { route: '#/', params: {} });
        assert.deepStrictEqual(router.resolveRoute('#/doesnotexist'), { route: '#/', params: {} });
    });
    await t.test('currentRoute starts empty before start()', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.strictEqual(router.currentRoute, '');
    });
    await t.test('start() activates the home route by default', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        router.start();
        // Give the hashchange a tick
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(router.currentRoute, '#/');
        const homeView = document.querySelector('#home-view');
        assert.ok(!homeView.classList.contains('hidden'), 'Home view should be visible');
    });
    await t.test('lazy init is called only once per route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let initCount = 0;
        const routes = createRoutes();
        routes['#/health'].init = () => { initCount++; };
        const router = new Router({ routes });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        // Navigate to health
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(initCount, 1, 'init should be called once');
        // Navigate away and back
        router.navigate('#/');
        await new Promise(r => setTimeout(r, 10));
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(initCount, 1, 'init should still be called only once');
    });
    await t.test('onEnter is called every time a route is navigated to', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let enterCount = 0;
        const routes = createRoutes();
        routes['#/social'].onEnter = () => { enterCount++; };
        const router = new Router({ routes });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        router.navigate('#/social');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(enterCount, 1);
        router.navigate('#/');
        await new Promise(r => setTimeout(r, 10));
        router.navigate('#/social');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(enterCount, 2, 'onEnter should be called each time');
    });
    await t.test('navigate hides non-active views', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        // Navigate to health
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        const homeView = document.querySelector('#home-view');
        const healthView = document.querySelector('#health-view');
        assert.ok(homeView.classList.contains('hidden'), 'Home view should be hidden');
        assert.ok(!healthView.classList.contains('hidden'), 'Health view should be visible');
    });
    await t.test('previousRoute tracks navigation history', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(router.previousRoute, '');
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(router.previousRoute, '#/');
        router.navigate('#/social');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(router.previousRoute, '#/health');
    });
    await t.test('all expected routes are supported', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const routes = createRoutes();
        const router = new Router({ routes });
        const expectedRoutes = ['#/', '#/goals', '#/agenda', '#/health', '#/social', '#/vietnamese', '#/projects', '#/todo'];
        for (const route of expectedRoutes) {
            assert.deepStrictEqual(router.resolveRoute(route), { route, params: {} }, `Route ${route} should be supported`);
        }
    });
    await t.test('resolveRoute supports dynamic parameters', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const routes = {
            '#/home': { view: '#home-view' },
            '#/user/:id': { view: '#user-view' },
            '#/health/day/:date': { view: '#health-view' },
        };
        const router = new Router({ routes });
        assert.deepStrictEqual(router.resolveRoute('#/user/123'), { route: '#/user/:id', params: { id: '123' } });
        assert.deepStrictEqual(router.resolveRoute('#/health/day/2026-03-14'), { route: '#/health/day/:date', params: { date: '2026-03-14' } });
        // Falls back to home if pattern is mismatched
        assert.deepStrictEqual(router.resolveRoute('#/health/day/'), { route: '#/', params: {} });
    });
    await t.test('onEnter receives extracted parameters', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        let capturedParams;
        let enterCount = 0;
        const routes = {
            ...createRoutes(),
            '#/item/:itemId': {
                view: '#home-view',
                onEnter: (params) => {
                    capturedParams = params;
                    enterCount++;
                }
            }
        };
        const router = new Router({ routes });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        router.navigate('#/item/42');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(enterCount, 1);
        assert.deepStrictEqual(capturedParams, { itemId: '42' });
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
                view: '#health-view',
                parent: '#/health',
            },
        };
        const router = new Router({ routes });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        // Home to Health (cross-section, should push)
        replaceStateCalls = 0;
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Cross-section nav should push');
        // Health root to day detail (root-to-child, should push so back returns to root)
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-14');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Root-to-child should push');
        // Day detail to Health root (child-to-root, should replace)
        replaceStateCalls = 0;
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 1, 'Child-to-root should replace');
        // Health root to another day (root-to-child again, should push)
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-15');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Root-to-child should push');
        // Day detail to different day (child-to-child, should replace)
        replaceStateCalls = 0;
        router.navigate('#/health/day/2026-03-16');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 1, 'Child-to-child sibling nav should replace');
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
        const router = new Router({ routes: createRoutes() });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        // Home → Health (cross-section)
        replaceStateCalls = 0;
        router.navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Home → Health should push');
        // Health → Goals (cross-section)
        replaceStateCalls = 0;
        router.navigate('#/goals');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Health → Goals should push');
        // Goals → Home (cross-section)
        replaceStateCalls = 0;
        router.navigate('#/');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(replaceStateCalls, 0, 'Goals → Home should push');
    });
    await t.test('exported navigate function routes through the active router', async () => {
        setupDOM();
        const { Router, navigate } = await import('./router.js');
        const routes = createRoutes();
        const router = new Router({ routes });
        router.start();
        await new Promise(r => setTimeout(r, 10));
        navigate('#/health');
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(router.currentRoute, '#/health', 'navigate() should route through active router');
    });
});
