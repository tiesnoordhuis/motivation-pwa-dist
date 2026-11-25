import{t as e}from"./section-page.utils-CC8BnMla.js";import{t}from"./session.service-rHji0_gD.js";import{t as n}from"./component-logger-vUiJPJw3.js";var r=document.createElement(`template`);r.innerHTML=`
    <form class="session-settings" data-testid="form">
        <p>Paste the token <code>npm run session:create</code> printed. The server keeps it as a cookie this app
        cannot read; it is not stored or synced here.</p>
        <label>
            Session token
            <input type="password" name="token" autocomplete="off" required data-testid="token">
        </label>
        <button type="submit" data-testid="submit">Sign in</button>
        <p data-testid="result" hidden></p>
        <pre class="screen-error" data-testid="error" hidden></pre>
    </form>
`;var i=class extends HTMLElement{initialized=!1;log=n(`session-settings-screen`);service=t;setLoading(){}setError(e){this.showError(e)}clearStatus(){this.el(`error`).hidden=!0}setService(e){this.service=e}connectedCallback(){this.initialized||(this.initialized=!0,e(this,`Session`,`extra`,`/extra`).content.appendChild(r.content.cloneNode(!0)),this.el(`form`).addEventListener(`submit`,e=>{e.preventDefault(),this.signIn()}))}async signIn(){let e=this.el(`token`),t=this.el(`submit`),n=this.el(`result`);this.clearStatus(),n.hidden=!0,t.disabled=!0;try{let t=await this.service.signIn(e.value);e.value=``,n.textContent=`Signed in as "${t.label}" until ${t.expires_at}.`,n.hidden=!1}catch(e){this.log.error(`sign-in failed:`,e),this.showError(e)}finally{t.disabled=!1}}showError(e){let t=this.el(`error`);t.hidden=!1,t.textContent=e instanceof Error?`${e.message}\n${e.stack??``}`:String(e)}el(e){let t=this.querySelector(`[data-testid="${e}"]`);if(!t)throw Error(`session-settings: missing [data-testid="${e}"]`);return t}};customElements.get(`session-settings-screen`)||customElements.define(`session-settings-screen`,i);export{i as SessionSettingsScreen};
//# sourceMappingURL=session-settings-screen.component-Dryra3PB.js.map