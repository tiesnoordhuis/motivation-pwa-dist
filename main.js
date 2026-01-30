import { GoalService } from './services/goal.service.js';
import { GoalRenderer } from './renderers/goal.renderer.js';
import { registerServiceWorker } from './services/service-worker.service.js';
import './components/goal-item.component.js';
import './components/goal-list.component.js';
import './components/goal-header-card.component.js';
console.log('Motivation PWA Started');
// Service Worker Registration
window.addEventListener('load', async () => {
    try {
        // Use dev mode when debug param is set
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
// Goal Rendering Logic
const renderer = new GoalRenderer();
async function init() {
    try {
        renderer.showLoading();
        const goals = await GoalService.fetchGoals();
        renderer.renderGoals(goals);
        renderer.hideError();
    }
    catch (err) {
        renderer.showError('Failed to load goals. Is the server running?');
        console.error(err);
    }
    finally {
        renderer.hideLoading();
    }
}
init();
