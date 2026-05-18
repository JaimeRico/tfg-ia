const cds = require('@sap/cds')
const incidenciasHandler = require('./handler/incidencias-service')

module.exports = class IncidenciasService extends cds.ApplicationService {
    async init() {
        this.before('CREATE', 'Incidencias', incidenciasHandler.sugerirConIA)
        await super.init()
    }
    
}