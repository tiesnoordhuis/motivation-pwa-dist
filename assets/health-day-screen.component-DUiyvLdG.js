import{n as e}from"./router-DgfgiOCv.js";import{t}from"./css-V3318djX.js";import"./config-D5TVd87J.js";import{f as n,n as r,r as i}from"./app-pO1an9OQ.js";import{t as a}from"./health.service-pY8kd7RC.js";import{t as o}from"./health-utils-B71opbHk.js";import{r as s}from"./food-serving-form.component-OoORqLS5.js";import{t as c}from"./health-events-BHsDJj0j.js";var l=`:host{background-color:var(--surface-color,#1e1e1e);width:100%;height:100%;color:var(--text-color,#fff);box-sizing:border-box;display:block;overflow-y:auto}:host([hidden]){display:none!important}.day-detail-container{flex-direction:column;height:100%;display:flex}.detail-header{background-color:var(--surface-variant,#2d2d2d);z-index:10;border-bottom:1px solid var(--border-color,#333);justify-content:space-between;align-items:center;padding:16px;display:flex;position:sticky;top:0}.nav-btn{color:var(--primary-color,#4caf50);cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;width:40px;height:40px;padding:8px;font-size:24px;transition:background-color .2s;display:flex}.nav-btn:hover{background-color:#4caf501a}.date-title{text-align:center;flex-grow:1;margin:0;font-size:20px;font-weight:600}.loading,.error-banner,.empty-state{text-align:center;color:var(--text-secondary,#aaa);padding:24px}.error-banner{color:#f44336;background-color:#f443361a;border-radius:8px;margin:16px}.spinner{border:3px solid #ffffff1a;border-top:3px solid var(--primary-color,#4caf50);border-radius:50%;width:24px;height:24px;margin:0 auto 12px;animation:1s linear infinite spin}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.summary-card{background-color:var(--surface-variant,#2d2d2d);border-radius:12px;flex-direction:column;align-items:center;margin:16px;padding:20px;display:flex;box-shadow:0 4px 6px #0000001a}.summary-main{text-align:center;margin-bottom:16px}.cal-val{color:var(--primary-color,#4caf50);font-size:36px;font-weight:700}.cal-unit{color:var(--text-secondary,#aaa);margin-left:4px;font-size:14px}.summary-macros{justify-content:center;gap:12px;width:100%;display:flex}.macro-badge{color:var(--text-secondary,#ccc);background-color:#ffffff0d;border-radius:16px;padding:6px 12px;font-size:12px}.macro-badge span{color:var(--text-color,#fff);font-weight:600}.detail-section{margin:0 16px 24px}.section-header{border-bottom:1px solid var(--border-color,#333);justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;display:flex}.section-header h3{color:var(--text-secondary,#ccc);margin:0;font-size:16px}.add-mini-btn{color:var(--primary-color,#4caf50);cursor:pointer;background-color:#4caf501a;border:none;border-radius:50%;justify-content:center;align-items:center;width:28px;height:28px;font-size:18px;line-height:1;transition:background-color .2s,transform .1s;display:flex}.add-mini-btn:hover{background-color:var(--primary-color,#4caf50);color:#fff}.add-mini-btn:active{transform:scale(.95)}.food-list{flex-direction:column;gap:8px;display:flex}.food-item{background-color:var(--surface-variant,#2d2d2d);border-radius:8px;justify-content:space-between;align-items:center;padding:12px 16px;display:flex}.food-name{font-size:14px}.food-cals{color:var(--primary-color,#4caf50);font-size:14px;font-weight:500}#workouts-list{flex-direction:column;gap:8px;display:flex}`,u=t(`:host{width:100%;display:block}.detail-card{background-color:var(--surface-variant,#2d2d2d);border-radius:10px;align-items:center;gap:12px;padding:12px 16px;transition:background-color .2s;display:flex}.detail-card:hover{background-color:#ffffff14}.card-left{flex-shrink:0}.type-icon{background:var(--health-color-light,#f1c40f26);border-radius:10px;justify-content:center;align-items:center;width:36px;height:36px;font-size:1.2rem;display:flex}.card-body{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.card-title{color:var(--text-color,#fff);white-space:nowrap;text-overflow:ellipsis;font-size:14px;font-weight:600;overflow:hidden}.card-meta{color:var(--text-secondary,#aaa);white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.card-right{flex-shrink:0}.source-badge{opacity:.7;font-size:1rem}`),d={manual:`✏️`,strava:`🟧`,calendar:`📅`},f=document.createElement(`template`);f.innerHTML=`
    <div class="detail-card">
        <div class="card-left">
            <div class="type-icon" id="type-icon"></div>
        </div>
        <div class="card-body">
            <div class="card-title" id="title"></div>
            <div class="card-meta" id="meta"></div>
        </div>
        <div class="card-right">
            <span class="source-badge" id="source-badge" title=""></span>
        </div>
    </div>
`;var p=class extends HTMLElement{_activity=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[u],e.appendChild(f.content.cloneNode(!0))}set activity(e){this._activity=e,this.render()}formatDuration(e){if(!e)return``;if(e>=60){let t=Math.floor(e/60),n=e%60;return n>0?`${t}h ${n}min`:`${t}h`}return`${e} min`}render(){let e=this._activity;if(!e)return;let t=this.shadowRoot;t.getElementById(`type-icon`).textContent=o(e.type),t.getElementById(`title`).textContent=e.title;let n=[],r=this.formatDuration(e.duration_minutes);r&&n.push(r),e.calories_burned&&n.push(`${Math.round(e.calories_burned)} kcal`),e.description&&n.push(e.description),t.getElementById(`meta`).textContent=n.join(` · `);let i=t.getElementById(`source-badge`);i.textContent=d[e.source]??`❓`,i.title=e.source.charAt(0).toUpperCase()+e.source.slice(1)}};customElements.define(`activity-detail-card`,p);var m=t(l),h=document.createElement(`template`);h.innerHTML=`
    <div class="day-detail-container">
        <header class="detail-header">
            <button class="nav-btn" id="prev-btn" title="Previous Day">←</button>
            <h2 id="day-title" class="date-title">Day Detail</h2>
            <button class="nav-btn" id="next-btn" title="Next Day">→</button>
        </header>

        <div id="loading" class="loading" hidden>
            <div class="spinner"></div>
            <div>Loading data...</div>
        </div>

        <div id="error" class="error-banner" hidden></div>

        <div id="content" hidden>
            <section class="summary-card">
                <div class="summary-main">
                    <span class="cal-val" id="total-cal">0</span>
                    <span class="cal-unit">kcal total</span>
                </div>
                <div class="summary-macros">
                    <div class="macro-badge">Protein: <span id="total-p">0</span>g</div>
                    <div class="macro-badge">Carbs: <span id="total-c">0</span>g</div>
                    <div class="macro-badge">Fat: <span id="total-f">0</span>g</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Workouts</h3>
                    <button class="add-mini-btn" id="add-workout-btn" title="Add Workout">+</button>
                </div>
                <div id="workouts-list">
                    <div class="empty-state">No workouts logged.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Breakfast</h3>
                    <button class="add-mini-btn" data-meal="Breakfast" title="Add Breakfast">+</button>
                </div>
                <div id="breakfast-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Lunch</h3>
                    <button class="add-mini-btn" data-meal="Lunch" title="Add Lunch">+</button>
                </div>
                <div id="lunch-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Dinner</h3>
                    <button class="add-mini-btn" data-meal="Dinner" title="Add Dinner">+</button>
                </div>
                <div id="dinner-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Snacks</h3>
                    <button class="add-mini-btn" data-meal="Snacks" title="Add Snacks">+</button>
                </div>
                <div id="snacks-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>
        </div>
    </div>
`;var g=class extends HTMLElement{_dateStr=``;_activities=[];_nutrition=[];_summary=null;constructor(){super();let t=this.attachShadow({mode:`open`});t.adoptedStyleSheets=[m],t.appendChild(h.content.cloneNode(!0)),t.getElementById(`prev-btn`).addEventListener(`click`,()=>{this._dateStr&&e(`/health/day/${Temporal.PlainDate.from(this._dateStr).subtract({days:1}).toString()}`,{history:`replace`})}),t.getElementById(`next-btn`).addEventListener(`click`,()=>{this._dateStr&&e(`/health/day/${Temporal.PlainDate.from(this._dateStr).add({days:1}).toString()}`,{history:`replace`})}),t.getElementById(`add-workout-btn`).addEventListener(`click`,()=>{this._dateStr&&this.dispatchDayDetailEvent(c.ADD_WORKOUT,{date:this._dateStr})}),t.querySelectorAll(`button[data-meal]`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.meal;this._dateStr&&t&&this.dispatchDayDetailEvent(c.ADD_FOOD,{date:this._dateStr,meal:t})})})}set dateContext(e){this._dateStr=e,this.shadowRoot.getElementById(`day-title`).textContent=e}get dateContext(){return this._dateStr}set activities(e){this._activities=e,this.renderWorkouts()}set nutrition(e){this._nutrition=e,this.renderNutrition(),this.renderSummary()}set summary(e){this._summary=e,this.renderSummary()}showLoading(){let e=this.shadowRoot;e.getElementById(`loading`).hidden=!1,e.getElementById(`content`).hidden=!0,e.getElementById(`error`).hidden=!0}hideLoading(){this.shadowRoot.getElementById(`loading`).hidden=!0}showError(e){let t=this.shadowRoot,n=t.getElementById(`error`);n.textContent=e,n.hidden=!1,t.getElementById(`loading`).hidden=!0}showContent(){this.shadowRoot.getElementById(`content`).hidden=!1}renderSummary(){let e=this.shadowRoot,t=0,n=0,r=0,i=0;this._summary?(t=this._summary.total_calories,n=this._summary.total_protein_g,r=this._summary.total_carbs_g,i=this._summary.total_fat_g):this._nutrition.length>0&&(t=this._nutrition.reduce((e,t)=>e+(t.calories??0),0),n=this._nutrition.reduce((e,t)=>e+(t.protein_g??0),0),r=this._nutrition.reduce((e,t)=>e+(t.carbs_g??0),0),i=this._nutrition.reduce((e,t)=>e+(t.fat_g??0),0)),e.getElementById(`total-cal`).textContent=String(Math.round(t)),e.getElementById(`total-p`).textContent=String(Math.round(n)),e.getElementById(`total-c`).textContent=String(Math.round(r)),e.getElementById(`total-f`).textContent=String(Math.round(i))}renderWorkouts(){let e=this.shadowRoot.getElementById(`workouts-list`);if(e.replaceChildren(),this._activities.length===0){let t=document.createElement(`div`);t.className=`empty-state`,t.textContent=`No workouts logged.`,e.appendChild(t);return}for(let t of this._activities){let n=document.createElement(`activity-detail-card`);n.activity=t,t.source===`manual`&&(n.style.cursor=`pointer`,n.addEventListener(`click`,()=>{this.dispatchDayDetailEvent(c.EDIT_WORKOUT,{activity:t})})),e.appendChild(n)}}renderNutrition(){let e=this.shadowRoot;for(let t of i){let n=e.getElementById(`${t.toLowerCase()}-list`);n.replaceChildren();let r=this._nutrition.filter(e=>e.meal_type&&e.meal_type.toLowerCase()===t.toLowerCase());if(r.length===0){let e=document.createElement(`div`);e.className=`empty-state`,e.textContent=`Nothing logged yet.`,n.appendChild(e);continue}for(let e of r){let t=document.createElement(`div`);t.className=`food-item`,t.style.cursor=`pointer`;let r=document.createElement(`span`);r.className=`food-name`,r.textContent=e.food_name??`Unknown food`;let i=document.createElement(`span`);i.className=`food-cals`,i.textContent=`${Math.round(e.calories??0)} kcal`,t.appendChild(r),t.appendChild(i),t.addEventListener(`click`,()=>{this.dispatchDayDetailEvent(c.EDIT_FOOD,{entry:e})}),n.appendChild(t)}}}dispatchDayDetailEvent(e,t){let n=this.ownerDocument.defaultView?.CustomEvent??CustomEvent;this.dispatchEvent(new n(e,{bubbles:!0,composed:!0,detail:t}))}};customElements.define(`health-day-detail`,g);var _=t(`:host{display:block}.edit-container{flex-direction:column;gap:16px;max-width:600px;margin:0 auto;padding:16px;display:flex}.edit-header{align-items:center;gap:8px;display:flex}.edit-header h3{color:var(--text-primary,#fff);flex:1;margin:0;font-size:1.1rem}.source-badge{text-transform:uppercase;color:var(--accent-color,#d4a017);background:#d4a01726;border-radius:8px;padding:2px 8px;font-size:.75rem;font-weight:600}.food-name-input{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);width:100%;color:var(--text-primary,#fff);box-sizing:border-box;border-radius:8px;padding:10px 12px;font-size:1.1rem;font-weight:600}.food-name-input:read-only{opacity:.7;cursor:not-allowed}.macro-grid{grid-template-columns:repeat(4,1fr);gap:8px;display:grid}.macro-item{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);border-radius:8px;flex-direction:column;align-items:center;gap:4px;padding:12px 4px;display:flex}.macro-input{text-align:center;border:1px solid var(--border-color,#444);width:60px;color:var(--text-primary,#fff);-moz-appearance:textfield;background:0 0;border-radius:6px;padding:6px;font-size:1.1rem;font-weight:600}.macro-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.macro-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.macro-label{color:var(--text-secondary,#aaa);text-transform:uppercase;font-size:.75rem}.extra-macros{grid-template-columns:repeat(2,1fr);gap:8px;display:grid}.extra-macro-item{border:1px solid var(--border-color,#444);border-radius:8px;justify-content:space-between;align-items:center;padding:8px 12px;display:flex}.extra-macro-label{color:var(--text-secondary,#aaa);font-size:.85rem}.extra-macro-input{text-align:right;border:1px solid var(--border-color,#444);width:50px;color:var(--text-primary,#fff);-moz-appearance:textfield;background:0 0;border-radius:6px;padding:4px;font-size:.95rem}.extra-macro-input::-webkit-outer-spin-button{-webkit-appearance:none}.extra-macro-input::-webkit-inner-spin-button{-webkit-appearance:none}.form-row{gap:12px;display:flex}.form-group{flex-direction:column;flex:1;gap:4px;display:flex}.form-group label{color:var(--text-secondary,#aaa);font-size:.85rem}.form-select,.form-input{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);color:var(--text-primary,#fff);border-radius:8px;padding:10px 12px;font-size:.95rem}.action-buttons{gap:8px;display:flex}.btn-delete{color:#f44336;cursor:pointer;background:0 0;border:1px solid #f44336;border-radius:8px;flex:1;padding:12px;font-size:.95rem}.btn-delete:hover{background:#f443361a}.btn-save{background:var(--accent-color,#d4a017);color:#000;cursor:pointer;border:none;border-radius:8px;flex:2;padding:12px;font-size:.95rem;font-weight:600}.btn-save:hover{opacity:.9}.serving-group{flex-direction:column;gap:4px;display:flex}.serving-controls{align-items:center;gap:4px;display:flex}.btn-step{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);width:36px;height:36px;color:var(--text-primary,#fff);cursor:pointer;border-radius:8px;justify-content:center;align-items:center;font-size:1.1rem;display:flex}.serving-input{text-align:center;border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);width:70px;color:var(--text-primary,#fff);-moz-appearance:textfield;border-radius:8px;padding:8px;font-size:1rem}.serving-input::-webkit-outer-spin-button{-webkit-appearance:none}.serving-input::-webkit-inner-spin-button{-webkit-appearance:none}`),v=document.createElement(`template`);v.innerHTML=`
    <div class="edit-container">
        <div class="edit-header">
            <h3>Edit Entry</h3>
            <span class="source-badge" id="source-badge"></span>
        </div>

        <input type="text" id="food-name" class="food-name-input" placeholder="Food name">

        <food-serving-form id="serving-form" editable></food-serving-form>

        <div class="form-row">
            <div class="form-group">
                <label for="meal-type">Meal</label>
                <select id="meal-type" class="form-select">
                    ${i.map(e=>`<option value="${e}">${e}</option>`).join(`
                    `)}
                </select>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn-delete" id="btn-delete">Delete</button>
            <button class="btn-save" id="btn-save">Save</button>
        </div>
    </div>
`;var y={manual:`Manual`,openfoodfacts:`Open Food Facts`,ai_estimate:`AI Estimate`},b=class extends HTMLElement{_entry=null;_onSave=null;_onDelete=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[_],e.appendChild(v.content.cloneNode(!0))}connectedCallback(){let e=this.shadowRoot;e.getElementById(`btn-save`).addEventListener(`click`,()=>this.handleSave()),e.getElementById(`btn-delete`).addEventListener(`click`,()=>this.handleDelete())}set onSave(e){this._onSave=e}set onDelete(e){this._onDelete=e}set entry(e){this._entry=e,this.populateForm()}get entry(){return this._entry}populateForm(){let e=this._entry;if(!e)return;let t=this.shadowRoot;t.getElementById(`source-badge`).textContent=y[e.source]??e.source;let n=t.getElementById(`food-name`);n.value=e.food_name??``,n.readOnly=e.source===`openfoodfacts`,t.getElementById(`meal-type`).value=e.meal_type;let r=t.getElementById(`serving-form`);r.data=s(e)}handleSave(){if(!this._entry||!this._onSave)return;let e=this.shadowRoot,t=e.getElementById(`serving-form`),{servingAmount:n,serving:r}=t.getCurrentValues(),i=t._data?.servingByWeight??!1,a={food_name:e.getElementById(`food-name`).value.trim(),meal_type:e.getElementById(`meal-type`).value,...r};i&&(a.serving_size=`${Math.round(n)}g`),this._onSave(this._entry.id,a)}handleDelete(){!this._entry||!this._onDelete||confirm(`Delete "${this._entry.food_name}"?`)&&this._onDelete(this._entry.id)}};customElements.define(`nutrition-edit`,b);var x=t(`:host{display:block}.edit-container{flex-direction:column;gap:16px;max-width:600px;margin:0 auto;padding:16px;display:flex}.edit-header h3{color:var(--text-primary,#fff);margin:0;font-size:1.1rem}.form-group{flex-direction:column;gap:4px;display:flex}.form-group label{color:var(--text-secondary,#aaa);font-size:.85rem}.form-input,.form-select{border:1px solid var(--border-color,#444);background:var(--surface-color,#1e1e1e);color:var(--text-primary,#fff);box-sizing:border-box;border-radius:8px;padding:10px 12px;font-size:.95rem}.form-row{gap:12px;display:flex}.form-row .form-group{flex:1}.action-buttons{gap:8px;display:flex}.btn-delete{color:#f44336;cursor:pointer;background:0 0;border:1px solid #f44336;border-radius:8px;flex:1;padding:12px;font-size:.95rem}.btn-delete:hover{background:#f443361a}.btn-save{background:var(--accent-color,#d4a017);color:#000;cursor:pointer;border:none;border-radius:8px;flex:2;padding:12px;font-size:.95rem;font-weight:600}.btn-save:hover{opacity:.9}`),S=document.createElement(`template`);S.innerHTML=`
    <div class="edit-container">
        <div class="edit-header">
            <h3>Edit Workout</h3>
        </div>

        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" class="form-input" placeholder="e.g. Morning run">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="type">Type</label>
                <select id="type" class="form-select">
                    ${r.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
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
`;var C=class extends HTMLElement{_activity=null;_onSave=null;_onDelete=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[x],e.appendChild(S.content.cloneNode(!0))}connectedCallback(){let e=this.shadowRoot;e.getElementById(`btn-save`).addEventListener(`click`,()=>this.handleSave()),e.getElementById(`btn-delete`).addEventListener(`click`,()=>this.handleDelete())}set onSave(e){this._onSave=e}set onDelete(e){this._onDelete=e}set activity(e){this._activity=e,this.populateForm()}get activity(){return this._activity}populateForm(){let e=this._activity;if(!e)return;let t=this.shadowRoot;t.getElementById(`title`).value=e.title,t.getElementById(`type`).value=e.type,t.getElementById(`date`).value=e.date,t.getElementById(`duration`).value=e.duration_minutes?String(e.duration_minutes):``,t.getElementById(`calories`).value=e.calories_burned?String(e.calories_burned):``,t.getElementById(`description`).value=e.description??``}handleSave(){if(!this._activity||!this._onSave)return;let e=this.shadowRoot,t=e.getElementById(`title`).value.trim();if(!t)return;let n=parseInt(e.getElementById(`duration`).value,10),r=parseInt(e.getElementById(`calories`).value,10),i={title:t,type:e.getElementById(`type`).value,date:e.getElementById(`date`).value,description:e.getElementById(`description`).value.trim()||void 0,duration_minutes:isNaN(n)?void 0:n,calories_burned:isNaN(r)?void 0:r};this._onSave(this._activity.id,i)}handleDelete(){!this._activity||!this._onDelete||confirm(`Delete "${this._activity.title}"?`)&&this._onDelete(this._activity.id)}};customElements.define(`activity-edit`,C);var w=document.createElement(`template`);w.innerHTML=`
    <dialog class="activity-dialog" id="activity-dialog">
        <form method="dialog" id="activity-form">
            <h2>Log Activity</h2>
            <div class="form-group">
                <label for="act-title">Title</label>
                <input type="text" id="act-title" required placeholder="e.g. Morning run">
            </div>
            <div class="form-group">
                <label for="act-type">Type</label>
                <select id="act-type">
                    ${r.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1).replace(`-`,` `)}</option>`).join(``)}
                </select>
            </div>
            <div class="form-group">
                <label for="act-date">Date</label>
                <input type="date" id="act-date" required>
            </div>
            <div class="form-group">
                <label for="act-duration">Duration (minutes)</label>
                <input type="number" id="act-duration" min="1" placeholder="60">
            </div>
            <div class="dialog-actions">
                <button value="cancel" formnovalidate>Cancel</button>
                <button value="save" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>
