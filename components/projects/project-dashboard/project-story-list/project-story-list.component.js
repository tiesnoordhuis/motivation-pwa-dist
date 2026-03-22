import styles from './project-story-list.css' with { type: 'css' };
import { formatProjectStatusLabel, projectStatusClass } from '../project-shared.js';
import { ProjectsService } from '../../../../services/projects.service.js';
const template = document.createElement('template');
template.innerHTML = `
<div class="state" id="loading">Loading stories…</div>
<div class="state" id="error" hidden></div>
<ul class="story-list" id="stories"></ul>
<template id="item-template">
    <li class="story-entry">
        <details class="story-item">
            <summary class="item-summary">
                <span class="item-text">
                    <span class="item-id"></span>
                    <span class="item-title"></span>
                </span>
                <span class="status"></span>
            </summary>
            <div class="item-body">
                <p class="item-copy" hidden></p>
                <p class="item-meta"></p>
            </div>
        </details>
    </li>
</template>
`;
export class ProjectStoryList extends HTMLElement {
    shadowRootRef;
    loadingEl;
    errorEl;
    storiesEl;
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
        this.storiesEl = this.shadowRootRef.getElementById('stories');
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
        this.storiesEl.hidden = true;
        try {
            const response = await ProjectsService.fetchMotivationStories();
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.renderStories(response.stories);
        }
        catch (error) {
            console.error('Failed to load stories', error);
            if (currentLoad !== this.loadSequence || !this.isConnected || !this.loadingEl)
                return;
            this.loadingEl.hidden = true;
            this.errorEl.hidden = false;
            this.errorEl.textContent = 'Failed to load stories.';
        }
    }
    renderStories(stories) {
        this.storiesEl.replaceChildren(...stories.map((story) => {
            const fragment = this.itemTemplateEl.content.cloneNode(true);
            fragment.querySelector('.item-id').textContent =
                story.storyPoints == null ? `Story ${story.id}` : `Story ${story.id} · ${story.storyPoints} pts`;
            const status = fragment.querySelector('.status');
            status.className = projectStatusClass(story.status);
            status.textContent = formatProjectStatusLabel(story.status);
            fragment.querySelector('.item-title').textContent = story.title;
            if (story.status === 'in_progress') {
                fragment.querySelector('.story-item').open = true;
            }
            const copy = fragment.querySelector('.item-copy');
            if (story.story) {
                copy.hidden = false;
                copy.textContent = story.story;
            }
            fragment.querySelector('.item-meta').textContent =
                `${story.priority ?? 'No priority'} · ${story.path}`;
            return fragment;
        }));
        this.loadingEl.hidden = true;
        this.errorEl.hidden = true;
        this.storiesEl.hidden = false;
    }
}
if (!customElements.get('project-story-list')) {
    customElements.define('project-story-list', ProjectStoryList);
}
