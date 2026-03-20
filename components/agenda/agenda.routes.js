import { AgendaRenderer } from './agenda.renderer.js';
function createAgendaContainer() {
    const container = document.createElement('div');
    container.className = 'view-section';
    container.id = 'agenda-view';
    return container;
}
export function agendaRoutes() {
    return {
        '#/agenda': {
            render: async () => {
                const container = createAgendaContainer();
                const renderer = new AgendaRenderer(container);
                await renderer.init();
                return container;
            },
        },
    };
}
