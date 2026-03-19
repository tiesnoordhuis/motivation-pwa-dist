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
import './components/home/section-card/section-card.component.js';
import './components/home/section-card/health-section-card/health-section-card.component.js';
import './components/home/section-card/social-section-card/social-section-card.component.js';
import './components/home/section-card/learn-section-card/learn-section-card.component.js';
import './components/home/section-card/projects-section-card/projects-section-card.component.js';
import './components/home/home-footer/home-footer.component.js';
import './components/home/home-screen/home-screen.component.js';
import './components/goal/goal-list/goal-item/goal-item.component.js';
import './components/goal/goal-list/goal-list.component.js';
import './components/goal/goal-header-card/goal-header-card.component.js';
import './components/agenda/agenda-list/agenda-item/agenda-item.component.js';
import './components/agenda/agenda-list/agenda-list.component.js';
import './components/health/health-dashboard/health-dashboard.component.js';
import './components/health/health-timeline/health-timeline.component.js';
import './components/health/calorie-trend-chart/calorie-trend-chart.component.js';
import './components/health/health-day-detail/health-day-detail.component.js';
import './components/health/barcode-scanner/barcode-scanner.component.js';
import './components/health/food-log/food-log.component.js';
import './components/health/ai-estimate/ai-estimate.component.js';
import './components/health/nutrition-edit/nutrition-edit.component.js';
import './components/health/activity-edit/activity-edit.component.js';
import './components/projects/server-status-pill/server-status-pill.component.js';
import './components/vietnamese/review-card/review-card.component.js';
import './components/vietnamese/review-session/review-session.component.js';
import './components/vietnamese/review-session-summary/review-session-summary.component.js';
import './components/vietnamese/vietnamese-dashboard/vietnamese-dashboard.component.js';
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
