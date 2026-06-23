import{t as e}from"./component-logger-vUiJPJw3.js";import{t}from"./section-page.utils-C-zZVD0e.js";import{t as n}from"./css-Dp6z7v3R.js";import{t as r}from"./projects.service-B80ExK7g.js";var i=n(`:host{display:block}.state{color:#47698e;background:#1357a60f;border-radius:16px;padding:.8rem .85rem}.git-list{gap:.7rem;margin:0;padding:0;list-style:none;display:grid}.git-entry{list-style:none}.git-item{background:#1357a60f;border-radius:16px;overflow:hidden}.item-summary{cursor:pointer;justify-content:space-between;align-items:start;gap:.7rem;padding:.8rem .85rem;list-style:none;display:flex}.item-summary::-webkit-details-marker{display:none}.item-text{gap:.15rem;display:grid}.item-id{color:#47698e;letter-spacing:.08em;text-transform:uppercase;font-size:.75rem}.item-title{color:#0c2442;font-weight:700}.item-body{padding:0 .85rem .85rem}.item-meta,.item-detail{color:#47698e;word-break:break-word;margin:.45rem 0 0;font-size:.9rem;line-height:1.4}`),a=document.createElement(`template`);a.innerHTML=`
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
`;var o=class extends HTMLElement{shadowRootRef;loadingEl;errorEl;commitsEl;itemTemplateEl;loadSequence=0;log=e(`project-git-log`);static get observedAttributes(){return[`project-id`]}constructor(){super(),this.shadowRootRef=this.attachShadow({mode:`open`}),this.shadowRootRef.adoptedStyleSheets=[i],this.shadowRootRef.appendChild(a.content.cloneNode(!0))}connectedCallback(){this.loadingEl=this.shadowRootRef.getElementById(`loading`),this.errorEl=this.shadowRootRef.getElementById(`error`),this.commitsEl=this.shadowRootRef.getElementById(`commits`),this.itemTemplateEl=this.shadowRootRef.getElementById(`item-template`),this.loadData()}attributeChangedCallback(){!this.isConnected||!this.loadingEl||this.loadData()}async loadData(){if(this.getAttribute(`project-id`)!==`motivation`||!this.loadingEl)return;let e=++this.loadSequence;this.loadingEl.hidden=!1,this.errorEl.hidden=!0,this.commitsEl.hidden=!0;try{let t=await r.fetchMotivationGitLog();if(e!==this.loadSequence||!this.isConnected||!this.loadingEl)return;this.renderCommits(t.commits)}catch(t){if(this.log.error(`Failed to load git activity`,t),e!==this.loadSequence||!this.isConnected||!this.loadingEl)return;this.loadingEl.hidden=!0,this.errorEl.hidden=!1,this.errorEl.textContent=`Failed to load git activity.`}}renderCommits(e){this.commitsEl.replaceChildren(...e.map(e=>{let t=this.itemTemplateEl.content.cloneNode(!0);return t.querySelector(`.item-hash`).textContent=e.shortHash,t.querySelector(`.item-date`).textContent=e.committedAt.slice(0,10),t.querySelector(`.item-title`).textContent=e.subject,t.querySelector(`.item-meta`).textContent=`Author: ${e.authorName}`,t.querySelector(`.item-full-hash`).textContent=`Full hash: ${e.hash}`,t})),this.loadingEl.hidden=!0,this.errorEl.hidden=!0,this.commitsEl.hidden=!1}};customElements.get(`project-git-log`)||customElements.define(`project-git-log`,o);var s=class extends HTMLElement{initialized=!1;setLoading(){}setError(e){}clearStatus(){}connectedCallback(){if(this.initialized)return;this.initialized=!0;let e=t(this,`Git Activity`,`projects`,`/projects`),n=document.createElement(`p`);n.textContent=`Recent commits stay collapsed by default. Expand a row to see author and full hash details.`,e.content.appendChild(n);let r=document.createElement(`project-git-log`);r.setAttribute(`project-id`,`motivation`),e.content.appendChild(r)}};customElements.get(`projects-git-log-screen`)||customElements.define(`projects-git-log-screen`,s);export{s as ProjectsGitLogScreen};
//# sourceMappingURL=projects-git-log-screen.component-DH9sKrCc.js.map