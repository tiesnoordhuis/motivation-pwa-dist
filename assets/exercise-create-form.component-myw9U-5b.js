import{n as e,r as t}from"./health-DmcTDljc.js";import{t as n}from"./css-Dp6z7v3R.js";var r=n(`:host{display:block}.ex-form{background:var(--surface-color,#1e1e1e);border:1px solid var(--border-color,#444);border-radius:.75rem;flex-direction:column;gap:.6rem;padding:.85rem;display:flex}.ex-form__field{flex-direction:column;flex:1;gap:.25rem;display:flex}.ex-form__field>span{opacity:.7;font-size:.8rem}.ex-form__row{gap:.6rem;display:flex}.ex-form__input{background:var(--surface-variant,#2d2d2d);color:inherit;border:1px solid var(--border-color,#555);box-sizing:border-box;border-radius:.5rem;padding:.5rem;font-size:.95rem}.ex-form__tracks{border:1px solid var(--border-color,#444);border-radius:.5rem;gap:1rem;margin:0;padding:.4rem .6rem;font-size:.85rem;display:flex}.ex-form__tracks legend{opacity:.6;padding:0 .3rem;font-size:.75rem}.ex-form__tracks label{align-items:center;gap:.3rem;display:inline-flex}.ex-form__error{color:#f87171;margin:0;font-size:.85rem}.ex-form__actions{justify-content:flex-end;gap:.6rem;display:flex}.ex-form__btn{border:1px solid var(--border-color,#555);background:var(--surface-variant,#2d2d2d);color:inherit;cursor:pointer;border-radius:.5rem;padding:.5rem 1rem;font-size:.9rem}.ex-form__btn--primary{color:#fff;background:#2563eb;border-color:#2563eb}`);function i(e){return e.trim().toLowerCase().replace(/[^a-z0-9]+/g,`_`).replace(/^_+|_+$/g,``)}var a=document.createElement(`template`);a.innerHTML=`
    <form class="ex-form" novalidate>
        <label class="ex-form__field">
            <span>Name</span>
            <input type="text" id="name" class="ex-form__input" placeholder="e.g. Cable Crunch" autocomplete="off">
        </label>

        <div class="ex-form__row">
            <label class="ex-form__field">
                <span>Category</span>
                <select id="category" class="ex-form__input">
                    ${e.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
                </select>
            </label>
            <label class="ex-form__field">
                <span>Unit</span>
                <select id="unit" class="ex-form__input">
                    ${t.map(e=>`<option value="${e}">${e}</option>`).join(``)}
                </select>
            </label>
        </div>

        <fieldset class="ex-form__tracks">
            <legend>Tracks</legend>
            <label><input type="checkbox" id="tracks_reps" checked> Reps</label>
            <label><input type="checkbox" id="tracks_weight" checked> Weight</label>
            <label><input type="checkbox" id="tracks_duration"> Duration</label>
        </fieldset>

        <p class="ex-form__error" id="error" hidden></p>

        <div class="ex-form__actions">
            <button type="button" class="ex-form__btn" id="cancel">Cancel</button>
            <button type="submit" class="ex-form__btn ex-form__btn--primary" id="submit">Create</button>
        </div>
    </form>
`;var o=class extends HTMLElement{_onSubmit=null;_onCancel=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[r],e.appendChild(a.content.cloneNode(!0))}connectedCallback(){let e=this.shadowRoot;e.querySelector(`form`).addEventListener(`submit`,e=>{e.preventDefault(),this.handleSubmit()}),e.getElementById(`cancel`).addEventListener(`click`,()=>this._onCancel?.()),e.getElementById(`unit`).addEventListener(`change`,e=>{e.target.value===`bodyweight`&&(this.weightInput.checked=!1)})}set presetName(e){this.nameInput.value=e,queueMicrotask(()=>this.nameInput.focus())}set exercise(e){let t=this.shadowRoot;this.nameInput.value=e.display_name,t.getElementById(`category`).value=e.category,t.getElementById(`unit`).value=e.default_unit,t.getElementById(`tracks_reps`).checked=e.tracks_reps===1,this.weightInput.checked=e.tracks_weight===1,t.getElementById(`tracks_duration`).checked=e.tracks_duration===1,t.getElementById(`submit`).textContent=`Save`}set onSubmit(e){this._onSubmit=e}set onCancel(e){this._onCancel=e}get nameInput(){return this.shadowRoot.getElementById(`name`)}get weightInput(){return this.shadowRoot.getElementById(`tracks_weight`)}handleSubmit(){let e=this.shadowRoot,t=e.getElementById(`error`),n=this.nameInput.value.trim(),r=i(n);if(!n||!r){t.textContent=`Enter a name.`,t.hidden=!1;return}t.hidden=!0;let a={canonical_name:r,display_name:n,category:e.getElementById(`category`).value,default_unit:e.getElementById(`unit`).value,tracks_reps:+!!e.getElementById(`tracks_reps`).checked,tracks_weight:+!!this.weightInput.checked,tracks_duration:+!!e.getElementById(`tracks_duration`).checked};this._onSubmit?.(a)}showError(e){let t=this.shadowRoot.getElementById(`error`);t.textContent=e,t.hidden=!1}};customElements.get(`exercise-create-form`)||customElements.define(`exercise-create-form`,o);
//# sourceMappingURL=exercise-create-form.component-myw9U-5b.js.map