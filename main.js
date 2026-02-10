import { GoalService } from './services/goal.service.js';
import { GoalRenderer } from './renderers/goal.renderer.js';
import { AgendaRenderer } from './renderers/agenda.renderer.js';
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
const goalRenderer = new GoalRenderer();
const agendaRenderer = new AgendaRenderer();
async function initGoals() {
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
async function initAgenda() {
    await agendaRenderer.init();
}
function setupNavigation() {
    const goalsBtn = document.getElementById('nav-goals');
    const agendaBtn = document.getElementById('nav-agenda');
    const goalsView = document.getElementById('goals-view');
    const agendaView = document.getElementById('agenda-view');
    if (!goalsBtn || !agendaBtn || !goalsView || !agendaView)
        return;
    goalsBtn.addEventListener('click', () => {
        goalsBtn.classList.add('active');
        agendaBtn.classList.remove('active');
        goalsView.classList.remove('hidden');
        agendaView.classList.add('hidden');
        // Optional: refresh goals?
    });
    agendaBtn.addEventListener('click', () => {
        agendaBtn.classList.add('active');
        goalsBtn.classList.remove('active');
        agendaView.classList.remove('hidden');
        goalsView.classList.add('hidden');
        initAgenda();
    });
}
setupNavigation();
initGoals();
