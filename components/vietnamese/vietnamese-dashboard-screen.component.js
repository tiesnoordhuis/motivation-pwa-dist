import { buildSectionPage } from '../../utils/section-page.utils.js';
import './vietnamese-dashboard/vietnamese-dashboard.component.js';
export class VietnameseDashboardScreen extends HTMLElement {
    initialized = false;
    connectedCallback() {
        if (this.initialized)
            return;
        this.initialized = true;
        const page = buildSectionPage(this, 'Learn', 'vietnamese', '#/vietnamese');
        const dashboard = document.createElement('vietnamese-dashboard');
        page.content.appendChild(dashboard);
    }
}
customElements.define('vietnamese-dashboard-screen', VietnameseDashboardScreen);
