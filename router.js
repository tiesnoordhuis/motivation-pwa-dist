/**
 * Vanilla hash-based router for the Motivation PWA.
 * Supports routes: #/, #/health, #/social, #/vietnamese, #/projects, #/todo, #/goals, #/agenda
 * Uses the View Transitions API for animated route changes.
 * Each route lazy-initializes its section renderer on first visit.
 */
export class Router {
    routes;
    fallback;
    initialized = new Set();
    _currentRoute = '';
    _previousRoute = '';
    constructor(options) {
        this.routes = options.routes;
        this.fallback = options.fallback ?? '#/';
    }
    get currentRoute() {
        return this._currentRoute;
    }
    get previousRoute() {
        return this._previousRoute;
    }
    /** Start listening for hash changes and navigate to the current hash. */
    start() {
        window.addEventListener('hashchange', () => this.onHashChange());
        // Navigate to the initial hash (or fallback)
        this.onHashChange();
    }
    /** Programmatic navigation */
    navigate(hash) {
        window.location.hash = hash;
        // hashchange event will fire and handle the rest
    }
    /** Resolve the current hash to a known route, or the fallback */
    resolveRoute(hash) {
        // Normalize: empty hash or just '#' → fallback
        if (!hash || hash === '#' || hash === '#/') {
            return this.fallback;
        }
        // Direct match
        if (this.routes[hash]) {
            return hash;
        }
        // Unknown route → fallback
        return this.fallback;
    }
    /** Core routing logic triggered on every hash change */
    async onHashChange() {
        const hash = window.location.hash || this.fallback;
        const route = this.resolveRoute(hash);
        // Redirect to fallback if hash was unknown
        if (route !== hash) {
            window.location.hash = route;
            return;
        }
        // Skip if already on this route
        if (route === this._currentRoute)
            return;
        this._previousRoute = this._currentRoute;
        this._currentRoute = route;
        const isBack = this.isBackNavigation(this._previousRoute, route);
        if (isBack) {
            document.documentElement.classList.add('back-transition');
        }
        else {
            document.documentElement.classList.remove('back-transition');
        }
        const transition = () => this.activateRoute(route);
        if (document.startViewTransition) {
            document.startViewTransition(transition);
        }
        else {
            transition();
        }
    }
    /** Activate a route: hide all views, lazy-init if needed, show target view */
    async activateRoute(route) {
        const config = this.routes[route];
        if (!config)
            return;
        // Hide all views
        for (const [, routeConfig] of Object.entries(this.routes)) {
            const el = document.querySelector(routeConfig.view);
            if (el) {
                el.classList.add('hidden');
            }
        }
        // Lazy init on first visit
        if (!this.initialized.has(route) && config.init) {
            await config.init();
            this.initialized.add(route);
        }
        // Show target view
        const target = document.querySelector(config.view);
        if (target) {
            target.classList.remove('hidden');
        }
        // Call onEnter hook
        if (config.onEnter) {
            await config.onEnter();
        }
    }
    /**
     * Determine if this navigation is "going back" (toward home).
     * Home (#/) is the root; navigating from a section to home is "back".
     */
    isBackNavigation(from, to) {
        if (!from)
            return false;
        // Going to home from any section is "back"
        if (to === '#/' && from !== '#/')
            return true;
        return false;
    }
}
