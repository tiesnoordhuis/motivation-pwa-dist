import { buildSectionPage } from './section-page.utils.js';
let instance = null;
export function vietnameseRoutes() {
    return {
        '#/vietnamese': {
            view: '#vietnamese-view',
            init: () => { instance = new VietnameseRenderer(); },
        },
    };
}
export class VietnameseRenderer {
    page;
    constructor() {
        const container = document.getElementById('vietnamese-view');
        this.page = buildSectionPage(container, 'Learn', 'vietnamese', '#/vietnamese');
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Coming soon — spaced repetition, progress tracking.';
        this.page.content.appendChild(placeholder);
    }
    async init() { }
}
