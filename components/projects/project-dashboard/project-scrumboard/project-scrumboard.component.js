import styles from './project-scrumboard.css' with { type: 'css' };
import { formatProjectStatusLabel, projectStatusClass } from '../project-shared.js';
import { ProjectsService } from '../../../../services/projects.service.js';
const template = document.createElement('template');
template.innerHTML = `
<div class="state" id="loading">Loading scrumboard…</div>
<div class="state" id="error" hidden></div>
<div class="board-columns" id="columns" hidden></div>
<template id="column-template">
    <details class="board-column">
        <summary class="column-summary">
            <span class="column-title"></span>
            <span class="column-hint">Tap for stories</span>
        </summary>
        <ul class="board-list"></ul>
    </details>
</template>
<template id="item-template">
    <li class="board-entry">
        <details class="board-item">
            <summary class="item-summary">
                <span class="item-text">
                    <span class="item-id"></span>
                    <span class="item-title"></span>
                </span>
                <span class="status"></span>
            </summary>
            <p class="item-meta"></p>
        </details>
    </li>
</template>
`;
export class ProjectScrumboard extends HTMLElement {
    shadowRootRef;
    loadingEl;
    errorEl;
    columnsEl;
    columnTemplateEl;
    itemTemplateEl;
    loadSequence = 0;
    static get observedAttributes() {
        return ['project-id'];
    }
    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.adoptedStyleSheets = [styles];
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.loadingEl = this.shadowRootRef.getElementById('loading');
        this.errorEl = this.shadowRootRef.getElementById('error');
        this.columnsEl = this.shadowRootRef.getElementById('columns');
        this.columnTemplateEl = this.shadowRootRef.getElementById('column-template');
        this.itemTemplateEl = this.shadowRootRef.getElementById('item-template');
        void this.loadData();
    }
    attributeChangedCallback() {
        if (!this.isConnected || !this.loadingEl)
            return;
        void this.loadData();
    }
    async loadData() {
        const projectId = this.getAttribute('project-id');
        if (projectId !== 'motivation' || !this.loadingEl)
            return;
        const currentLoad = ++this.loadSequence;
        this.loadingEl.hidden = false;
        this.errorEl.hidden = true;
        this.columnsEl.hidden = true;
        try {
            const dashboard = await ProjectsService.fetchMotivationDashboard();
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.renderColumns(dashboard.scrumboard.columns);
        }
        catch (error) {
            console.error('Failed to load scrumboard', error);
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.loadingEl.hidden = true;
            this.errorEl.hidden = false;
            this.errorEl.textContent = 'Failed to load scrumboard.';
        }
    }
    renderColumns(columns) {
        this.columnsEl.replaceChildren(...columns.map((column) => {
            const fragment = this.columnTemplateEl.content.cloneNode(true);
            const columnEl = fragment.querySelector('.board-column');
            const title = fragment.querySelector('.column-title');
            const list = fragment.querySelector('.board-list');
            title.textContent = `${column.title} (${column.items.length})`;
            if (column.id === 'active-sprint' || column.id === 'high-priority') {
                columnEl.open = true;
            }
            if (column.items.length === 0) {
                const empty = document.createElement('li');
                empty.className = 'board-item board-item--empty';
                empty.textContent = 'No stories in this lane.';
                list.appendChild(empty);
            }
            else {
                for (const item of column.items) {
                    const fragment = this.itemTemplateEl.content.cloneNode(true);
                    fragment.querySelector('.item-id').textContent =
                        item.points == null ? `Story ${item.id}` : `Story ${item.id} · ${item.points} pts`;
                    const status = fragment.querySelector('.status');
                    status.className = projectStatusClass(item.status);
                    status.textContent = formatProjectStatusLabel(item.status);
                    fragment.querySelector('.item-title').textContent = item.title;
                    fragment.querySelector('.item-meta').textContent =
                        item.points == null ? 'No estimate recorded for this item.' : `${item.points} story points`;
                    list.appendChild(fragment);
                }
            }
            return columnEl;
        }));
        this.loadingEl.hidden = true;
        this.errorEl.hidden = true;
        this.columnsEl.hidden = false;
    }
}
if (!customElements.get('project-scrumboard')) {
    customElements.define('project-scrumboard', ProjectScrumboard);
}
