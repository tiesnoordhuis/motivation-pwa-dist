import { AgendaRenderer } from './agenda.renderer.js';
let instance = null;
export function agendaRoutes() {
    return {
        '#/agenda': {
            view: '#agenda-view',
            init: async () => {
                instance = new AgendaRenderer();
                await instance.init();
            },
            onEnter: async () => { await instance?.init(); },
        },
    };
}
