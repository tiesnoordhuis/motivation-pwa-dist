/**
 * Vanilla hash-based router for the Motivation PWA.
 * Uses the View Transitions API for animated route changes.
 * Each route lazy-initializes its section renderer on first visit.
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
export function navigate(hash) {
    globalNavigate(hash);
}
export class Router {
    routes;
    initialized = new Set();
    _currentRoute = '';
    _previousRoute = '';
    constructor(options) {
        this.routes = options.routes;
    }
    get currentRoute() {
        return this._currentRoute;
    }
    get previousRoute() {
        return this._previousRoute;
    }
    /** Start listening for hash changes and navigate to the current hash. */
    start() {
        globalNavigate = (hash) => this.navigate(hash);
        window.addEventListener('hashchange', () => this.onHashChange());
        window.addEventListener('popstate', () => this.onHashChange());
        this.onHashChange();
    }
    /**
     * Programmatic navigation.
     *
     * Intra-section navigations (both routes share the same top-level section)
     * use `history.replaceState` so they don't accumulate in the history stack.
     * Cross-section navigations use the normal `location.hash` assignment which
     * pushes a new history entry.
     */
    navigate(hash) {
        if (this.shouldReplace(hash)) {
            // Replace the current history entry — no new entry pushed.
            // This won't fire hashchange, so we trigger routing manually.
            window.history.replaceState(null, '', window.location.pathname + hash);
            this.onHashChange();
        }
        else {
            // Normal push — fires hashchange automatically.
            window.location.hash = hash;
        }
    }
    /** Resolve the current hash to a known route, or the fallback, and return params */
    resolveRoute(hash) {
        // Normalize bare/empty hash to home
        if (!hash || hash === '#') {
            return { route: '#/', params: {} };
        }
        // Direct match
        if (this.routes[hash]) {
            return { route: hash, params: {} };
        }
        // Pattern match
        for (const routePattern of Object.keys(this.routes)) {
            if (!routePattern.includes(':'))
                continue;
            const patternParts = routePattern.split('/');
            const hashParts = hash.split('/');
            if (patternParts.length !== hashParts.length)
                continue;
            const params = {};
            let isMatch = true;
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    if (!hashParts[i]) {
                        isMatch = false; // Parameter must not be empty
                        break;
                    }
                    const paramName = patternParts[i].substring(1);
                    params[paramName] = hashParts[i];
                }
                else if (patternParts[i] !== hashParts[i]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return { route: routePattern, params };
            }
        }
        // Unknown route → home
        return { route: '#/', params: {} };
    }
    /**
     * Should this navigation replace the current history entry?
     *
     * The goal is a 2-level history within sections:
     *   - Root → child (entering a sub-view): PUSH, so back returns to root
     *   - Child → child (sibling sub-views): REPLACE, so back returns to root
     *   - Child → root (returning to overview): REPLACE, so back exits section
     *
     * This prevents circular navigation (overview → detail → overview → detail)
     * from bloating the history, while still letting "back" reach the section root.
     */
    shouldReplace(newHash) {
        if (!this._currentRoute)
            return false;
        const { route: currRoute } = this.resolveRoute(this._currentRoute);
        const { route: nextRoute } = this.resolveRoute(newHash);
        const currSection = this.getSection(currRoute);
        const nextSection = this.getSection(nextRoute);
        // Only applies within the same section (not home)
        if (currSection !== nextSection || currSection === '#/')
            return false;
        const currIsChild = this.routes[currRoute]?.parent != null;
        // Child → anything in same section: REPLACE
        // (covers child→child sibling nav AND child→root return)
        if (currIsChild)
            return true;
        // Root → child: PUSH (so back returns to root)
        return false;
    }
    /** Core routing logic triggered on every hash change */
    async onHashChange() {
        const hash = window.location.hash || '#/';
        const { route, params } = this.resolveRoute(hash);
        // Redirect to fallback if hash was unknown
        // We only redirect if the resolved route doesn't match the original hash pattern
        // meaning it fell back to '#/'
        if (route === '#/' && hash !== '#/') {
            window.location.hash = '#/';
            return;
        }
        // Skip if already on this exact hash
        if (hash === this._currentRoute)
            return;
        this._previousRoute = this._currentRoute;
        this._currentRoute = hash;
        // Determine if we're going back based on the resolved route pattern
        const prevResolved = this.resolveRoute(this._previousRoute).route;
        const isBack = this.isBackNavigation(prevResolved, route);
        if (isBack) {
            document.documentElement.classList.add('back-transition');
        }
        else {
            document.documentElement.classList.remove('back-transition');
        }
        const transition = () => this.activateRoute(route, params);
        if (document.startViewTransition) {
            document.startViewTransition(transition);
        }
        else {
            transition();
        }
    }
    /** Return the top-level section for a route (itself if no parent). */
    getSection(route) {
        return this.routes[route]?.parent ?? route;
    }
    /** Activate a route: hide all views, lazy-init if needed, show target view */
    async activateRoute(route, params) {
        const config = this.routes[route];
        if (!config)
            return;
        // Call onLeave only when leaving a section entirely
        if (this._previousRoute) {
            const prevSection = this.getSection(this._previousRoute);
            const newSection = this.getSection(route);
            if (prevSection !== newSection) {
                const sectionConfig = this.routes[prevSection];
                if (sectionConfig?.onLeave) {
                    await sectionConfig.onLeave();
                }
            }
        }
        // Hide all views except the target (avoids flash when navigating within a section)
        const targetEl = document.querySelector(config.view);
        for (const [, routeConfig] of Object.entries(this.routes)) {
            const el = document.querySelector(routeConfig.view);
            if (el && el !== targetEl) {
                el.classList.add('hidden');
            }
        }
        // Ensure parent route is initialized before child
        if (config.parent && !this.initialized.has(config.parent)) {
            const parentConfig = this.routes[config.parent];
            if (parentConfig?.init) {
                await parentConfig.init();
            }
            this.initialized.add(config.parent);
        }
        // Lazy init on first visit
        if (!this.initialized.has(route) && config.init) {
            await config.init();
            this.initialized.add(route);
        }
        // Show target view
        if (targetEl) {
            targetEl.classList.remove('hidden');
        }
        // Call onEnter hook
        if (config.onEnter) {
            await config.onEnter(params);
        }
    }
    /**
     * Determine if this navigation is "going back" (toward home or parent).
     * Home (#/) is the root; navigating from a section to home is "back".
     * Navigating from a child to its parent is also "back".
     */
    isBackNavigation(from, to) {
        if (!from)
            return false;
        // Going to home from any section is "back"
        if (to === '#/' && from !== '#/')
            return true;
        // Child → parent is "back"
        const fromConfig = this.routes[from];
        if (fromConfig?.parent === to)
            return true;
        return false;
    }
}
