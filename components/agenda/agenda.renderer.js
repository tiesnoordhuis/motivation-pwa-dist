import { AgendaService } from '../../services/agenda.service.js';
export class AgendaRenderer {
    container;
    agendaList;
    constructor(container) {
        this.container = container;
        this.agendaList = document.createElement('agenda-list');
        this.container.appendChild(this.agendaList);
    }
    async init() {
        this.showLoading();
        try {
            const events = await AgendaService.fetchEvents();
            this.renderEvents(events);
        }
        catch (error) {
            console.error('Failed to load agenda', error);
            this.showError('Failed to load agenda.');
        }
        finally {
            this.hideLoading();
        }
    }
    renderEvents(events) {
        this.agendaList.events = events;
    }
    showLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader)
            loader.hidden = false;
    }
    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader)
            loader.hidden = true;
    }
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.hidden = false;
            setTimeout(() => {
                errorElement.hidden = true;
            }, 5000);
        }
    }
}
