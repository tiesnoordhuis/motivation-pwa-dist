import styles from './project-dashboard.css' with { type: 'css' };
import { ProjectsService } from '../../../services/projects.service.js';
import { navigate } from '../../../router.js';
const template = document.createElement('template');
template.innerHTML = `
<section class="dashboard">
    <section class="hero">
        <div class="hero-top">
            <div>
                <p class="eyebrow">Project dashboard</p>
                <h3 id="project-name">Motivation</h3>
                <p id="project-summary">Mobile-first overview of the local scrumboard, story files, and recent git activity.</p>
            </div>
            <div class="hero-actions">
                <button class="hero-info" type="button" popovertarget="project-help-popover" aria-label="Project dashboard help">?</button>
                <server-status-pill></server-status-pill>
            </div>
        </div>
    </section>

    <div id="project-help-popover" class="help-popover" popover>
        Tap a card to open a dedicated mobile view. Inside those views, use expandable details for deeper context without overwhelming the first screen.
    </div>

    <section class="nav-grid">
        <article class="nav-card">
            <div class="nav-card-top">
                <div>
                    <p class="nav-card-kicker">Current sprint</p>
                    <h4>Scrumboard</h4>
                </div>
                <button class="card-info" type="button" popovertarget="scrumboard-popover" aria-label="Scrumboard data source">i</button>
            </div>
            <p class="nav-card-copy" id="scrumboard-preview">Reads the local scrumboard and groups stories by lane.</p>
            <button class="nav-link" id="scrumboard-link" type="button">Open scrumboard</button>
            <div id="scrumboard-popover" class="card-popover" popover>Source: <code>scrumboard.md</code>. The dedicated view collapses lanes and lets you expand individual items.</div>
        </article>

        <article class="nav-card">
            <div class="nav-card-top">
                <div>
                    <p class="nav-card-kicker">Tracked work</p>
                    <h4>Stories</h4>
                </div>
                <button class="card-info" type="button" popovertarget="stories-popover" aria-label="Story data source">i</button>
            </div>
            <p class="nav-card-copy" id="stories-preview">Reads the story markdown files and shows current status and scope.</p>
            <button class="nav-link" id="stories-link" type="button">Open stories</button>
            <div id="stories-popover" class="card-popover" popover>Source: <code>docs/stories/*.md</code>. Open a story to reveal its summary and metadata.</div>
        </article>

        <article class="nav-card">
            <div class="nav-card-top">
                <div>
                    <p class="nav-card-kicker">Repository</p>
                    <h4>Git activity</h4>
                </div>
                <button class="card-info" type="button" popovertarget="git-popover" aria-label="Git activity data source">i</button>
            </div>
            <p class="nav-card-copy" id="git-preview">Reads recent local commits from this repository.</p>
            <button class="nav-link" id="git-link" type="button">Open git activity</button>
            <div id="git-popover" class="card-popover" popover>Source: local <code>git log</code>. Expand commits in the dedicated view for metadata and hashes.</div>
        </article>
    </section>

    <section class="follow-up-card">
        <div class="follow-up-top">
            <div>
                <p class="nav-card-kicker">Coming next</p>
                <h4>Infrastructure follow-ups</h4>
            </div>
            <button class="card-info" type="button" popovertarget="infra-popover" aria-label="Infrastructure follow-up notes">i</button>
        </div>
        <p class="nav-card-copy">Docker status, Ollama service health, and filtered log exploration still need dedicated backend contracts.</p>
        <div id="infra-popover" class="card-popover" popover>Kept intentionally out of the overview until the API contracts are real. The UI already reserves room for those follow-up slices.</div>
    </section>
</section>
`;
export class ProjectDashboard extends HTMLElement {
    shadowRootRef;
    initialized = false;
    loadSequence = 0;
    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.adoptedStyleSheets = [styles];
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            this.shadowRootRef.getElementById('scrumboard-link').addEventListener('click', () => navigate('#/projects/scrumboard'));
            this.shadowRootRef.getElementById('stories-link').addEventListener('click', () => navigate('#/projects/stories'));
            this.shadowRootRef.getElementById('git-link').addEventListener('click', () => navigate('#/projects/git-log'));
        }
        void this.loadOverview();
    }
    async loadOverview() {
        const currentLoad = ++this.loadSequence;
        try {
            const summary = await ProjectsService.fetchMotivationSummary();
            if (currentLoad !== this.loadSequence || !this.isConnected)
                return;
            const projectName = this.shadowRootRef.getElementById('project-name');
            const projectSummary = this.shadowRootRef.getElementById('project-summary');
            const scrumboardPreview = this.shadowRootRef.getElementById('scrumboard-preview');
            const storiesPreview = this.shadowRootRef.getElementById('stories-preview');
            const gitPreview = this.shadowRootRef.getElementById('git-preview');
            projectName.textContent = summary.project.name;
            projectSummary.textContent = summary.sprintGoal
                ? `${summary.sprintName ?? 'Current sprint'}: ${summary.sprintGoal}.`
                : 'Mobile-first overview of the local scrumboard, story files, and recent git activity.';
            scrumboardPreview.textContent = summary.activeSprintCount > 0
                ? `${summary.activeSprintCount} item${summary.activeSprintCount === 1 ? '' : 's'} in the active sprint. Tap to expand lanes and story cards.`
                : 'Current sprint and backlog lanes, optimized for quick mobile scanning.';
            storiesPreview.textContent = summary.topStory
                ? `${summary.topStory.id} · ${summary.topStory.title}. Open the stories view to expand summaries and metadata.`
                : 'Reads the story markdown files and shows current status and scope.';
            gitPreview.textContent = summary.latestCommit
                ? `${summary.latestCommit.shortHash} · ${summary.latestCommit.subject}. Open the git view to expand commit details.`
                : 'Reads recent local commits from this repository.';
        }
        catch {
            if (currentLoad !== this.loadSequence || !this.isConnected)
                return;
        }
    }
}
if (!customElements.get('project-dashboard')) {
    customElements.define('project-dashboard', ProjectDashboard);
}
