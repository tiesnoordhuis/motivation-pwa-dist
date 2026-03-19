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
        '#/health/scanner/:date/:meal': {
            view: '#health-view',
            parent: '#/health',
            onEnter: (params) => {
                const date = params?.date ? decodeURIComponent(params.date) : undefined;
                const meal = params?.meal ? decodeURIComponent(params.meal) : undefined;
                instance?.showScanner(date, meal);
            },
        },
        '#/health/food-search': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showFoodSearch(); },
        },
        '#/health/food-search/:date/:meal': {
            view: '#health-view',
            parent: '#/health',
            onEnter: (params) => {
                const date = params?.date ? decodeURIComponent(params.date) : undefined;
                const meal = params?.meal ? decodeURIComponent(params.meal) : undefined;
                instance?.showFoodSearch(date, meal);
            },
        },
        '#/health/ai-estimate': {
            view: '#health-view',
            parent: '#/health',
            onEnter: () => { instance?.showAiEstimate(); },
        },
        '#/health/ai-estimate/:date/:meal': {
            view: '#health-view',
            parent: '#/health',
            onEnter: (params) => {
                const date = params?.date ? decodeURIComponent(params.date) : undefined;
                const meal = params?.meal ? decodeURIComponent(params.meal) : undefined;
                instance?.showAiEstimate(date, meal);
            },
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
