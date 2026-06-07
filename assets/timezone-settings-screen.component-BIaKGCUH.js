import{t as e}from"./app-timezone.service-DZQ0iFQK.js";import{t}from"./component-logger-vUiJPJw3.js";import{t as n}from"./section-page.utils-C-zZVD0e.js";var r=document.createElement(`template`);r.innerHTML=`
    <section class="timezone-settings">
        <p class="timezone-settings__effective">
            Effective timezone: <strong data-testid="effective-zone"></strong>
        </p>
        <fieldset class="timezone-settings__mode">
            <legend>How should the app pick the timezone?</legend>
            <label>
                <input type="radio" name="tz-mode" value="device" data-testid="mode-device">
                <span>Follow this device (<span data-testid="device-zone"></span>)</span>
            </label>
            <label>
                <input type="radio" name="tz-mode" value="fixed" data-testid="mode-fixed">
                <span>Pin a fixed timezone</span>
            </label>
        </fieldset>
        <div class="timezone-settings__pin" data-testid="pin-row" hidden>
            <input list="tz-list" type="text" data-testid="zone-input" placeholder="e.g. Europe/Amsterdam">
            <datalist id="tz-list"></datalist>
        </div>
        <div class="timezone-settings__actions">
            <button type="button" data-testid="save">Save</button>
            <span class="timezone-settings__saved" data-testid="saved" hidden>Saved ✓</span>
        </div>
        <p class="timezone-settings__error" data-testid="error" hidden></p>
    </section>
`;var i=class extends HTMLElement{setLoading(){}setError(e){this.showError(e)}clearStatus(){this.clearError()}initialized=!1;log=t(`timezone-settings-screen`);service=e;setService(e){this.service=e,this.initialized&&this.refresh()}connectedCallback(){if(this.initialized)return;this.initialized=!0;let e=n(this,`Timezone`,`extra`,`/settings/timezone`);e.content.classList.add(`timezone-settings-host`),e.content.appendChild(r.content.cloneNode(!0)),this.populateZoneList();let t=this.queryEl(`mode-device`),i=this.queryEl(`mode-fixed`);t.addEventListener(`change`,()=>this.syncPinRowVisibility()),i.addEventListener(`change`,()=>this.syncPinRowVisibility()),this.queryEl(`save`).addEventListener(`click`,()=>void this.handleSave()),this.refresh()}populateZoneList(){let e=this.queryEl(`tz-list`,`id`),t=typeof Intl.supportedValuesOf==`function`?Intl.supportedValuesOf(`timeZone`):[`Europe/Amsterdam`];for(let n of t){let t=document.createElement(`option`);t.value=n,e.appendChild(t)}}async refresh(){try{let e=await this.service.getMode(),t=this.service.getTimeZone();this.queryEl(`effective-zone`).textContent=t,this.queryEl(`device-zone`).textContent=Temporal.Now.timeZoneId(),this.queryEl(`mode-device`).checked=e===`device`,this.queryEl(`mode-fixed`).checked=e===`fixed`,e===`fixed`&&(this.queryEl(`zone-input`).value=t),this.syncPinRowVisibility()}catch(e){this.log.error(`refresh failed:`,e),this.showError(e)}}syncPinRowVisibility(){let e=this.queryEl(`mode-fixed`).checked;this.queryEl(`pin-row`).hidden=!e}async handleSave(){this.clearError();try{if(this.queryEl(`mode-fixed`).checked){let e=this.queryEl(`zone-input`).value.trim();await this.service.pinZone(e)}else await this.service.followDevice();await this.refresh(),this.flashSaved()}catch(e){this.log.error(`save failed:`,e),this.showError(e)}}flashSaved(){let e=this.queryEl(`saved`);e.hidden=!1}queryEl(e,t=`testid`){let n=t===`id`?`#${e}`:`[data-testid="${e}"]`,r=this.querySelector(n);if(!r)throw Error(`timezone-settings: missing ${n}`);return r}showError(e){let t=this.querySelector(`[data-testid="error"]`);if(!t)throw e;t.hidden=!1,t.textContent=e instanceof Error?`${e.message}\n${e.stack??``}`:String(e)}clearError(){let e=this.querySelector(`[data-testid="error"]`);e&&(e.hidden=!0,e.textContent=``)}};customElements.get(`timezone-settings-screen`)||customElements.define(`timezone-settings-screen`,i);export{i as TimezoneSettingsScreen};
//# sourceMappingURL=timezone-settings-screen.component-BIaKGCUH.js.map