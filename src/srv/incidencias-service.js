const cds = require('@sap/cds')

module.exports = class IncidenciasService extends cds.ApplicationService {

    async init() {
        this.before('CREATE', 'Incidencias', async (req) => {
            const { subject, body } = req.data

            // Por ahora simulamos la IA con lógica simple
            // En el siguiente paso esto será una llamada real a la API
            console.log('Nueva incidencia recibida:', subject)
            console.log('Llamando a la IA...')

            const sugerencia = await this.sugerirConIA(subject, body)

            // Rellenamos los campos automáticamente
            req.data.priority     = sugerencia.priority
            req.data.type         = sugerencia.type
            req.data.queue        = sugerencia.queue
            req.data.ai_suggested = true
            req.data.ai_confidence = sugerencia.confidence
        })

        await super.init()
    }

    async sugerirConIA(subject, body) {
        // TODO: aquí irá la llamada real a Claude API
        // De momento devolvemos valores simulados para probar el flujo
        return {
            priority:   'medium',
            type:       'Incident',
            queue:      'Technical Support',
            confidence: 0.85
        }
    }
}