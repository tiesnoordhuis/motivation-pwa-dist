import"./config-DWYOVQ7m.js";import{n as e}from"./router-C1LAFBmV.js";import{t}from"./health-BxVwVwL4.js";import{t as n}from"./section-page.utils-plUj1ULn.js";import{t as r}from"./css-Dm_coJsa.js";import{n as i,t as a}from"./screen-status-CdSAMz3C.js";import{t as o}from"./health.service-Cxf5H_xU.js";var s=r(`:host{display:block}.edit-container{flex-direction:column;gap:16px;max-width:600px;margin:0 auto;padding:16px;display:flex}.edit-header h3{color:var(--text-primary,#fff);margin:0;font-size:1.1rem}.form-group{flex-direction:column;gap:4px;display:flex}.form-group label{color:var(--text-secondary,#aaa);font-size:.85rem}.form-input,.form-select{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);color:var(--text-primary,#fff);box-sizing:border-box;border-radius:8px;padding:10px 12px;font-size:.95rem}.form-row{gap:12px;display:flex}.form-row .form-group{flex:1}.action-buttons{gap:8px;display:flex}.btn-delete{color:#f44336;cursor:pointer;background:0 0;border:1px solid #f44336;border-radius:8px;flex:1;padding:12px;font-size:.95rem}.btn-delete:hover{background:#f443361a}.btn-save{background:var(--accent-color,#d4a017);color:#000;cursor:pointer;border:none;border-radius:8px;flex:2;padding:12px;font-size:.95rem;font-weight:600}.btn-save:hover{opacity:.9}`),c=document.createElement(`template`);c.innerHTML=`
    <div class="edit-container">
        <div class="edit-header">
            <h3>Edit Workout</h3>
        </div>

        <p class="source-note" id="source-note" hidden></p>

        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" class="form-input" placeholder="e.g. Morning run">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="type">Type</label>
                <select id="type" class="form-select">
                    ${t.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
                </select>
            </div>
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" class="form-input">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="duration">Duration (min)</label>
                <input type="number" id="duration" class="form-input" min="0" placeholder="optional">
            </div>
            <div class="form-group">
                <label for="calories">Calories burned</label>
                <input type="number" id="calories" class="form-input" min="0" placeholder="optional">
            </div>
        </div>

        <div class="form-group">
            <label for="description">Notes</label>
            <input type="text" id="description" class="form-input" placeholder="optional">
        </div>

        <div class="action-buttons">
            <button class="btn-delete" id="btn-delete">Delete</button>
            <button class="btn-save" id="btn-save">Save</button>
        </div>
    </div>
`;var l=class extends HTMLElement{_activity=null;_sourceMode=`manual`;_onSave=null;_onDelete=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[s],e.appendChild(c.content.cloneNode(!0))}connectedCallback(){let e=this.shadowRoot;e.getElementById(`btn-save`).addEventListener(`click`,()=>this.handleSave()),e.getElementById(`btn-delete`).addEventListener(`click`,()=>this.handleDelete())}set onSave(e){this._onSave=e}set onDelete(e){this._onDelete=e}set sourceMode(e){this._sourceMode=e,this.applySourceMode()}applySourceMode(){let e=this.shadowRoot,t=e.getElementById(`btn-save`),n=e.getElementById(`btn-delete`),r=e.getElementById(`source-note`);switch(this._sourceMode){case`manual`:t.hidden=!1,n.hidden=!1,r.hidden=!0,r.textContent=``;break;case`strava`:t.hidden=!0,n.hidden=!1,r.hidden=!1,r.textContent=`Imported from Strava. Editing is disabled; deleting here only hides it until the next sync.`;break;case`calendar`:t.hidden=!0,n.hidden=!0,r.hidden=!1,r.textContent=`Imported from Google Calendar. Edit or remove the event in Calendar to change it here.`;break}}set activity(e){this._activity=e,this.populateForm()}get activity(){return this._activity}populateForm(){let e=this._activity;if(!e)return;let t=this.shadowRoot;t.getElementById(`title`).value=e.title,t.getElementById(`type`).value=e.type,t.getElementById(`date`).value=e.date,t.getElementById(`duration`).value=e.duration_minutes?String(e.duration_minutes):``,t.getElementById(`calories`).value=e.calories_burned?String(e.calories_burned):``,t.getElementById(`description`).value=e.description??``}handleSave(){if(!this._activity||!this._onSave)return;let e=this.shadowRoot,t=e.getElementById(`title`).value.trim();if(!t)return;let n=parseInt(e.getElementById(`duration`).value,10),r=parseInt(e.getElementById(`calories`).value,10),i={title:t,type:e.getElementById(`type`).value,date:e.getElementById(`date`).value,description:e.getElementById(`description`).value.trim()||void 0,duration_minutes:isNaN(n)?void 0:n,calories_burned:isNaN(r)?void 0:r};this._onSave(this._activity.id,i)}handleDelete(){if(!this._activity||!this._onDelete)return;let e=this._activity.title,t=this._sourceMode===`strava`?`Delete "${e}"?\n\nThis activity is imported from Strava and will reappear on the next sync unless you also delete it in Strava.`:`Delete "${e}"?`;confirm(t)&&this._onDelete(this._activity.id)}};customElements.define(`activity-edit`,l);var u=class extends HTMLElement{initialized=!1;idValue=null;contentRoot=null;statusNodes=i();statusMixin=a(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode);setLoading(){this.statusMixin.setLoading()}setError(e){this.statusMixin.setError(e)}clearStatus(){this.statusMixin.clearStatus()}set entryId(e){this.idValue=e}connectedCallback(){this.initialized||(this.initialized=!0,this.contentRoot=n(this,`Edit workout`,`health`,`/health`).content,this.statusNodes.loadingNode.textContent=`Loading activity…`,this.statusNodes.retryNode.addEventListener(`click`,()=>{this.loadActivity()}),this.contentRoot.append(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode),this.loadActivity())}async loadActivity(){if(!(!this.idValue||!this.contentRoot)){this.setLoading();try{let e=await o.fetchActivity(this.idValue);if(!e){this.showError(`Activity ${this.idValue} not found.`);return}this.renderEditor(e)}catch(e){console.error(`Failed to load activity`,e),this.showError(e instanceof Error?e.message:`Failed to load activity.`)}}}renderEditor(e){if(!this.contentRoot)return;this.clearStatus();let t=document.createElement(`activity-edit`);t.activity=e,this.contentRoot.appendChild(t),t.sourceMode=d(e.source),t.onSave=async(t,n)=>{try{await o.updateActivity(t,n),this.returnToDay(e.date)}catch(e){console.error(`Failed to update activity`,e),this.showError(e instanceof Error?e.message:`Failed to save.`)}},t.onDelete=async t=>{try{await o.deleteActivity(t),this.returnToDay(e.date)}catch(e){console.error(`Failed to delete activity`,e),this.showError(e instanceof Error?e.message:`Failed to delete.`)}}}returnToDay(t){e(`/health/day/${encodeURIComponent(t)}`,{history:`replace`})}showError(e){this.setError(Error(e))}};function d(e){return e===`strava`?`strava`:e===`calendar`?`calendar`:`manual`}customElements.define(`health-activity-edit-screen`,u);export{u as HealthActivityEditScreen};
//# sourceMappingURL=health-activity-edit-screen.component-CuobcjiR.js.map