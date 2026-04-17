const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

async function sugerirConIA(req) {
    const { subject, body } = req.data

    console.log('Nueva incidencia recibida:', subject)
    console.log('Llamando a Claude API...')

    const prompt = `Eres un clasificador experto de tickets de soporte técnico.
        Clasifica el siguiente ticket y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional.

        Ejemplos:
        Ticket: {"subject": "Servidor caído en producción", "body": "El servicio de AWS no responde desde las 14:00."}
        Respuesta: {"priority": "high", "type": "Incident", "queue": "Technical Support", "confidence": 0.95}

        Ticket: {"subject": "Consulta precio Dell XPS", "body": "Me gustaría saber si el Dell XPS 13 está disponible."}
        Respuesta: {"priority": "low", "type": "Request", "queue": "Sales and Pre-Sales", "confidence": 0.92}

        Ticket: {"subject": "Error en autocompletado IntelliJ", "body": "El IDE se cuelga con el autocompletado desde 2024.1."}
        Respuesta: {"priority": "high", "type": "Incident", "queue": "Technical Support", "confidence": 0.90}

        Valores permitidos:
        - priority: high, medium, low
        - type: Incident, Request, Change, Problem
        - queue: Technical Support, Customer Service, IT Support, Product Support, Billing and Payments, Service Outages and Maintenance, General Inquiry, Returns and Exchanges, Sales and Pre-Sales, Human Resources

        Ticket a clasificar:
        {"subject": "${subject}", "body": "${body}"}
        Respuesta:`

    const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
    })

    const texto = message.content[0].text.trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

    const respuesta = JSON.parse(texto)

    console.log('Sugerencia Claude:', respuesta)

    req.data.priority      = respuesta.priority
    req.data.type          = respuesta.type
    req.data.queue         = respuesta.queue
    req.data.ai_suggested  = true
    req.data.ai_confidence = respuesta.confidence
}

module.exports = { sugerirConIA }