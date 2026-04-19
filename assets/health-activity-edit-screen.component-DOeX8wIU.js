import{n as e}from"./router-DgfgiOCv.js";import"./config-D5TVd87J.js";import{t}from"./css-BNv6fBmm.js";import{m as n,u as r}from"./app-B63DI7K9.js";import{t as i}from"./health.service-L5yQEFxo.js";var a=t(`:host{display:block}.edit-container{flex-direction:column;gap:16px;max-width:600px;margin:0 auto;padding:16px;display:flex}.edit-header h3{color:var(--text-primary,#fff);margin:0;font-size:1.1rem}.form-group{flex-direction:column;gap:4px;display:flex}.form-group label{color:var(--text-secondary,#aaa);font-size:.85rem}.form-input,.form-select{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);color:var(--text-primary,#fff);box-sizing:border-box;border-radius:8px;padding:10px 12px;font-size:.95rem}.form-row{gap:12px;display:flex}.form-row .form-group{flex:1}.action-buttons{gap:8px;display:flex}.btn-delete{color:#f44336;cursor:pointer;background:0 0;border:1px solid #f44336;border-radius:8px;flex:1;padding:12px;font-size:.95rem}.btn-delete:hover{background:#f443361a}.btn-save{background:var(--accent-color,#d4a017);color:#000;cursor:pointer;border:none;border-radius:8px;flex:2;padding:12px;font-size:.95rem;font-weight:600}.btn-save:hover{opacity:.9}`),o=document.createElement(`template`);o.innerHTML=`
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
                    ${n.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
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
`;var s=class extends HTMLElement{_activity=null;_sourceMode=`manual`;_onSave=null;_onDelete=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[a],e.appendChild(o.content.cloneNode(!0))}connectedCallback(){let e=this.shadowRoot;e.getElementById(`btn-save`).addEventListener(`click`,()=>this.handleSave()),e.getElementById(`btn-delete`).addEventListener(`click`,()=>this.handleDelete())}set onSave(e){this._onSave=e}set onDelete(e){this._onDelete=e}set sourceMode(e){this._sourceMode=e,this.applySourceMode()}applySourceMode(){let e=this.shadowRoot,t=e.getElementById(`btn-save`),n=e.getElementById(`btn-delete`),r=e.getElementById(`source-note`);switch(this._sourceMode){case`manual`:t.hidden=!1,n.hidden=!1,r.hidden=!0,r.textContent=``;break;case`strava`:t.hidden=!0,n.hidden=!1,r.hidden=!1,r.textContent=`Imported from Strava. Editing is disabled; deleting here only hides it until the next sync.`;break;case`calendar`:t.hidden=!0,n.hidden=!0,r.hidden=!1,r.textContent=`Imported from Google Calendar. Edit or remove the event in Calendar to change it here.`;break}}set activity(e){this._activity=e,this.populateForm()}get activity(){return this._activity}populateForm(){let e=this._activity;if(!e)return;let t=this.shadowRoot;t.getElementById(`title`).value=e.title,t.getElementById(`type`).value=e.type,t.getElementById(`date`).value=e.date,t.getElementById(`duration`).value=e.duration_minutes?String(e.duration_minutes):``,t.getElementById(`calories`).value=e.calories_burned?String(e.calories_burned):``,t.getElementById(`description`).value=e.description??``}handleSave(){if(!this._activity||!this._onSave)return;let e=this.shadowRoot,t=e.getElementById(`title`).value.trim();if(!t)return;let n=parseInt(e.getElementById(`duration`).value,10),r=parseInt(e.getElementById(`calories`).value,10),i={title:t,type:e.getElementById(`type`).value,date:e.getElementById(`date`).value,description:e.getElementById(`description`).value.trim()||void 0,duration_minutes:isNaN(n)?void 0:n,calories_burned:isNaN(r)?void 0:r};this._onSave(this._activity.id,i)}handleDelete(){if(!this._activity||!this._onDelete)return;let e=this._activity.title,t=this._sourceMode===`strava`?`Delete "${e}"?\n\nThis activity is imported from Strava and will reappear on the next sync unless you also delete it in Strava.`:`Delete "${e}"?`;confirm(t)&&this._onDelete(this._activity.id)}};customElements.define(`activity-edit`,s);var c=class extends HTMLElement{initialized=!1;idValue=null;contentRoot=null;errorEl=null;loadingEl=null;set entryId(e){this.idValue=e}connectedCallback(){this.initialized||(this.initialized=!0,this.contentRoot=r(this,`Edit workout`,`health`,`/health`).content,this.loadingEl=document.createElement(`p`),this.loadingEl.className=`loading-text`,this.loadingEl.textContent=`Loading activity…`,this.contentRoot.appendChild(this.loadingEl),this.errorEl=document.createElement(`p`),this.errorEl.className=`error-text`,this.errorEl.hidden=!0,this.contentRoot.appendChild(this.errorEl),this.loadActivity())}async loadActivity(){if(!(!this.idValue||!this.contentRoot))try{let e=await i.fetchActivity(this.idValue);if(!e){this.showError(`Activity ${this.idValue} not found.`);return}this.renderEditor(e)}catch(e){console.error(`Failed to load activity`,e),this.showError(e instanceof Error?e.message:`Failed to load activity.`)}}renderEditor(e){if(!this.contentRoot)return;this.loadingEl.hidden=!0,this.errorEl.hidden=!0;let t=document.createElement(`activity-edit`);t.activity=e,this.contentRoot.appendChild(t),t.sourceMode=l(e.source),t.onSave=async(t,n)=>{try{await i.updateActivity(t,n),this.returnToDay(e.date)}catch(e){console.error(`Failed to update activity`,e),this.showError(e instanceof Error?e.message:`Failed to save.`)}},t.onDelete=async t=>{try{await i.deleteActivity(t),this.returnToDay(e.date)}catch(e){console.error(`Failed to delete activity`,e),this.showError(e instanceof Error?e.message:`Failed to delete.`)}}}returnToDay(t){e(`/health/day/${encodeURIComponent(t)}`,{history:`replace`})}showError(e){!this.errorEl||!this.loadingEl||(this.loadingEl.hidden=!0,this.errorEl.textContent=e,this.errorEl.hidden=!1)}};function l(e){return e===`strava`?`strava`:e===`calendar`?`calendar`:`manual`}customElements.define(`health-activity-edit-screen`,c);export{c as HealthActivityEditScreen};
//# sourceMappingURL=health-activity-edit-screen.component-DOeX8wIU.js.map