import styles from './project-git-log.css' with { type: 'css' };
import { ProjectsService } from '../../../../services/projects.service.js';
const template = document.createElement('template');
template.innerHTML = `
<div class="state" id="loading">Loading git activity…</div>
<div class="state" id="error" hidden></div>
<ul class="git-list" id="commits"></ul>
<template id="item-template">
    <li class="git-entry">
        <details class="git-item">
            <summary class="item-summary">
                <span class="item-text">
                    <span class="item-id item-hash"></span>
                    <span class="item-title"></span>
                </span>
                <span class="item-id item-date"></span>
            </summary>
            <div class="item-body">
                <p class="item-meta"></p>
                <p class="item-detail item-full-hash"></p>
            </div>
        </details>
    </li>
</template>
`;
export class ProjectGitLog extends HTMLElement {
    shadowRootRef;
    loadingEl;
    errorEl;
    commitsEl;
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
        this.commitsEl = this.shadowRootRef.getElementById('commits');
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
        this.commitsEl.hidden = true;
        try {
            const response = await ProjectsService.fetchMotivationGitLog();
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.renderCommits(response.commits);
        }
        catch (error) {
            console.error('Failed to load git activity', error);
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.loadingEl.hidden = true;
            this.errorEl.hidden = false;
            this.errorEl.textContent = 'Failed to load git activity.';
        }
    }
    renderCommits(commits) {
        this.commitsEl.replaceChildren(...commits.map((commit) => {
            const fragment = this.itemTemplateEl.content.cloneNode(true);
            fragment.querySelector('.item-hash').textContent = commit.shortHash;
            fragment.querySelector('.item-date').textContent = commit.committedAt.slice(0, 10);
            fragment.querySelector('.item-title').textContent = commit.subject;
            fragment.querySelector('.item-meta').textContent = `Author: ${commit.authorName}`;
            fragment.querySelector('.item-full-hash').textContent = `Full hash: ${commit.hash}`;
            return fragment;
        }));
        this.loadingEl.hidden = true;
        this.errorEl.hidden = true;
        this.commitsEl.hidden = false;
    }
}
if (!customElements.get('project-git-log')) {
    customElements.define('project-git-log', ProjectGitLog);
}
