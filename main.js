import { Router } from './router.js';
import { registerServiceWorker } from './services/service-worker.service.js';
import { homeRoutes } from './renderers/home.renderer.js';
import { goalRoutes } from './renderers/goal.renderer.js';
import { agendaRoutes } from './renderers/agenda.renderer.js';
import { healthRoutes } from './renderers/health.renderer.js';
import { socialRoutes } from './renderers/social.renderer.js';
import { vietnameseRoutes } from './renderers/vietnamese.renderer.js';
import { projectsRoutes } from './renderers/projects.renderer.js';
import { todoRoutes } from './renderers/todo.renderer.js';
// Side-effect imports: register custom elements via customElements.define().
import './components/goal/goal-item.component.js';
import './components/goal/goal-list.component.js';
import './components/goal/goal-header-card.component.js';
import './components/agenda/agenda-item.component.js';
import './components/agenda/agenda-list.component.js';
import './components/home/section-card.component.js';
import './components/health/health-dashboard.component.js';
import './components/health/barcode-scanner.component.js';
import './components/health/food-log.component.js';
import './components/health/nutrition-widget.component.js';
import './components/health/ai-estimate.component.js';
import './components/projects/server-status-pill.component.js';
import { handleStravaOAuthCallback } from './services/strava-callback.js';
console.log('Motivation PWA Started');
// Handle Strava OAuth callback (redirects back with ?code=xxx)
handleStravaOAuthCallback();
// Service Worker Registration
window.addEventListener('load', async () => {
    try {
        const debug = new URL(self.location.href).searchParams.get('debug') === 'true';
        if (debug) {
            console.log('SW debug mode enabled');
        }
        const registration = await registerServiceWorker({ debug });
        console.log('SW registered: ', registration);
    }
    catch (err) {
        console.error('SW registration failed: ', err);
    }
});
// Each section defines its own routes — main.ts just merges them.
const router = new Router({
    routes: {
        ...homeRoutes(),
        ...goalRoutes(),
        ...agendaRoutes(),
        ...healthRoutes(),
        ...socialRoutes(),
        ...vietnameseRoutes(),
        ...projectsRoutes(),
        ...todoRoutes(),
    },
    fallback: '#/',
});
router.start();
