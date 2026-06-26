import{n as e}from"./router-GiPH-W_5.js";import{t}from"./section-page.utils-C-zZVD0e.js";import{t as n}from"./css-Dp6z7v3R.js";import{n as r,t as i}from"./screen-status-Bh8yMGWy.js";import{t as a}from"./projects.service-VHJS-UIu.js";import"./status-pill.component-BaGrYalX.js";var o=n(`:host{display:block}.dashboard{--panel-bg:linear-gradient(180deg, #f4f9fffa, #e1eefff0);--panel-border:#6795d642;--panel-shadow:0 18px 50px #07356d2e;--text-primary:#0c2442;--text-secondary:#47698e;color:var(--text-primary);gap:1rem;display:grid}.hero{color:#f6fbff;background:radial-gradient(circle at 100% 0,#ffffffbf,#0000 34%),linear-gradient(135deg,#083468eb,#1c66b7c7);border-radius:26px;gap:1rem;padding:1.15rem;display:grid;box-shadow:0 24px 64px #05214447}.hero-top{justify-content:space-between;align-items:start;gap:.9rem;display:flex}.hero-actions{flex-direction:column;align-items:end;gap:.75rem;display:flex}.eyebrow,.nav-card-kicker{text-transform:uppercase;letter-spacing:.1em;opacity:.72;margin:0 0 .35rem;font-size:.72rem}.hero h3,.nav-card h4,.follow-up-card h4{margin:0;line-height:1.1}.hero h3{font-size:1.55rem}.hero p{color:#f6fbffd6;margin:.35rem 0 0}.hero-info,.card-info{width:2rem;height:2rem;color:inherit;font:inherit;background:#ffffff29;border:none;border-radius:999px;font-weight:700}.nav-grid{gap:.9rem;display:grid}.nav-card,.follow-up-card{background:var(--panel-bg);border:1px solid var(--panel-border);box-shadow:var(--panel-shadow);border-radius:24px;padding:1rem 1.05rem}.nav-card-top,.follow-up-top{justify-content:space-between;align-items:start;gap:.75rem;display:flex}.nav-card-copy{color:var(--text-secondary);margin:.55rem 0 0;line-height:1.45}.nav-link{color:#1357a6;width:100%;font:inherit;text-align:left;background:#1357a61a;border:none;border-radius:16px;margin-top:.9rem;padding:.85rem 1rem;font-weight:700}.help-popover,.card-popover{color:#0c2442;background:linear-gradient(#fffffffa,#ebf3fffa);border:1px solid #6795d642;border-radius:18px;max-width:min(18rem,100vw - 2rem);padding:.85rem .95rem;line-height:1.45;box-shadow:0 24px 54px #0521443d}.help-popover::backdrop,.card-popover::backdrop{background:#0819311a}code{font-size:.84em}@media (width>=760px){.nav-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}`),s=document.createElement(`template`);s.innerHTML=`
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
                <status-pill></status-pill>
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
            <div id="scrumboard-popover" class="card-popover" popover>Source: <code>docs/scrumboard.md</code>. The dedicated view collapses lanes and lets you expand individual items.</div>
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

        <article class="nav-card">
            <div class="nav-card-top">
                <div>
                    <p class="nav-card-kicker">Server</p>
                    <h4>Logs</h4>
                </div>
                <button class="card-info" type="button" popovertarget="logs-popover" aria-label="Logs data source">i</button>
            </div>
            <p class="nav-card-copy" id="logs-preview">View, filter, and search server log entries.</p>
            <button class="nav-link" id="logs-link" type="button">Open logs</button>
            <div id="logs-popover" class="card-popover" popover>Source: <code>data/logs/*.log</code>. Daily JSON log files written by the server. Filter by level and search by keyword.</div>
        </article>

        <article class="nav-card">
            <div class="nav-card-top">
                <div>
                    <p class="nav-card-kicker">PWA</p>
                    <h4>Client logs</h4>
                </div>
                <button class="card-info" type="button" popovertarget="client-logs-popover" aria-label="Client logs data source">i</button>
            </div>
            <p class="nav-card-copy" id="client-logs-preview">PWA console + window-error logs shipped from each device.</p>
            <button class="nav-link" id="client-logs-link" type="button">Open client logs</button>
            <div id="client-logs-popover" class="card-popover" popover>Source: <code>data/logs/client/&lt;device-id&gt;-&lt;date&gt;.log</code>. Per-device daily JSON log files shipped from the PWA via the Background Sync API.</div>
        </article>
    </section>
</section>
`;var c=class extends HTMLElement{shadowRootRef;initialized=!1;loadSequence=0;constructor(){super(),this.shadowRootRef=this.attachShadow({mode:`open`}),this.shadowRootRef.adoptedStyleSheets=[o],this.shadowRootRef.appendChild(s.content.cloneNode(!0))}connectedCallback(){this.initialized||(this.initialized=!0,this.shadowRootRef.getElementById(`scrumboard-link`).addEventListener(`click`,()=>e(`/projects/scrumboard`)),this.shadowRootRef.getElementById(`stories-link`).addEventListener(`click`,()=>e(`/projects/stories`)),this.shadowRootRef.getElementById(`git-link`).addEventListener(`click`,()=>e(`/projects/git-log`)),this.shadowRootRef.getElementById(`logs-link`).addEventListener(`click`,()=>e(`/projects/logs`)),this.shadowRootRef.getElementById(`client-logs-link`).addEventListener(`click`,()=>e(`/projects/logs/client`))),this.loadOverview()}async loadOverview(){let e=++this.loadSequence;try{let t=await a.fetchMotivationSummary();if(e!==this.loadSequence||!this.isConnected)return;let n=this.shadowRootRef.getElementById(`project-name`),r=this.shadowRootRef.getElementById(`project-summary`),i=this.shadowRootRef.getElementById(`scrumboard-preview`),o=this.shadowRootRef.getElementById(`stories-preview`),s=this.shadowRootRef.getElementById(`git-preview`);n.textContent=t.project.name,r.textContent=t.sprintGoal?`${t.sprintName??`Current sprint`}: ${t.sprintGoal}.`:`Mobile-first overview of the local scrumboard, story files, and recent git activity.`,i.textContent=t.activeSprintCount>0?`${t.activeSprintCount} item${t.activeSprintCount===1?``:`s`} in the active sprint. Tap to expand lanes and story cards.`:`Current sprint and backlog lanes, optimized for quick mobile scanning.`,o.textContent=t.topStory?`${t.topStory.id} · ${t.topStory.title}. Open the stories view to expand summaries and metadata.`:`Reads the story markdown files and shows current status and scope.`,s.textContent=t.latestCommit?`${t.latestCommit.shortHash} · ${t.latestCommit.subject}. Open the git view to expand commit details.`:`Reads recent local commits from this repository.`}catch{if(e!==this.loadSequence||!this.isConnected)return}}};customElements.get(`project-dashboard`)||customElements.define(`project-dashboard`,c);var l=class extends HTMLElement{initialized=!1;statusNodes=r();statusMixin=i(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode);setLoading(){this.statusMixin.setLoading()}setError(e){this.statusMixin.setError(e)}clearStatus(){this.statusMixin.clearStatus()}connectedCallback(){if(!this.initialized){this.initialized=!0;let e=t(this,`Projects`,`projects`,`/projects`),n=document.createElement(`project-dashboard`);n.setAttribute(`project-id`,`motivation`),e.content.append(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode,n)}}};customElements.get(`projects-dashboard-screen`)||customElements.define(`projects-dashboard-screen`,l);export{l as ProjectsDashboardScreen};
//# sourceMappingURL=projects-dashboard-screen.component-DzxPI6c9.js.map