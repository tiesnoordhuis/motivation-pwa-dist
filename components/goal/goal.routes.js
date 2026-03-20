import { GoalRenderer } from './goal.renderer.js';
function createGoalContainer() {
    const container = document.createElement('div');
    container.className = 'view-section';
    container.id = 'goals-view';
    return container;
}
export function goalRoutes() {
    return {
        '#/goals': {
            render: async () => {
                const container = createGoalContainer();
                const renderer = new GoalRenderer(container);
                await renderer.refreshGoals();
                return container;
            },
        },
    };
}
