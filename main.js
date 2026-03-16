import { Router } from './router.js';
import { registerServiceWorker } from './services/service-worker.service.js';
import { homeRoutes } from './components/home/home.routes.js';
import { goalRoutes } from './components/goal/goal.routes.js';
import { agendaRoutes } from './components/agenda/agenda.routes.js';
import { healthRoutes } from './components/health/health.routes.js';
import { socialRoutes } from './components/social/social.routes.js';
import { vietnameseRoutes } from './components/vietnamese/vietnamese.routes.js';
import { projectsRoutes } from './components/projects/projects.routes.js';
import { extraRoutes } from './components/extra/extra.routes.js';
// Side-effect imports: register custom elements via customElements.define().
import './components/home/section-card.component.js';
import './components/home/health-section-card.component.js';
import './components/home/social-section-card.component.js';
import './components/home/learn-section-card.component.js';
import './components/home/projects-section-card.component.js';
import './components/home/home-footer.component.js';
import './components/home/home-screen.component.js';
import './components/goal/goal-item.component.js';
import './components/goal/goal-list.component.js';
import './components/goal/goal-header-card.component.js';
import './components/agenda/agenda-item.component.js';
import './components/agenda/agenda-list.component.js';
import './components/health/health-dashboard.component.js';
import './components/health/sub/health-activity-item.component.js';
import './components/health/sub/health-upcoming-item.component.js';
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
        ...extraRoutes(),
    },
});
router.start();
