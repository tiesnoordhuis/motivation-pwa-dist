import"./config-D5TVd87J.js";import{n as e}from"./router-BUY8MAWQ.js";import{n as t,t as n}from"./health-DCiYE90t.js";import{t as r}from"./section-page.utils-Cfa4hvz6.js";import{t as i}from"./css-Dm_coJsa.js";import{t as a}from"./health.service-DGdHy1r9.js";import{t as o}from"./health-utils-DFHR38gK.js";import{t as s}from"./health-events-CFQzMZBp.js";var c=`:host{background-color:var(--surface-color,#1e1e1e);width:100%;height:100%;color:var(--text-color,#fff);box-sizing:border-box;display:block;overflow-y:auto}:host([hidden]){display:none!important}.day-detail-container{flex-direction:column;height:100%;display:flex}.detail-header{background-color:var(--surface-variant,#2d2d2d);z-index:10;border-bottom:1px solid var(--border-color,#333);justify-content:space-between;align-items:center;padding:16px;display:flex;position:sticky;top:0}.nav-btn{color:var(--primary-color,#4caf50);cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;width:40px;height:40px;padding:8px;font-size:24px;transition:background-color .2s;display:flex}.nav-btn:hover{background-color:#4caf501a}.date-title{text-align:center;flex-grow:1;margin:0;font-size:20px;font-weight:600}.loading,.error-banner,.empty-state{text-align:center;color:var(--text-secondary,#aaa);padding:24px}.error-banner{color:#f44336;background-color:#f443361a;border-radius:8px;margin:16px}.spinner{border:3px solid #ffffff1a;border-top:3px solid var(--primary-color,#4caf50);border-radius:50%;width:24px;height:24px;margin:0 auto 12px;animation:1s linear infinite spin}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.summary-card{background-color:var(--surface-variant,#2d2d2d);border-radius:12px;flex-direction:column;align-items:center;margin:16px;padding:20px;display:flex;box-shadow:0 4px 6px #0000001a}.summary-main{text-align:center;margin-bottom:16px}.cal-val{color:var(--primary-color,#4caf50);font-size:36px;font-weight:700}.cal-unit{color:var(--text-secondary,#aaa);margin-left:4px;font-size:14px}.summary-macros{justify-content:center;gap:12px;width:100%;display:flex}.macro-badge{color:var(--text-secondary,#ccc);background-color:#ffffff0d;border-radius:16px;padding:6px 12px;font-size:12px}.macro-badge span{color:var(--text-color,#fff);font-weight:600}.detail-section{margin:0 16px 24px}.section-header{border-bottom:1px solid var(--border-color,#333);justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;display:flex}.section-header h3{color:var(--text-secondary,#ccc);margin:0;font-size:16px}.add-mini-btn{color:var(--primary-color,#4caf50);cursor:pointer;background-color:#4caf501a;border:none;border-radius:50%;justify-content:center;align-items:center;width:28px;height:28px;font-size:18px;line-height:1;transition:background-color .2s,transform .1s;display:flex}.add-mini-btn:hover{background-color:var(--primary-color,#4caf50);color:#fff}.add-mini-btn:active{transform:scale(.95)}.food-list{flex-direction:column;gap:8px;display:flex}.food-item{background-color:var(--surface-variant,#2d2d2d);border-radius:8px;justify-content:space-between;align-items:center;padding:12px 16px;display:flex}.food-name{font-size:14px}.food-cals{color:var(--primary-color,#4caf50);font-size:14px;font-weight:500}#workouts-list{flex-direction:column;gap:8px;display:flex}`,l=i(`:host{width:100%;display:block}.detail-card{background-color:var(--surface-variant,#2d2d2d);border-radius:10px;align-items:center;gap:12px;padding:12px 16px;transition:background-color .2s;display:flex}.detail-card:hover{background-color:#ffffff14}.card-left{flex-shrink:0}.type-icon{background:var(--health-color-light,#f1c40f26);border-radius:10px;justify-content:center;align-items:center;width:36px;height:36px;font-size:1.2rem;display:flex}.card-body{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.card-title{color:var(--text-color,#fff);white-space:nowrap;text-overflow:ellipsis;font-size:14px;font-weight:600;overflow:hidden}.card-meta{color:var(--text-secondary,#aaa);white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.card-right{flex-shrink:0}.source-badge{opacity:.7;font-size:1rem}`),u={manual:`✏️`,strava:`🟧`,calendar:`📅`},d=document.createElement(`template`);d.innerHTML=`
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
`;var f=class extends HTMLElement{_activity=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[l],e.appendChild(d.content.cloneNode(!0))}set activity(e){this._activity=e,this.render()}formatDuration(e){if(!e)return``;if(e>=60){let t=Math.floor(e/60),n=e%60;return n>0?`${t}h ${n}min`:`${t}h`}return`${e} min`}render(){let e=this._activity;if(!e)return;let t=this.shadowRoot;t.getElementById(`type-icon`).textContent=o(e.type),t.getElementById(`title`).textContent=e.title;let n=[],r=this.formatDuration(e.duration_minutes);r&&n.push(r),e.calories_burned&&n.push(`${Math.round(e.calories_burned)} kcal`),e.description&&n.push(e.description),t.getElementById(`meta`).textContent=n.join(` · `);let i=t.getElementById(`source-badge`);i.textContent=u[e.source]??`❓`,i.title=e.source.charAt(0).toUpperCase()+e.source.slice(1)}};customElements.define(`activity-detail-card`,f);var p=i(c),m=document.createElement(`template`);m.innerHTML=`
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
`;var h=class extends HTMLElement{_dateStr=``;_activities=[];_nutrition=[];_summary=null;constructor(){super();let t=this.attachShadow({mode:`open`});t.adoptedStyleSheets=[p],t.appendChild(m.content.cloneNode(!0)),t.getElementById(`prev-btn`).addEventListener(`click`,()=>{this._dateStr&&e(`/health/day/${Temporal.PlainDate.from(this._dateStr).subtract({days:1}).toString()}`,{history:`replace`})}),t.getElementById(`next-btn`).addEventListener(`click`,()=>{this._dateStr&&e(`/health/day/${Temporal.PlainDate.from(this._dateStr).add({days:1}).toString()}`,{history:`replace`})}),t.getElementById(`add-workout-btn`).addEventListener(`click`,()=>{this._dateStr&&this.dispatchDayDetailEvent(s.ADD_WORKOUT,{date:this._dateStr})}),t.querySelectorAll(`button[data-meal]`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.meal;this._dateStr&&t&&this.dispatchDayDetailEvent(s.ADD_FOOD,{date:this._dateStr,meal:t})})})}set dateContext(e){this._dateStr=e,this.shadowRoot.getElementById(`day-title`).textContent=e}get dateContext(){return this._dateStr}set activities(e){this._activities=e,this.renderWorkouts()}set nutrition(e){this._nutrition=e,this.renderNutrition(),this.renderSummary()}set summary(e){this._summary=e,this.renderSummary()}showLoading(){let e=this.shadowRoot;e.getElementById(`loading`).hidden=!1,e.getElementById(`content`).hidden=!0,e.getElementById(`error`).hidden=!0}hideLoading(){this.shadowRoot.getElementById(`loading`).hidden=!0}showError(e){let t=this.shadowRoot,n=t.getElementById(`error`);n.textContent=e,n.hidden=!1,t.getElementById(`loading`).hidden=!0}showContent(){this.shadowRoot.getElementById(`content`).hidden=!1}renderSummary(){let e=this.shadowRoot,t=0,n=0,r=0,i=0;this._summary?(t=this._summary.total_calories,n=this._summary.total_protein_g,r=this._summary.total_carbs_g,i=this._summary.total_fat_g):this._nutrition.length>0&&(t=this._nutrition.reduce((e,t)=>e+(t.calories??0),0),n=this._nutrition.reduce((e,t)=>e+(t.protein_g??0),0),r=this._nutrition.reduce((e,t)=>e+(t.carbs_g??0),0),i=this._nutrition.reduce((e,t)=>e+(t.fat_g??0),0)),e.getElementById(`total-cal`).textContent=String(Math.round(t)),e.getElementById(`total-p`).textContent=String(Math.round(n)),e.getElementById(`total-c`).textContent=String(Math.round(r)),e.getElementById(`total-f`).textContent=String(Math.round(i))}renderWorkouts(){let e=this.shadowRoot.getElementById(`workouts-list`);if(e.replaceChildren(),this._activities.length===0){let t=document.createElement(`div`);t.className=`empty-state`,t.textContent=`No workouts logged.`,e.appendChild(t);return}for(let t of this._activities){let n=document.createElement(`activity-detail-card`);n.activity=t,t.source!==`calendar`&&(n.style.cursor=`pointer`,n.addEventListener(`click`,()=>{this.dispatchDayDetailEvent(s.EDIT_WORKOUT,{activity:t})})),e.appendChild(n)}}renderNutrition(){let e=this.shadowRoot;for(let n of t){let t=e.getElementById(`${n.toLowerCase()}-list`);t.replaceChildren();let r=this._nutrition.filter(e=>e.meal_type&&e.meal_type.toLowerCase()===n.toLowerCase());if(r.length===0){let e=document.createElement(`div`);e.className=`empty-state`,e.textContent=`Nothing logged yet.`,t.appendChild(e);continue}for(let e of r){let n=document.createElement(`div`);n.className=`food-item`,n.style.cursor=`pointer`;let r=document.createElement(`span`);r.className=`food-name`,r.textContent=e.food_name??`Unknown food`;let i=document.createElement(`span`);i.className=`food-cals`,i.textContent=`${Math.round(e.calories??0)} kcal`,n.appendChild(r),n.appendChild(i),n.addEventListener(`click`,()=>{this.dispatchDayDetailEvent(s.EDIT_FOOD,{entry:e})}),t.appendChild(n)}}}dispatchDayDetailEvent(e,t){let n=this.ownerDocument.defaultView?.CustomEvent??CustomEvent;this.dispatchEvent(new n(e,{bubbles:!0,composed:!0,detail:t}))}};customElements.define(`health-day-detail`,h);var g=document.createElement(`template`);g.innerHTML=`
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
                    ${n.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1).replace(`-`,` `)}</option>`).join(``)}
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
`;var _=class extends HTMLElement{initialized=!1;detail=null;loadSequence=0;dateValue=``;dialogHost=null;set date(e){this.dateValue=e}connectedCallback(){if(!this.initialized){this.initialized=!0;let e=r(this,`Health`,`health`,`/health`);this.detail=document.createElement(`health-day-detail`),this.detail.dateContext=this.dateValue,this.detail.showLoading(),e.content.appendChild(this.detail),this.dialogHost=document.createElement(`div`),e.content.appendChild(this.dialogHost),this.dialogHost.appendChild(g.content.cloneNode(!0)),this.wireDetail(),this.wireAddDialog()}this.detail&&(this.detail.dateContext=this.dateValue),this.loadData()}wireDetail(){this.detail&&(this.detail.addEventListener(s.ADD_WORKOUT,e=>{let{detail:t}=e;this.openManualAddDialog(t.date)}),this.detail.addEventListener(s.ADD_FOOD,t=>{let{detail:n}=t;e(`/health/food-entry/${encodeURIComponent(n.date)}/${encodeURIComponent(n.meal)}`)}),this.detail.addEventListener(s.EDIT_FOOD,t=>{let{detail:n}=t;e(`/health/nutrition/${encodeURIComponent(n.entry.id)}`)}),this.detail.addEventListener(s.EDIT_WORKOUT,t=>{let{detail:n}=t;e(`/health/activity/${encodeURIComponent(n.activity.id)}`)}))}wireAddDialog(){let e=this.querySelector(`#activity-dialog`),t=this.querySelector(`#activity-form`);!e||!t||e.addEventListener(`close`,()=>{if(e.returnValue!==`save`){t.reset();return}let n=this.querySelector(`#act-title`)?.value??``,r=this.querySelector(`#act-type`)?.value??`other`,i=this.querySelector(`#act-date`)?.value??``,a=this.querySelector(`#act-duration`)?.value??``,o=a?parseInt(a,10):void 0;if(!n||!i){t.reset();return}this.saveManualActivity({title:n,type:r,date:i,duration_minutes:o}),t.reset()})}async saveManualActivity(e){try{await a.createActivity(e),await this.loadData()}catch(e){console.error(`Failed to create activity`,e),this.detail?.showError(`Failed to save activity.`)}}openManualAddDialog(e){let t=this.querySelector(`#activity-dialog`),n=this.querySelector(`#act-date`);!t||!n||(n.value=e,t.showModal())}async loadData(){if(!this.detail)return;let e=++this.loadSequence;this.detail.dateContext=this.dateValue,this.detail.showLoading();try{let[t,n]=await Promise.all([a.fetchActivitiesByDate(this.dateValue),a.fetchNutritionByDate(this.dateValue)]);if(e!==this.loadSequence||!this.detail)return;this.detail.activities=t,this.detail.nutrition=n,this.detail.hideLoading(),this.detail.showContent()}catch(t){console.error(`Failed to load day detail data`,t),e===this.loadSequence&&this.detail.showError(`Failed to load detail for ${this.dateValue}`)}}};customElements.define(`health-day-screen`,_);export{_ as HealthDayScreen};
//# sourceMappingURL=health-day-screen.component-CyjYCRVI.js.map