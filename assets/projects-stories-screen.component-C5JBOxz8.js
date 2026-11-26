import{t as e}from"./section-page.utils-CC8BnMla.js";import"./src-DOutIqrb.js";import{t}from"./css-Dp6z7v3R.js";import{t as n}from"./projects.service-BZK_keqD.js";import{t as r}from"./component-logger-vUiJPJw3.js";import{n as i,t as a}from"./screen-status-D6nDc17m.js";var o=[`story`,`acceptanceCriteria`,`storyPoints`,`priority`,`blockers`,`dependencies`,`designNotes`],s={story:`Story`,acceptanceCriteria:`Acceptance Criteria`,storyPoints:`Story Points`,priority:`Priority`,blockers:`Blockers`,dependencies:`Dependencies`,designNotes:`Design Notes`},c=`:host{display:block}.state{color:var(--sec-border);background:#1357a60f;border-radius:16px;padding:.8rem .85rem}.story-list{gap:.7rem;margin:0;padding:0;list-style:none;display:grid}.draft-list:not(:empty){margin-block-end:.7rem}.story-list[hidden]{display:none}.story-entry{list-style:none}.story-item{background:#1357a60f;border-radius:16px;overflow:hidden}.item-summary{cursor:pointer;background-color:#e8f0f7;justify-content:space-between;align-items:start;gap:.7rem;padding:.8rem .85rem;list-style:none;display:flex}.item-summary::-webkit-details-marker{display:none}.item-text{gap:.15rem;display:grid}.item-id{color:#224c7c;letter-spacing:.08em;text-transform:uppercase;font-size:.75rem;font-weight:700}.item-title{color:#0c2442;font-weight:700}.item-body{background:#ffffffc7;border-top:1px solid #6795d629;padding:0 .85rem .85rem}.item-copy,.item-meta{color:#18385f;margin:.45rem 0 0;font-size:.9rem;line-height:1.4}.item-copy[hidden]{display:none}.status{letter-spacing:.06em;text-transform:uppercase;border-radius:999px;justify-content:center;align-items:center;min-width:5.5rem;padding:.28rem .55rem;font-size:.72rem;font-weight:700;display:inline-flex}.status--todo{color:#0f4d95;background:#1357a62e}.status--in-progress{color:#7a4700;background:#de8f1238}.status--done{color:#0d5a35;background:#1a875433}.status--superseded,.status--unknown{color:#2f557d;background:#46698e2e}.status--draft{color:#4f2a7a;background:#7848aa2e}.draft-actions{gap:.5rem;display:flex}.draft-actions[hidden]{display:none}.form-note{color:#18385f;margin:0;font-size:.85rem}.toolbar{justify-content:flex-end;margin:0 0 .7rem;display:flex}.toolbar button{color:#0f4d95;cursor:pointer;background:#e8f0f7;border:1px solid #1357a647;border-radius:12px;padding:.45rem .85rem;font-weight:600}.edit-button,.discard-button,.story-form button{color:#0f4d95;cursor:pointer;background:#1357a61f;border:1px solid #1357a647;border-radius:10px;margin-top:.55rem;padding:.45rem .85rem;font-weight:600}.story-form .save-button{color:#fff;background:#0f4d95}.story-form{background:#ffffffeb;border:1px solid #6795d62e;border-radius:16px;gap:.7rem;padding:.85rem;display:grid}.field{gap:.25rem;display:grid}:is(.story-form input:user-invalid,.story-form textarea:user-invalid){outline:2px solid var(--sec-danger);outline-offset:-2px}.more-fields>summary{cursor:pointer;color:#0f4d95;font-size:.9rem;font-weight:600}.more-sections{gap:.7rem;margin-block-start:.6rem;display:grid}.field-label{color:#18385f;font-size:.85rem;font-weight:600}.story-form input,.story-form select,.story-form textarea{font:inherit;box-sizing:border-box;border:1px solid #1357a63d;border-radius:8px;width:100%;padding:.45rem .6rem}.story-form textarea{resize:vertical;font-family:monospace}.form-actions{gap:.5rem;display:flex}.form-error,.item-error{color:#7c1d12;white-space:pre-wrap;word-break:break-word;background:#b423181f;border-radius:10px;margin:.45rem 0 0;padding:.55rem .7rem;font-size:.82rem}`;function l(e){return e===`in_progress`?`In progress`:e===`done`?`Done`:e===`superseded`?`Superseded`:e===`unknown`?`Unknown`:`Todo`}function u(e){return`status status--${e.replace(`_`,`-`)}`}var d=t(c),f=document.createElement(`template`);f.innerHTML=`
<div class="state" id="loading">Loading stories…</div>
<div class="state" id="error" hidden></div>
<div class="toolbar" hidden id="toolbar">
    <button type="button" id="new-story">+ New story</button>
</div>
<ul class="story-list draft-list" id="drafts" aria-label="Story drafts"></ul>
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
<template id="draft-template">
    <li class="story-entry draft-entry">
        <details class="story-item">
            <summary class="item-summary">
                <span class="item-text">
                    <span class="item-id"></span>
                    <span class="item-title"></span>
                </span>
                <span class="status status--draft"></span>
            </summary>
            <div class="item-body">
                <p class="item-copy" hidden></p>
                <p class="item-meta"></p>
                <div class="draft-actions" hidden>
                    <button type="button" class="edit-button">Edit</button>
                    <button type="button" class="discard-button">Discard</button>
                </div>
                <pre class="item-error" hidden></pre>
            </div>
        </details>
    </li>
</template>
<template id="form-template">
    <form class="story-form">
        <label class="field">
            <span class="field-label">Title</span>
            <input type="text" name="title" maxlength="200" required pattern=".*\\S.*" title="A title, not only spaces" />
        </label>
        <div class="sections"></div>
        <details class="more-fields">
            <summary>More fields</summary>
            <div class="more-sections"></div>
        </details>
        <p class="form-note">Saved as a draft; <code>npm run stories:import</code> at the desktop writes it as a story file.</p>
        <div class="form-actions">
            <button type="submit" class="save-button">Save draft</button>
            <button type="button" class="cancel-button">Cancel</button>
        </div>
        <pre class="form-error" hidden></pre>
    </form>
</template>
<template id="section-template">
    <label class="field">
        <span class="field-label"></span>
        <textarea rows="4"></textarea>
    </label>
</template>
`;var p=class extends HTMLElement{shadowRootRef;loadingEl;errorEl;toolbarEl;draftsEl;storiesEl;itemTemplateEl;draftTemplateEl;formTemplateEl;sectionTemplateEl;loadSequence=0;log=r(`project-story-list`);static get observedAttributes(){return[`project-id`]}constructor(){super(),this.shadowRootRef=this.attachShadow({mode:`open`}),this.shadowRootRef.adoptedStyleSheets=[d],this.shadowRootRef.appendChild(f.content.cloneNode(!0))}connectedCallback(){this.loadingEl=this.shadowRootRef.getElementById(`loading`),this.errorEl=this.shadowRootRef.getElementById(`error`),this.toolbarEl=this.shadowRootRef.getElementById(`toolbar`),this.draftsEl=this.shadowRootRef.getElementById(`drafts`),this.storiesEl=this.shadowRootRef.getElementById(`stories`),this.itemTemplateEl=this.shadowRootRef.getElementById(`item-template`),this.draftTemplateEl=this.shadowRootRef.getElementById(`draft-template`),this.formTemplateEl=this.shadowRootRef.getElementById(`form-template`),this.sectionTemplateEl=this.shadowRootRef.getElementById(`section-template`),this.shadowRootRef.getElementById(`new-story`).addEventListener(`click`,()=>this.openForm(null)),this.loadData()}attributeChangedCallback(){this.isConnected&&this.loadingEl&&this.loadData()}async loadData(){if(this.getAttribute(`project-id`)!==`motivation`||!this.loadingEl)return;let e=++this.loadSequence;this.loadingEl.hidden=!1,this.errorEl.hidden=!0,this.draftsEl.hidden=!0,this.storiesEl.hidden=!0,this.toolbarEl.hidden=!0;try{let[{stories:t},{drafts:r}]=await Promise.all([n.fetchMotivationStories(),n.fetchStoryDrafts()]);if(e!==this.loadSequence||!this.isConnected||!this.loadingEl)return;this.render(t,r)}catch(t){if(this.log.error(`Failed to load stories`,t),e!==this.loadSequence||!this.isConnected||!this.loadingEl)return;this.loadingEl.hidden=!0,this.errorEl.hidden=!1,this.errorEl.textContent=t instanceof Error?t.stack??t.message:String(t)}}render(e,t){let n=new Set(e.map(e=>e.id)),r=t.filter(e=>e.status===`open`||e.storyId!==null&&!n.has(e.storyId));this.draftsEl.replaceChildren(...r.map(e=>this.buildDraftEntry(e))),this.storiesEl.replaceChildren(...e.map(e=>this.buildStoryEntry(e))),this.loadingEl.hidden=!0,this.errorEl.hidden=!0,this.toolbarEl.hidden=!1,this.draftsEl.hidden=!1,this.storiesEl.hidden=!1}buildStoryEntry(e){let t=this.itemTemplateEl.content.cloneNode(!0);t.querySelector(`.item-id`).textContent=e.storyPoints==null?`Story ${e.id}`:`Story ${e.id} · ${e.storyPoints} pts`;let n=t.querySelector(`.status`);n.className=u(e.status),n.textContent=l(e.status),t.querySelector(`.item-title`).textContent=e.title,e.status===`in_progress`&&(t.querySelector(`.story-item`).open=!0);let r=t.querySelector(`.item-copy`);return e.story&&(r.hidden=!1,r.textContent=e.story),t.querySelector(`.item-meta`).textContent=`${e.priority??`No priority`} · ${e.path}`,t}buildDraftEntry(e){let t=this.draftTemplateEl.content.cloneNode(!0),n=e.status===`open`;t.querySelector(`.item-id`).textContent=n?`Draft`:`Draft → story ${e.storyId}`,t.querySelector(`.item-title`).textContent=e.title,t.querySelector(`.status`).textContent=n?`Draft`:`Imported`;let r=t.querySelector(`.item-copy`);e.sections.story&&(r.hidden=!1,r.textContent=e.sections.story),t.querySelector(`.item-meta`).textContent=n?`Waiting for the desktop import`:`Written as story ${e.storyId}; it shows here once the repo is pulled`;let i=t.querySelector(`.draft-entry`);return n&&(t.querySelector(`.draft-actions`).hidden=!1,t.querySelector(`.edit-button`).addEventListener(`click`,t=>{t.preventDefault(),this.openForm(e,i)}),t.querySelector(`.discard-button`).addEventListener(`click`,t=>{t.preventDefault(),this.discard(e,i)})),t}async discard(e,t){if(!confirm(`Discard the draft "${e.title}"?`))return;let r=t.querySelector(`.item-error`);r.hidden=!0;try{await n.discardStoryDraft(e.id),await this.loadData()}catch(e){this.log.error(`Failed to discard the story draft`,e),r.hidden=!1,r.textContent=e instanceof Error?e.stack??e.message:String(e)}}openForm(e,t){let r=this.buildForm(e,async t=>{e?await n.updateStoryDraft(e.id,t):await n.createStoryDraft(t),await this.loadData()}),i=document.createElement(`li`);i.className=`story-entry story-entry--editing`,i.appendChild(r),t?t.replaceWith(i):this.draftsEl.prepend(i)}buildForm(e,t){let n=this.formTemplateEl.content.cloneNode(!0).querySelector(`.story-form`),r=n.querySelector(`input[name=title]`),i=n.querySelector(`.sections`),a=n.querySelector(`.more-fields`),c=n.querySelector(`.more-sections`),l=n.querySelector(`.form-error`);r.value=e?.title??``;let u=new Map;for(let t of o){let n=this.sectionTemplateEl.content.cloneNode(!0);n.querySelector(`.field-label`).textContent=s[t];let r=n.querySelector(`textarea`);r.value=e?.sections[t]??``,u.set(t,r),t===`story`?i.appendChild(n):(r.rows=2,r.value.trim()&&(a.open=!0),c.appendChild(n))}return n.querySelector(`.cancel-button`).addEventListener(`click`,e=>{e.preventDefault(),this.loadData()}),n.addEventListener(`submit`,async e=>{e.preventDefault(),l.hidden=!0;let i=n.querySelector(`.save-button`);i.disabled=!0;try{let e={};for(let[t,n]of u)n.value.trim().length>0&&(e[t]=n.value);await t({title:r.value.trim(),sections:e})}catch(e){this.log.error(`Failed to save the story draft`,e),l.hidden=!1,l.textContent=e instanceof Error?e.stack??e.message:String(e),i.disabled=!1}}),n}};customElements.get(`project-story-list`)||customElements.define(`project-story-list`,p);var m=class extends HTMLElement{initialized=!1;statusNodes=i();statusMixin=a(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode);setLoading(){this.statusMixin.setLoading()}setError(e){this.statusMixin.setError(e)}clearStatus(){this.statusMixin.clearStatus()}connectedCallback(){if(this.initialized)return;this.initialized=!0;let t=e(this,`Stories`,`projects`,`/projects`),n=document.createElement(`p`);n.textContent=`Tap a story to reveal its summary and metadata while keeping the list compact on mobile.`,t.content.append(n,this.statusNodes.errorNode);let r=document.createElement(`project-story-list`);r.setAttribute(`project-id`,`motivation`),t.content.appendChild(r)}};customElements.get(`projects-stories-screen`)||customElements.define(`projects-stories-screen`,m);export{m as ProjectsStoriesScreen};
//# sourceMappingURL=projects-stories-screen.component-C5JBOxz8.js.map