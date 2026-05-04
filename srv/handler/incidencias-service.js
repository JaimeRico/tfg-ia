const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

async function sugerirConIA(req) {
    const { subject, body } = req.data

    console.log('Nueva incidencia recibida:', subject)
    console.log('Llamando a Claude API...')

        const prompt = `Eres un asistente experto en gestión de incidencias empresariales.
    Analiza el siguiente ticket y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.

    Tu objetivo es:
    1. Determinar la prioridad de la incidencia.
    2. Determinar el tipo de incidencia.
    3. Determinar el departamento responsable.
    4. Clasificar si la incidencia es funcional o técnica.
    5. Explicar brevemente el motivo de la clasificación.
    6. Proponer una recomendación inicial.
    7. Indicar si necesita revisión humana.

    Ejemplos:

    Ticket: {"subject": "Servidor caído en producción", "body": "El servicio de AWS no responde desde las 14:00 y afecta a todos los usuarios."}
    Respuesta: {
    "priority": "high",
    "type": "Incident",
    "department": "IT Support",
    "category": "Technical",
    "reason": "El ticket describe una caída del sistema en producción con impacto generalizado.",
    "recommendation": "Escalar inmediatamente al equipo de IT para revisar la disponibilidad del servicio y restaurar el acceso.",
    "needs_review": false
    }

    Ticket: {"subject": "No he recibido mi nómina de marzo", "body": "Quiero saber por qué no se ha abonado mi nómina este mes."}
    Respuesta: {
    "priority": "medium",
    "type": "Request",
    "department": "Payroll",
    "category": "Functional",
    "reason": "La incidencia está relacionada con un proceso de negocio de nóminas, no con un fallo técnico.",
    "recommendation": "Revisar el estado del pago de la nómina y validar si existe incidencia administrativa o de procesamiento.",
    "needs_review": false
    }

    Ticket: {"subject": "No puedo acceder al portal de RRHH", "body": "Al intentar entrar me aparece un error de permisos y no puedo ver mis datos."}
    Respuesta: {
    "priority": "high",
    "type": "Incident",
    "queue": "IT Support",
    "department": "IT Support",
    "category": "Technical",
    "reason": "El problema parece relacionado con permisos, acceso o configuración técnica del sistema.",
    "recommendation": "No puedo proponer una solución funcional. Contacte con IT para revisar roles, permisos o errores de autenticación.",
    "needs_review": false
    }

    Valores permitidos:
    - priority: high, medium, low
    - type: Incident, Request, Change, Problem
    - department: Payroll, Human Resources, IT Support, Finance, Sales, Customer Care, General Administration
    - category: Functional, Technical
    - needs_review: true, false

    Reglas:
    - Usa "Functional" cuando el problema pertenezca al proceso de negocio y pueda interpretarse funcionalmente.
    - Usa "Technical" cuando se trate de accesos, roles, errores del sistema, caídas, permisos o problemas de infraestructura.
    - Si el caso es ambiguo o falta contexto, marca "needs_review": true.
    - "reason" debe ser breve y clara.
    - "recommendation" debe ser una recomendación inicial útil para un gestor humano.
    - Responde solo con JSON válido.

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

    req.data.priority          = respuesta.priority
    req.data.type              = respuesta.type
    req.data.queue             = respuesta.queue
    req.data.department        = respuesta.department
    req.data.category          = respuesta.category
    req.data.ai_reason         = respuesta.reason
    req.data.ai_recommendation = respuesta.recommendation
    req.data.needs_review      = respuesta.needs_review
    req.data.ai_suggested      = true
}

module.exports = { sugerirConIA }