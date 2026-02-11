import { AgendaService } from '../services/agenda.service.js';
export class AgendaRenderer {
    container;
    agendaList;
    constructor() {
        this.container = document.getElementById('agenda-view');
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
            loader.classList.remove('hidden');
    }
    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader)
            loader.classList.add('hidden');
    }
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
    }
}
