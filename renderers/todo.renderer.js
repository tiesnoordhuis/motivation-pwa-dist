import { buildSectionPage } from './section-page.utils.js';
let instance = null;
export function todoRoutes() {
    return {
        '#/todo': {
            view: '#todo-view',
            init: () => { instance = new TodoRenderer(); },
        },
    };
}
export class TodoRenderer {
    page;
    constructor() {
        const container = document.getElementById('todo-view');
        this.page = buildSectionPage(container, 'TODO', 'todo', '#/todo');
        const placeholder = document.createElement('p');
        placeholder.textContent = 'Coming soon — lightweight task management.';
        this.page.content.appendChild(placeholder);
    }
    async init() { }
}
