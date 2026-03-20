import './vietnamese-dashboard-screen.component.js';
import './vietnamese-review-screen.component.js';
export function vietnameseRoutes() {
    return {
        '#/vietnamese': {
            render: () => document.createElement('vietnamese-dashboard-screen'),
        },
        '#/vietnamese/review': {
            parent: '#/vietnamese',
            render: () => document.createElement('vietnamese-review-screen'),
        },
    };
}