`;var T=class extends HTMLElement{initialized=!1;detail=null;loadSequence=0;dateValue=``;dialogRoot=null;set date(e){this.dateValue=e}connectedCallback(){if(!this.initialized){this.initialized=!0;let e=n(this,`Health`,`health`,`/health`);this.detail=document.createElement(`health-day-detail`),this.detail.dateContext=this.dateValue,this.detail.showLoading(),e.content.appendChild(this.detail),this.dialogRoot=document.createElement(`div`),e.content.appendChild(this.dialogRoot),this.dialogRoot.appendChild(w.content.cloneNode(!0)),this.wireDetail(),this.wireAddDialog()}this.detail&&(this.detail.dateContext=this.dateValue),this.loadData()}wireDetail(){this.detail&&(this.detail.addEventListener(c.ADD_WORKOUT,e=>{let{detail:t}=e;this.openManualAddDialog(t.date)}),this.detail.addEventListener(c.ADD_FOOD,t=>{let{detail:n}=t;e(`/health/food-entry/${encodeURIComponent(n.date)}/${encodeURIComponent(n.meal)}`)}),this.detail.addEventListener(c.EDIT_FOOD,e=>{let{detail:t}=e;this.showNutritionEditor(t.entry)}),this.detail.addEventListener(c.EDIT_WORKOUT,e=>{let{detail:t}=e;this.showActivityEditor(t.activity)}))}wireAddDialog(){let e=this.querySelector(`#activity-dialog`),t=this.querySelector(`#activity-form`);!e||!t||e.addEventListener(`close`,()=>{if(e.returnValue!==`save`){t.reset();return}let n=this.querySelector(`#act-title`)?.value??``,r=this.querySelector(`#act-type`)?.value??`other`,i=this.querySelector(`#act-date`)?.value??``,a=this.querySelector(`#act-duration`)?.value??``,o=a?parseInt(a,10):void 0;if(!n||!i){t.reset();return}this.saveManualActivity({title:n,type:r,date:i,duration_minutes:o}),t.reset()})}async saveManualActivity(e){try{await a.createActivity(e),await this.loadData()}catch(e){console.error(`Failed to create activity`,e),this.detail?.showError(`Failed to save activity.`)}}openManualAddDialog(e){let t=this.querySelector(`#activity-dialog`),n=this.querySelector(`#act-date`);!t||!n||(n.value=e,t.showModal())}async loadData(){if(!this.detail)return;let e=++this.loadSequence;this.detail.dateContext=this.dateValue,this.detail.showLoading();try{let[t,n]=await Promise.all([a.fetchActivitiesByDate(this.dateValue),a.fetchNutritionByDate(this.dateValue)]);if(e!==this.loadSequence||!this.detail)return;this.detail.activities=t,this.detail.nutrition=n,this.detail.hideLoading(),this.detail.showContent()}catch(t){console.error(`Failed to load day detail data`,t),e===this.loadSequence&&this.detail.showError(`Failed to load detail for ${this.dateValue}`)}}showNutritionEditor(e){if(!this.detail||!this.dialogRoot)return;this.detail.hidden=!0;let t=document.createElement(`nutrition-edit`);t.entry=e,t.onSave=async(e,n)=>{try{await a.updateNutritionEntry(e,n),t.remove(),this.detail.hidden=!1,await this.loadData()}catch(e){console.error(`Failed to update nutrition entry`,e)}},t.onDelete=async e=>{try{await a.deleteNutritionEntry(e),t.remove(),this.detail.hidden=!1,await this.loadData()}catch(e){console.error(`Failed to delete nutrition entry`,e)}},this.dialogRoot.appendChild(t)}showActivityEditor(e){if(!this.detail||!this.dialogRoot)return;this.detail.hidden=!0;let t=document.createElement(`activity-edit`);t.activity=e,t.onSave=async(e,n)=>{try{await a.updateActivity(e,n),t.remove(),this.detail.hidden=!1,await this.loadData()}catch(e){console.error(`Failed to update activity`,e)}},t.onDelete=async e=>{try{await a.deleteActivity(e),t.remove(),this.detail.hidden=!1,await this.loadData()}catch(e){console.error(`Failed to delete activity`,e)}},this.dialogRoot.appendChild(t)}};customElements.define(`health-day-screen`,T);export{T as HealthDayScreen};
//# sourceMappingURL=health-day-screen.component-DUiyvLdG.js.map