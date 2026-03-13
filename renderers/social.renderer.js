import { buildSectionPage } from './section-page.utils.js';
let instance = null;
export function socialRoutes() {
    return {
        '#/social': {
            view: '#social-view',
            init: () => { instance = new SocialRenderer(); },
        },
    };
}
export class SocialRenderer {
    page;
    constructor() {
        const container = document.getElementById('social-view');
        this.page = buildSectionPage(container, 'Social', 'social', '#/social');
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Coming soon — people tracking, interaction cadence, suggestions.';
        this.page.content.appendChild(placeholder);
    }
    async init() { }
}
