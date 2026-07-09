import{n as e}from"./router-GiPH-W_5.js";import{t}from"./section-page.utils-C-zZVD0e.js";import{t as n}from"./css-Dp6z7v3R.js";import{n as r,t as i}from"./screen-status-Bh8yMGWy.js";import{t as a}from"./vietnamese.service-COs_qEy2.js";var o=`:host{--viet-color:var(--color-vietnamese,#c0392b);--viet-color-light:#c0392b1f;display:block}[hidden],:host([hidden]){display:none!important}.dashboard{flex-direction:column;gap:1.5rem;max-width:760px;margin:0 auto;padding:1.25rem 1rem 2rem;display:flex}h2{align-items:center;gap:.5rem;margin:0;font-size:1rem;font-weight:700;display:flex}.accent-bar{background:var(--viet-color);border-radius:2px;flex-shrink:0;width:4px;height:1em;display:inline-block}.how-it-works,.decks-section,.cards-section{background:var(--card-bg,#eaeaea);border-radius:12px;padding:1rem 1.25rem}.how-it-works p{color:var(--text-color,#333);margin:.8rem 0 .75rem;font-size:.9rem;line-height:1.6}.review-steps{color:var(--text-color,#333);flex-direction:column;gap:.4rem;margin:0;padding-left:1.25rem;font-size:.875rem;line-height:1.55;display:flex}.rating-pills{vertical-align:middle;flex-wrap:wrap;gap:.3rem;margin-left:.25rem;display:inline-flex}.pill{border-radius:4px;padding:.15rem .5rem;font-size:.78rem;font-weight:600;display:inline-block}.pill.again{color:#922b21;background:#f5b7b1}.pill.hard{color:#784212;background:#fad7a0}.pill.good{color:#1e8449;background:#a9dfbf}.pill.easy{color:#1a5276;background:#a9cce3}.section-row{justify-content:space-between;align-items:center;gap:1rem;margin-bottom:.8rem;display:flex}.decks-list,.cards-list{flex-direction:column;gap:.75rem;display:flex}.deck-row,.card-row{background:#ffffff59;border:1px solid #00000014;border-radius:10px;overflow:hidden}.item-actions{flex-wrap:wrap;align-items:center;gap:.5rem;padding:.6rem .8rem .8rem;display:flex}.card-content{padding:.8rem .9rem .3rem}.card-front,.card-back,.card-notes{color:var(--text-color,#1a1a1a);margin:0}.card-front{font-size:.9rem;font-weight:700}.card-back{margin-top:.3rem;font-size:.9rem}.card-notes{opacity:.75;margin-top:.35rem;font-size:.82rem}.cards-toolbar{margin-bottom:.6rem}.status-msg{color:var(--text-color,#333);opacity:.6;margin:0;font-size:.875rem}.status-msg.error{color:var(--viet-color);opacity:1}.btn-secondary,.btn-text,.dialog-actions button,.btn-start{cursor:pointer;border:none;border-radius:7px;font-size:.84rem}.btn-secondary{background:var(--viet-color-light);color:var(--viet-color);padding:.45rem .7rem;font-weight:700}.btn-text{color:var(--text-color,#333);background:0 0;padding:.35rem .5rem;font-weight:600}.btn-text.danger{color:#922b21}.actions{justify-content:center;display:flex}.btn-start{background:var(--viet-color);color:#fff;padding:.75rem 2.25rem;font-size:1rem;font-weight:700;transition:opacity .15s,transform .1s}.btn-start:hover{opacity:.85}.btn-start:active{opacity:.7;transform:scale(.98)}.form-dialog{border:none;border-radius:12px;width:min(480px,100vw - 2rem);padding:0}.form-dialog::backdrop{background:#00000059}.form-dialog form{flex-direction:column;gap:.45rem;padding:1rem;display:flex}.form-dialog h3{color:var(--text-color,#1a1a1a);margin:0 0 .2rem}.form-dialog label{color:var(--text-color,#222);font-size:.85rem;font-weight:700}.form-dialog input,.form-dialog textarea{font:inherit;color:var(--text-color,#1a1a1a);background:var(--bg-color,#fff);border:1px solid #0003;border-radius:8px;padding:.55rem .6rem}.form-dialog input::placeholder,.form-dialog textarea::placeholder{color:var(--text-color,#1a1a1a);opacity:.65}.inline-error{color:#922b21;margin:0;font-size:.8rem}.dialog-actions{justify-content:flex-end;gap:.5rem;margin-top:.4rem;display:flex}.dialog-actions button{color:#2c3e50;background:#ecf0f1;padding:.5rem .8rem;font-weight:700}.dialog-actions .btn-primary{background:var(--viet-color);color:#fff}.dialog-actions .btn-danger{color:#fff;background:#c0392b}@media (width<=640px){.dashboard{gap:1rem;padding:1rem .75rem 1.5rem}.how-it-works,.decks-section,.cards-section{padding:.85rem .9rem}.section-row{flex-direction:column;align-items:flex-start}.item-actions{width:100%}}`,s=n(`:host{display:block}[hidden],:host([hidden]){display:none!important}.deck-card{background:var(--card-bg,#eaeaea);border-left:4px solid #0000;border-radius:10px;justify-content:space-between;align-items:center;gap:1rem;padding:.85rem 1rem;display:flex}.deck-card.state-due{border-left-color:var(--color-vietnamese,#c0392b)}.deck-card.state-new{border-left-color:#2471a3}.deck-name{color:var(--text-color,#000);margin:0;font-size:.95rem;font-weight:700}.deck-description{color:var(--text-color,#333);opacity:.6;margin:.2rem 0 0;font-size:.8rem}.deck-meta{flex-direction:column;flex-shrink:0;align-items:flex-end;gap:.25rem;display:flex}.deck-total{color:var(--text-color,#333);opacity:.5;font-size:.8rem}.deck-status{border-radius:4px;padding:.15rem .5rem;font-size:.78rem;font-weight:600}.deck-status.has-due{color:var(--color-vietnamese,#c0392b);background:#c0392b1f}.deck-status.has-new{color:#1a5276;background:#2471a31f}.deck-status.up-to-date{color:#1e8449;background:#27ae601f}`),c=document.createElement(`template`);c.innerHTML=`
    <div class="deck-card">
        <div class="deck-info">
            <h3 class="deck-name" id="deck-name"></h3>
            <p class="deck-description" id="deck-description" hidden></p>
        </div>
        <div class="deck-meta">
            <span class="deck-total" id="deck-total"></span>
            <span class="deck-status" id="deck-status"></span>
        </div>
    </div>
`;var l=class extends HTMLElement{_deck;deckCardEl;nameEl;descriptionEl;totalEl;statusEl;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[s],e.appendChild(c.content.cloneNode(!0)),this.deckCardEl=e.querySelector(`.deck-card`),this.nameEl=e.getElementById(`deck-name`),this.descriptionEl=e.getElementById(`deck-description`),this.totalEl=e.getElementById(`deck-total`),this.statusEl=e.getElementById(`deck-status`)}connectedCallback(){this._deck&&this.render()}set deck(e){this._deck=e,this.isConnected&&this.render()}get deck(){return this._deck}render(){if(!this._deck)return;let e=this._deck,t,n,r;e.due_cards>0?(t=`has-due`,n=`${e.due_cards} due`,r=`state-due`):e.new_cards>0?(t=`has-new`,n=`${e.new_cards} new`,r=`state-new`):(t=`up-to-date`,n=`all caught up`,r=``),this.dataset.state=r,this.deckCardEl.className=`deck-card ${r}`.trim(),this.nameEl.textContent=e.name,this.totalEl.textContent=`${e.total_cards} card${e.total_cards===1?``:`s`}`,e.description?(this.descriptionEl.hidden=!1,this.descriptionEl.textContent=e.description):(this.descriptionEl.hidden=!0,this.descriptionEl.textContent=``),this.statusEl.className=`deck-status ${t}`,this.statusEl.textContent=n}};customElements.define(`deck-card`,l);var u=n(o),d=document.createElement(`template`);d.innerHTML=`
    <div class="dashboard">
        <section class="how-it-works">
            <h2><span class="accent-bar"></span>How it works</h2>
            <p>
                This system uses <strong>FSRS</strong> — an algorithm that shows each card at the
                optimal moment, just before you'd forget it. Cards you find difficult come back
                sooner; ones you know well are spaced further apart over time.
            </p>
            <ol class="review-steps">
                <li>A card is shown — try to recall the answer before looking</li>
                <li>Click the card to reveal the answer</li>
                <li>
                    Rate your recall:
                    <span class="rating-pills">
                        <span class="pill again">Again</span>
                        <span class="pill hard">Hard</span>
                        <span class="pill good">Good</span>
                        <span class="pill easy">Easy</span>
                    </span>
                </li>
                <li>The algorithm schedules the next review automatically</li>
            </ol>
        </section>

        <section class="decks-section">
            <div class="section-row">
                <h2><span class="accent-bar"></span>Decks</h2>
                <button id="create-deck-btn" class="btn-secondary" type="button">New deck</button>
            </div>
            <div id="decks-list" class="decks-list">
                <p class="status-msg">Loading…</p>
            </div>
        </section>

        <section id="cards-section" class="cards-section" hidden>
            <div class="section-row">
                <h2><span class="accent-bar"></span><span id="cards-title-text">Cards</span></h2>
                <button id="create-card-btn" class="btn-secondary" type="button">New card</button>
            </div>
            <div class="cards-toolbar">
                <button id="close-cards-btn" class="btn-text" type="button">Back to deck list</button>
            </div>
            <div id="cards-list" class="cards-list"></div>
        </section>

        <div class="actions">
            <button id="start-review-btn" class="btn-start">Start Review Session</button>
        </div>
    </div>

    <dialog id="deck-dialog" class="form-dialog">
        <form id="deck-form" method="dialog" novalidate>
            <h3 id="deck-dialog-title">New deck</h3>
            <label for="deck-name">Name</label>
            <input id="deck-name" name="name" type="text" maxlength="120" required>
            <p id="deck-name-error" class="inline-error" hidden></p>

            <label for="deck-description">Description (optional)</label>
            <textarea id="deck-description" name="description" rows="3" maxlength="500"></textarea>

            <div class="dialog-actions">
                <button type="button" data-action="cancel-deck">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>

    <dialog id="card-dialog" class="form-dialog">
        <form id="card-form" method="dialog" novalidate>
            <h3 id="card-dialog-title">New card</h3>
            <label for="card-front">Front</label>
            <input id="card-front" name="front" type="text" maxlength="300" required>
            <p id="card-front-error" class="inline-error" hidden></p>

            <label for="card-back">Back</label>
            <input id="card-back" name="back" type="text" maxlength="300" required>
            <p id="card-back-error" class="inline-error" hidden></p>

            <label for="card-audio">Audio (optional)</label>
            <div class="audio-input-group">
                <input id="card-audio" name="audio" type="file" accept="audio/*">
                <button type="button" id="clear-audio-btn" class="btn-text" hidden>Clear audio</button>
            </div>
            <p id="card-audio-help" class="hint-text"></p>

            <label for="card-notes">Notes (optional)</label>
            <textarea id="card-notes" name="notes" rows="3" maxlength="1000"></textarea>

            <div class="dialog-actions">
                <button type="button" data-action="cancel-card">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>

    <dialog id="confirm-dialog" class="form-dialog">
        <form method="dialog" id="confirm-form">
            <h3>Confirm deletion</h3>
            <p id="confirm-message"></p>
            <div class="dialog-actions">
                <button type="button" data-action="cancel-confirm">Cancel</button>
                <button type="button" data-action="confirm-delete" class="btn-danger">Delete</button>
            </div>
        </form>
    </dialog>
`;function f(e,t=!1){let n=document.createElement(`p`);return n.className=t?`status-msg error`:`status-msg`,n.textContent=e,n}function p(e){let t=e.trim();return t.length>0?t:void 0}var m=class extends HTMLElement{decks=[];cards=[];selectedDeckId=null;editingDeckId=null;editingCardId=null;pendingDelete=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.adoptedStyleSheets=[u],e.appendChild(d.content.cloneNode(!0))}connectedCallback(){let t=this.shadowRoot;t.getElementById(`start-review-btn`).addEventListener(`click`,()=>e(`/vietnamese/review`)),t.getElementById(`create-deck-btn`).addEventListener(`click`,()=>this.openDeckDialog()),t.getElementById(`create-card-btn`).addEventListener(`click`,()=>this.openCardDialog()),t.getElementById(`close-cards-btn`).addEventListener(`click`,()=>this.closeCardsView());let n=t.getElementById(`deck-form`),r=t.getElementById(`card-form`);n.addEventListener(`submit`,e=>{e.preventDefault(),this.saveDeck()}),r.addEventListener(`submit`,e=>{e.preventDefault(),this.saveCard()});let i=t.getElementById(`clear-audio-btn`),a=t.getElementById(`card-audio-help`);i.addEventListener(`click`,()=>{let e=t.getElementById(`card-audio`);e.value=``,this.editingCardId&&this.cards.find(e=>e.id===this.editingCardId)?.audio?(e.dataset.action=`delete`,a.textContent=`Audio will be removed on save.`):(delete e.dataset.action,a.textContent=``)});let o=t.getElementById(`card-audio`);o.addEventListener(`change`,()=>{let e=this.editingCardId?this.cards.find(e=>e.id===this.editingCardId):void 0;o.files&&o.files.length>0?(i.hidden=!1,a.textContent=`New file selected`,delete o.dataset.action):e?.audio?a.textContent=`Current: `+e.audio:(i.hidden=!0,a.textContent=``)}),t.addEventListener(`click`,e=>{let n=e.target.closest(`button[data-action]`);if(!n)return;let r=n.dataset.action;if(r)switch(r){case`edit-deck`:{let e=n.dataset.deckId;if(!e)return;let t=this.decks.find(t=>t.id===e);if(!t)return;this.openDeckDialog(t);return}case`delete-deck`:{let e=n.dataset.deckId,t=n.dataset.deckName;if(!e||!t)return;this.openDeleteDialog({kind:`deck`,id:e,label:t});return}case`open-cards`:{let e=n.dataset.deckId;if(!e)return;this.openCardsView(e);return}case`edit-card`:{let e=n.dataset.cardId;if(!e)return;let t=this.cards.find(t=>t.id===e);if(!t)return;this.openCardDialog(t);return}case`delete-card`:{let e=n.dataset.cardId,t=n.dataset.cardFront;if(!e||!t)return;this.openDeleteDialog({kind:`card`,id:e,label:t});return}case`cancel-deck`:t.getElementById(`deck-dialog`).close();return;case`cancel-card`:t.getElementById(`card-dialog`).close();return;case`cancel-confirm`:t.getElementById(`confirm-dialog`).close(),this.pendingDelete=null;return;case`confirm-delete`:this.confirmDelete();return;default:return}}),this.loadDecks()}async loadDecks(){let e=this.shadowRoot.getElementById(`decks-list`);e.replaceChildren(f(`Loading…`));try{let t=await a.getDeckStats();if(this.decks=t,t.length===0){e.replaceChildren(f(`No decks yet.`)),this.closeCardsView();return}let n=t.map(e=>this.createDeckRow(e));e.replaceChildren(...n),this.refreshCardsSectionTitle()}catch{e.replaceChildren(f(`Could not load decks.`,!0))}}createDeckRow(e){let t=document.createElement(`article`);t.className=`deck-row`;let n=document.createElement(`deck-card`);n.deck=e;let r=document.createElement(`div`);r.className=`item-actions`;let i=document.createElement(`button`);i.type=`button`,i.className=`btn-text`,i.dataset.action=`open-cards`,i.dataset.deckId=e.id,i.textContent=`Manage cards`;let a=document.createElement(`button`);a.type=`button`,a.className=`btn-text`,a.dataset.action=`edit-deck`,a.dataset.deckId=e.id,a.textContent=`Edit`;let o=document.createElement(`button`);return o.type=`button`,o.className=`btn-text danger`,o.dataset.action=`delete-deck`,o.dataset.deckId=e.id,o.dataset.deckName=e.name,o.textContent=`Delete`,r.append(i,a,o),t.append(n,r),t}async openCardsView(e){this.selectedDeckId=e;let t=this.shadowRoot.getElementById(`cards-section`);t.hidden=!1,this.refreshCardsSectionTitle(),await this.loadCards()}closeCardsView(){this.selectedDeckId=null;let e=this.shadowRoot.getElementById(`cards-section`);e.hidden=!0,this.shadowRoot.getElementById(`cards-list`).replaceChildren()}refreshCardsSectionTitle(){let e=this.shadowRoot.getElementById(`cards-title-text`);if(!this.selectedDeckId){e.textContent=`Cards`;return}let t=this.decks.find(e=>e.id===this.selectedDeckId);if(!t){e.textContent=`Cards`;return}e.textContent=`Cards — ${t.name}`}async loadCards(){let e=this.shadowRoot.getElementById(`cards-list`);if(!this.selectedDeckId){e.replaceChildren();return}e.replaceChildren(f(`Loading cards…`));try{let t=await a.getCardsByDeck(this.selectedDeckId);if(this.cards=t,t.length===0){e.replaceChildren(f(`No cards in this deck yet.`));return}e.replaceChildren(...t.map(e=>this.createCardRow(e)))}catch{e.replaceChildren(f(`Could not load cards.`,!0))}}createCardRow(e){let t=document.createElement(`article`);t.className=`card-row`;let n=document.createElement(`div`);n.className=`card-content`;let r=document.createElement(`p`);r.className=`card-front`,r.textContent=e.front;let i=document.createElement(`p`);i.className=`card-back`,i.textContent=e.back;let a=document.createElement(`p`);a.className=`card-notes`,a.hidden=!e.notes,a.textContent=e.notes??``,n.append(r,i,a);let o=document.createElement(`div`);o.className=`item-actions`;let s=document.createElement(`button`);s.type=`button`,s.className=`btn-text`,s.dataset.action=`edit-card`,s.dataset.cardId=e.id,s.textContent=`Edit`;let c=document.createElement(`button`);return c.type=`button`,c.className=`btn-text danger`,c.dataset.action=`delete-card`,c.dataset.cardId=e.id,c.dataset.cardFront=e.front,c.textContent=`Delete`,o.append(s,c),t.append(n,o),t}openDeckDialog(e){let t=this.shadowRoot;this.clearDeckErrors();let n=t.getElementById(`deck-dialog`),r=t.getElementById(`deck-dialog-title`),i=t.getElementById(`deck-name`),a=t.getElementById(`deck-description`);this.editingDeckId=e?.id??null,r.textContent=e?`Edit deck`:`New deck`,i.value=e?.name??``,a.value=e?.description??``,n.showModal()}openCardDialog(e){if(!this.selectedDeckId)return;let t=this.shadowRoot;this.clearCardErrors();let n=t.getElementById(`card-dialog`),r=t.getElementById(`card-dialog-title`),i=t.getElementById(`card-front`),a=t.getElementById(`card-back`),o=t.getElementById(`card-audio`),s=t.getElementById(`card-audio-help`),c=t.getElementById(`clear-audio-btn`),l=t.getElementById(`card-notes`);this.editingCardId=e?.id??null,r.textContent=e?`Edit card`:`New card`,i.value=e?.front??``,a.value=e?.back??``,l.value=e?.notes??``,o.value=``,delete o.dataset.action,e?.audio?(s.textContent=`Current: `+e.audio,c.hidden=!1):(s.textContent=``,c.hidden=!0),n.showModal()}clearDeckErrors(){let e=this.shadowRoot.getElementById(`deck-name-error`);e.hidden=!0,e.textContent=``}clearCardErrors(){let e=this.shadowRoot.getElementById(`card-front-error`),t=this.shadowRoot.getElementById(`card-back-error`);e.hidden=!0,t.hidden=!0,e.textContent=``,t.textContent=``}async saveDeck(){let e=this.shadowRoot,t=e.getElementById(`deck-dialog`),n=e.getElementById(`deck-name`),r=e.getElementById(`deck-description`),i=e.getElementById(`deck-name-error`);this.clearDeckErrors();let o=n.value.trim();if(!o){i.textContent=`Name is required.`,i.hidden=!1;return}let s={name:o,description:p(r.value)};try{this.editingDeckId?await a.updateDeck(this.editingDeckId,s):await a.createDeck(s),t.close(),await this.loadDecks(),this.selectedDeckId&&await this.loadCards()}catch(e){i.textContent=e instanceof Error?e.message:`Failed to save deck.`,i.hidden=!1}}async saveCard(){if(!this.selectedDeckId)return;let e=this.shadowRoot,t=e.getElementById(`card-dialog`),n=e.getElementById(`card-front`),r=e.getElementById(`card-back`),i=e.getElementById(`card-audio`),o=e.getElementById(`card-notes`),s=e.getElementById(`card-front-error`),c=e.getElementById(`card-back-error`);this.clearCardErrors();let l=n.value.trim(),u=r.value.trim(),d=!1;if(l||(s.textContent=`Front is required.`,s.hidden=!1,d=!0),u||(c.textContent=`Back is required.`,c.hidden=!1,d=!0),d)return;let f=i.files&&i.files.length>0?i.files[0]:null,m=i.dataset.action===`delete`,h={front:l,back:u,notes:p(o.value)};try{let e;e=this.editingCardId?(await a.updateCard(this.editingCardId,h)).id:(await a.createCard(this.selectedDeckId,h)).id,f?await a.uploadCardAudio(e,f):m&&await a.deleteCardAudio(e),t.close(),await this.loadCards(),await this.loadDecks()}catch(e){s.textContent=e instanceof Error?e.message:`Failed to save card.`,s.hidden=!1}}openDeleteDialog(e){this.pendingDelete=e;let t=this.shadowRoot.getElementById(`confirm-dialog`),n=this.shadowRoot.getElementById(`confirm-message`);e.kind===`deck`?n.textContent=`Delete deck "${e.label}" and all its cards/reviews?`:n.textContent=`Delete card "${e.label}"?`,t.showModal()}async confirmDelete(){if(!this.pendingDelete)return;let e=this.pendingDelete,t=this.shadowRoot.getElementById(`confirm-dialog`);try{e.kind===`deck`?(await a.deleteDeck(e.id),this.selectedDeckId===e.id&&this.closeCardsView()):(await a.deleteCard(e.id),await this.loadCards()),await this.loadDecks(),this.selectedDeckId&&await this.loadCards(),t.close()}finally{this.pendingDelete=null}}};customElements.define(`vietnamese-dashboard`,m);var h=class extends HTMLElement{initialized=!1;statusNodes=r();statusMixin=i(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode);setLoading(){this.statusMixin.setLoading()}setError(e){this.statusMixin.setError(e)}clearStatus(){this.statusMixin.clearStatus()}connectedCallback(){if(this.initialized)return;this.initialized=!0;let e=t(this,`Learn`,`vietnamese`,`/vietnamese`),n=document.createElement(`vietnamese-dashboard`);e.content.append(this.statusNodes.loadingNode,this.statusNodes.errorNode,this.statusNodes.retryNode,n)}};customElements.define(`vietnamese-dashboard-screen`,h);export{h as VietnameseDashboardScreen};
//# sourceMappingURL=vietnamese-dashboard-screen.component-B_6hGpke.js.map