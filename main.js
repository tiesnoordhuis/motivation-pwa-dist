import { GoalService } from './services/goal.service.js';
import { registerServiceWorker } from './services/service-worker.service.js';
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
const goalsList = document.getElementById('goals-list');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const goalTemplate = document.getElementById('goal-template');
async function init() {
    try {
        loadingIndicator.classList.remove('hidden');
        const goals = await GoalService.fetchGoals();
        renderGoals(goals);
        errorMessage.classList.add('hidden');
    }
    catch (err) {
        showError('Failed to load goals. Is the server running?');
        console.error(err);
    }
    finally {
        loadingIndicator.classList.add('hidden');
    }
}
function renderGoals(goals) {
    if (!goalsList || !goalTemplate)
        return;
    if (goals.length === 0) {
        goalsList.innerHTML = '';
        return;
    }
    goals.forEach(goal => {
        const clone = goalTemplate.content.cloneNode(true);
        const card = clone.querySelector('.goal-card');
        const title = clone.querySelector('.goal-title');
        const status = clone.querySelector('.goal-status');
        const description = clone.querySelector('.goal-description');
        if (card && title && status && description) {
            title.textContent = goal.title;
            status.textContent = goal.status;
            description.textContent = goal.description || '';
            card.classList.add(`status-${goal.status.toLowerCase()}`);
            goalsList.appendChild(clone);
        }
    });
}
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}
init();
