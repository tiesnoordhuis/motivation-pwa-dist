import './health-dashboard-screen.component.js';
import './health-day-screen.component.js';
import './health-scanner-screen.component.js';
import './health-food-entry-screen.component.js';
import './health-ai-estimate-screen.component.js';
export function healthRoutes() {
    return {
        '#/health': {
            render: () => document.createElement('health-dashboard-screen'),
        },
        '#/health/scanner': {
            parent: '#/health',
            render: () => document.createElement('health-scanner-screen'),
        },
        '#/health/scanner/:date/:meal': {
            parent: '#/health',
            render: (ctx) => {
                const screen = document.createElement('health-scanner-screen');
                screen.date = decodeURIComponent(ctx.params.date);
                screen.meal = decodeURIComponent(ctx.params.meal);
                return screen;
            },
        },
        '#/health/food-entry': {
            parent: '#/health',
            render: () => document.createElement('health-food-entry-screen'),
        },
        '#/health/food-entry/:date/:meal': {
            parent: '#/health',
            render: (ctx) => {
                const screen = document.createElement('health-food-entry-screen');
                screen.date = decodeURIComponent(ctx.params.date);
                screen.meal = decodeURIComponent(ctx.params.meal);
                return screen;
            },
        },
        '#/health/food-search': {
            parent: '#/health',
            render: () => document.createElement('health-food-entry-screen'),
        },
        '#/health/food-search/:date/:meal': {
            parent: '#/health',
            render: (ctx) => {
                const screen = document.createElement('health-food-entry-screen');
                screen.date = decodeURIComponent(ctx.params.date);
                screen.meal = decodeURIComponent(ctx.params.meal);
                return screen;
            },
        },
        '#/health/ai-estimate': {
            parent: '#/health',
            render: () => document.createElement('health-ai-estimate-screen'),
        },
        '#/health/ai-estimate/:date/:meal': {
            parent: '#/health',
            render: (ctx) => {
                const screen = document.createElement('health-ai-estimate-screen');
                screen.date = decodeURIComponent(ctx.params.date);
                screen.meal = decodeURIComponent(ctx.params.meal);
                return screen;
            },
        },
        '#/health/day/:date': {
            parent: '#/health',
            render: (ctx) => {
                const screen = document.createElement('health-day-screen');
                screen.date = decodeURIComponent(ctx.params.date);
                return screen;
            },
        },
    };
}
