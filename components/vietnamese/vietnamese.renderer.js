import { buildSectionPage } from '../../utils/section-page.utils.js';
export class VietnameseRenderer {
    content;
    dashboard;
    constructor() {
        const container = document.getElementById('vietnamese-view');
        const page = buildSectionPage(container, 'Learn', 'vietnamese', '#/vietnamese');
        this.content = page.content;
        this.dashboard = document.createElement('vietnamese-dashboard');
        this.content.appendChild(this.dashboard);
    }
    showDashboard() {
        this.cleanUpSubViews();
        this.dashboard.hidden = false;
    }
    showReviewSession() {
        this.dashboard.hidden = true;
        this.cleanUpSubViews();
        const reviewSession = document.createElement('review-session');
        this.content.appendChild(reviewSession);
    }
    cleanup() {
        this.cleanUpSubViews();
        this.dashboard.hidden = false;
    }
    cleanUpSubViews() {
        this.content.querySelectorAll('review-session').forEach((element) => element.remove());
    }
}
