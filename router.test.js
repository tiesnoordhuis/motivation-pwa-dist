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
        assert.strictEqual(router.resolveRoute(''), '#/');
        assert.strictEqual(router.resolveRoute('#'), '#/');
        assert.strictEqual(router.resolveRoute('#/'), '#/');
    });
    await t.test('resolveRoute returns matching route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.strictEqual(router.resolveRoute('#/health'), '#/health');
        assert.strictEqual(router.resolveRoute('#/social'), '#/social');
        assert.strictEqual(router.resolveRoute('#/goals'), '#/goals');
    });
    await t.test('resolveRoute returns fallback for unknown route', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes() });
        assert.strictEqual(router.resolveRoute('#/unknown'), '#/');
        assert.strictEqual(router.resolveRoute('#/doesnotexist'), '#/');
    });
    await t.test('resolveRoute uses custom fallback', async () => {
        setupDOM();
        const { Router } = await import('./router.js');
        const router = new Router({ routes: createRoutes(), fallback: '#/goals' });
        assert.strictEqual(router.resolveRoute('#/unknown'), '#/goals');
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
            assert.strictEqual(router.resolveRoute(route), route, `Route ${route} should be supported`);
        }
    });
});
