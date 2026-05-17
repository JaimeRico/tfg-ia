const cds = require('@sap/cds');
const incidenciasHandler = require('./handler/incidencias-service');

module.exports = class IncidenciasService extends cds.ApplicationService {
    async init() {

        this.before('CREATE', 'Incidencias', async (req) => {
            /*if (
                !req.user.is('Empleado') &&
                !req.user.is('RRHH') &&
                !req.user.is('Admin')
            ) {
                return req.reject(403, 'No autorizado para crear incidencias');
            }*/

            return incidenciasHandler.sugerirConIA(req);
        });

        this.before('READ', 'Incidencias', async (req) => {
           /* if (
                !req.user.is('RRHH') &&
                !req.user.is('ITSupport') &&
                !req.user.is('Admin')
            ) {
                return req.reject(403, 'No autorizado para ver incidencias');
            }*/
        });

        this.on('responderYCerrar', 'Incidencias', async (req) => {
            /*if (
                !req.user.is('RRHH') &&
                !req.user.is('Admin')
            ) {
                return req.reject(403, 'No autorizado para responder y cerrar incidencias');
            }*/

            const id = req.params[0].ID;
            const { respuesta } = req.data;

            if (!respuesta || !respuesta.trim()) {
                return req.error(400, 'Debe introducir una respuesta antes de cerrar la incidencia');
            }

            const incidencia = await SELECT.one
                .from('IncidenciasService.Incidencias')
                .where({ ID: id });

            if (!incidencia) {
                return req.error(404, 'Incidencia no encontrada');
            }

            await UPDATE('IncidenciasService.Incidencias')
                .set({
                    hr_response: respuesta.trim(),
                    status: 'cerrado',
                    resolved_at: new Date().toISOString(),
                    resolved_by: req.user?.id || 'rrhh'
                })
                .where({ ID: id });

            return SELECT.one
                .from('IncidenciasService.Incidencias')
                .where({ ID: id });
        });
   

        await super.init();
    }
};