import { GoalService } from '../../services/goal.service.js';
import { GoalRenderer } from './goal.renderer.js';
let instance = null;
export function goalRoutes() {
    return {
        '#/goals': {
            view: '#goals-view',
            init: async () => {
                instance = new GoalRenderer();
                try {
                    instance.showLoading();
                    const goals = await GoalService.fetchGoals();
                    instance.renderGoals(goals);
                    instance.hideError();
                }
                catch (err) {
                    instance.showError('Failed to load goals. Is the server running?');
                    console.error(err);
                }
                finally {
                    instance.hideLoading();
                }
            },
            onEnter: async () => { await instance?.refreshGoals(); },
        },
    };
}
