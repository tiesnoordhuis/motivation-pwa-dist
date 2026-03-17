import { HealthRenderer } from './health.renderer.js';
import { navigate } from '../../router.js';
let instance = null;
export function healthRoutes() {
    return {
        '#/health': {
            view: '#health-view',
            init: () => { instance = new HealthRenderer(); },
            onEnter: async () => {
                instance?.showDashboard();
                await instance?.loadData();
            },
            onLeave: () => { instance?.cleanup(); },
        },
        '#/health/scanner': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showScanner(); },
        },
        '#/health/food-search': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showFoodSearch(); },
        },
        '#/health/ai-estimate': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showAiEstimate(); },
        },
        '#/health/day/:date': {
            view: '#health-view',
            parent: '#/health',
            onEnter: async (params) => {
                if (params && params.date) {
                    await instance?.showDayDetail(params.date);
                }
                else {
                    navigate('#/health');
                }
            },
        },
    };
}
