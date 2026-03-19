import { VietnameseRenderer } from './vietnamese.renderer.js';
let instance = null;
export function vietnameseRoutes() {
    return {
        '#/vietnamese': {
            view: '#vietnamese-view',
            init: () => { instance = new VietnameseRenderer(); },
            onEnter: () => { instance?.showDashboard(); },
            onLeave: () => { instance?.cleanup(); }
        },
        '#/vietnamese/review': {
            view: '#vietnamese-view',
            parent: '#/vietnamese',
            onEnter: () => { instance?.showReviewSession(); }
        }
    };
}
