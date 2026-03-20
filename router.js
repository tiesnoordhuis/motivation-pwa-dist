/**
 * Vanilla hash-based router for the Motivation PWA.
 * Uses the View Transitions API for animated route changes.
 *
 * Navigation within a section (e.g. health overview → day detail → overview)
 * uses history.replaceState so the browser back button skips intra-section
 * bouncing and returns straight to the previous section or home.
 */
/** Global navigate function — set by Router.start(). */
let globalNavigate = (hash) => {
    window.location.hash = hash;
};
/**
 * Navigate to a hash route. Uses the active router's smart navigation
 * (replaceState for intra-section nav, pushState otherwise).
 */
export function navigate(hash, options) {
    globalNavigate(hash, options);
}
export class Router {
    routes;
    target;
    currentScreen = null;
    renderSequence = 0;
    _currentRoute = '';
    _previousRoute = '';
    constructor(options) {
        this.routes = options.routes;
        this.target = options.target;
    }
    get currentRoute() {
        return this._currentRoute;
    }
    get previousRoute() {
        return this._previousRoute;
    }
    /** Start listening for hash changes and navigate to the current hash. */
    start() {
        globalNavigate = (hash, options) => this.navigate(hash, options);
        window.addEventListener('hashchange', () => this.onHashChange());
        window.addEventListener('popstate', () => this.onHashChange());
        void this.onHashChange();
    }
    /**
     * Programmatic navigation.
     *
     * Intra-section navigations (both routes share the same top-level section)
     * use `history.replaceState` so they don't accumulate in the history stack.
     * Cross-section navigations use the normal `location.hash` assignment which
     * pushes a new history entry.
     */
    navigate(hash, options) {
        const historyMode = options?.history ?? 'auto';
        const shouldReplace = historyMode === 'replace'
            || (historyMode === 'auto' && this.shouldReplace(hash));
        if (shouldReplace) {
            window.history.replaceState(null, '', window.location.pathname + hash);
            void this.onHashChange();
        }
        else {
            window.location.hash = hash;
        }
    }
    /** Resolve the current hash to a known route, or the fallback, and return params */
    resolveRoute(hash) {
        return {
            route: this.resolveRouteContext(hash).route,
            params: this.resolveRouteContext(hash).params,
        };
    }
    resolveRouteContext(hash) {
        const { path, query } = this.parseHash(hash);
        if (path === '#/') {
            return { path, route: '#/', params: {}, query };
        }
        if (this.routes[path]) {
            return { path, route: path, params: {}, query };
        }
        for (const routePattern of Object.keys(this.routes)) {
            if (!routePattern.includes(':'))
                continue;
            const patternParts = routePattern.split('/');
            const pathParts = path.split('/');
            if (patternParts.length !== pathParts.length)
                continue;
            const params = {};
            let isMatch = true;
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    if (!pathParts[i]) {
                        isMatch = false;
                        break;
                    }
                    params[patternParts[i].substring(1)] = pathParts[i];
                }
                else if (patternParts[i] !== pathParts[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return { path, route: routePattern, params, query };
            }
        }
        return { path, route: '#/', params: {}, query };
    }
    parseHash(hash) {
        if (!hash || hash === '#') {
            return { path: '#/', query: new URLSearchParams() };
        }
        const normalized = hash.startsWith('#') ? hash : `#${hash}`;
        const [pathPart, queryPart] = normalized.split('?');
        const path = !pathPart || pathPart === '#' ? '#/' : pathPart;
        const query = new URLSearchParams(queryPart ?? '');
        return { path, query };
    }
    /**
     * Should this navigation replace the current history entry?
     *
     * The goal is a 2-level history within sections:
     *   - Root → child (entering a sub-view): PUSH, so back returns to root
     *   - Child → child (sibling sub-views): REPLACE, so back returns to root
     *   - Child → root (returning to overview): REPLACE, so back exits section
     */
    shouldReplace(newHash) {
        if (!this._currentRoute)
            return false;
        const currResolved = this.resolveRouteContext(this._currentRoute);
        const nextResolved = this.resolveRouteContext(newHash);
        const currSection = this.getSection(currResolved.route);
        const nextSection = this.getSection(nextResolved.route);
        if (currSection !== nextSection || currSection === '#/')
            return false;
        const currIsChild = this.routes[currResolved.route]?.parent != null;
        if (currIsChild)
            return true;
        return false;
    }
    /** Core routing logic triggered on every hash change */
    async onHashChange() {
        const hash = window.location.hash || '#/';
        const resolved = this.resolveRouteContext(hash);
        if (resolved.route === '#/' && resolved.path !== '#/') {
            window.history.replaceState(null, '', `${window.location.pathname}#/`);
            await this.onHashChange();
            return;
        }
        if (hash === this._currentRoute)
            return;
        this._previousRoute = this._currentRoute;
        this._currentRoute = hash;
        const prevResolved = this.resolveRouteContext(this._previousRoute).route;
        const isBack = this.isBackNavigation(prevResolved, resolved.route);
        if (isBack) {
            document.documentElement.classList.add('back-transition');
        }
        else {
            document.documentElement.classList.remove('back-transition');
        }
        const activationId = ++this.renderSequence;
        const transition = () => this.activateRoute(resolved, activationId);
        if (document.startViewTransition && document.visibilityState === 'visible') {
            try {
                await document.startViewTransition(transition).finished;
            }
            catch {
                await transition();
            }
        }
        else {
            await transition();
        }
    }
    /** Return the top-level section for a route (itself if no parent). */
    getSection(route) {
        return this.routes[route]?.parent ?? route;
    }
    /** Activate a route by rendering it into the outlet. */
    async activateRoute(resolved, activationId) {
        const config = this.routes[resolved.route];
        if (!config)
            return;
        const nextScreen = await config.render({
            path: resolved.path,
            params: resolved.params,
            query: resolved.query,
        });
        if (activationId !== this.renderSequence) {
            return;
        }
        this.target.replaceChildren(nextScreen);
        this.currentScreen = nextScreen;
    }
    /**
     * Determine if this navigation is "going back" (toward home or parent).
     * Home (#/) is the root; navigating from a section to home is "back".
     * Navigating from a child to its parent is also "back".
     */
    isBackNavigation(from, to) {
        if (!from)
            return false;
        if (to === '#/' && from !== '#/')
            return true;
        const fromConfig = this.routes[from];
        if (fromConfig?.parent === to)
            return true;
        return false;
    }
}
