const template = document.createElement('template');
template.innerHTML = `
    <server-status-pill></server-status-pill>
    <a href="#/extra" class="extra-link">Extra</a>
`;
export class HomeFooter extends HTMLElement {
    connectedCallback() {
        if (!this.firstChild) {
            this.appendChild(template.content.cloneNode(true));
        }
    }
}
customElements.define('home-footer', HomeFooter);
