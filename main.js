import { GoalService } from './services/goal.service.js';
import { GoalRenderer } from './renderers/goal.renderer.js';
import { AgendaRenderer } from './renderers/agenda.renderer.js';
import { HomeRenderer } from './renderers/home.renderer.js';
import { HealthRenderer } from './renderers/health.renderer.js';
import { Router } from './router.js';
import { registerServiceWorker } from './services/service-worker.service.js';
// Side-effect imports: register custom elements via customElements.define().
import './components/goal/goal-item.component.js';
import './components/goal/goal-list.component.js';
import './components/goal/goal-header-card.component.js';
import './components/agenda/agenda-item.component.js';
import './components/agenda/agenda-list.component.js';
import './components/home/section-card.component.js';
import './components/health/health-dashboard.component.js';
console.log('Motivation PWA Started');
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
// Renderers (lazy-initialized by the router)
let goalRenderer = null;
let agendaRenderer = null;
let healthRenderer = null;
const homeRenderer = new HomeRenderer();
// Router Setup
const router = new Router({
    routes: {
        '#/': {
            view: '#home-view',
            init: async () => {
                await homeRenderer.init();
            },
            onEnter: async () => {
                await homeRenderer.loadSummaries();
            },
        },
        '#/goals': {
            view: '#goals-view',
            init: async () => {
                goalRenderer = new GoalRenderer();
                await initGoals();
            },
            onEnter: async () => {
                if (goalRenderer) {
                    await goalRenderer.refreshGoals();
                }
            },
        },
        '#/agenda': {
            view: '#agenda-view',
            init: async () => {
                agendaRenderer = new AgendaRenderer();
                await agendaRenderer.init();
            },
            onEnter: async () => {
                if (agendaRenderer) {
                    await agendaRenderer.init();
                }
            },
        },
        '#/health': {
            view: '#health-view',
            init: async () => {
                healthRenderer = new HealthRenderer();
                await healthRenderer.init();
            },
            onEnter: async () => {
                if (healthRenderer) {
                    await healthRenderer.loadData();
                }
            },
        },
        '#/social': {
            view: '#social-view',
        },
        '#/vietnamese': {
            view: '#vietnamese-view',
        },
        '#/projects': {
            view: '#projects-view',
        },
        '#/todo': {
            view: '#todo-view',
        },
    },
    fallback: '#/',
});
async function initGoals() {
    if (!goalRenderer)
        return;
    try {
        goalRenderer.showLoading();
        const goals = await GoalService.fetchGoals();
        goalRenderer.renderGoals(goals);
        goalRenderer.hideError();
    }
    catch (err) {
        goalRenderer.showError('Failed to load goals. Is the server running?');
        console.error(err);
    }
    finally {
        goalRenderer.hideLoading();
    }
}
// Listen for section card navigation events
document.addEventListener('section-navigate', (e) => {
    const detail = e.detail;
    router.navigate(detail.route);
});
// Start the router
router.start();
