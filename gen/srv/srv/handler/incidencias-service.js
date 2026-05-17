const cds = require('@sap/cds')
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

async function findSimilarExamples(subject, body, limit = 3) {
    const { Incidencias } = cds.entities('tfg')

    const existing = await SELECT
        .from(Incidencias)
        .columns('subject', 'body', 'priority', 'type', 'queue', 'department', 'category')
        .where({ ai_suggested: true })
        .limit(50)

    if (!existing.length) return []

    const inputText = `${subject} ${body}`.trim()

    return existing
        .map(row => ({
            row,
            score: similarityScore(inputText, `${row.subject || ''} ${row.body || ''}`)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.row)
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function textToWords(text) {
    return new Set(
        normalizeText(text)
            .split(' ')
            .filter(word => word.length > 2)
    )
}

function similarityScore(inputText, rowText) {
    const inputWords = textToWords(inputText)
    const rowWords = textToWords(rowText)
    let score = 0
    for (const word of inputWords) {
        if (rowWords.has(word)) score++
    }
    return score
}

function buildExamplesText(examples) {
    if (!examples.length) {
        return `
Ejemplos:
Ticket: {"subject": "Servidor caído en producción", "body": "El servicio de AWS no responde desde las 14:00 y afecta a todos los usuarios."}
Respuesta: {
  "priority": "high", "type": "Incident", "queue": "Technical Support",
  "department": "IT Support", "category": "Technical",
  "reason": "Caída del sistema en producción con impacto generalizado.",
  "recommendation": "Escalar inmediatamente al equipo de IT.",
  "needs_review": false
}

Ticket: {"subject": "No he recibido mi nómina de marzo", "body": "Quiero saber por qué no se ha abonado mi nómina este mes."}
Respuesta: {
  "priority": "medium", "type": "Request", "queue": "Human Resources",
  "department": "Payroll", "category": "Functional",
  "reason": "Incidencia relacionada con proceso de nóminas.",
  "recommendation": "Revisar el estado del pago con el departamento de nóminas.",
  "needs_review": false
}`
    }

    return `
Ejemplos:
${examples.map(e => `Ticket: {"subject": "${(e.subject || '').replace(/"/g, '\\"')}", "body": "${(e.body || '').replace(/"/g, '\\"')}"}
Respuesta: {
  "priority": "${e.priority || ''}", "type": "${e.type || ''}",
  "queue": "${e.queue || ''}", "department": "${e.department || ''}",
  "category": "${e.category || ''}", "reason": "", "recommendation": "", "needs_review": false
}`).join('\n\n')}`
}

function containsAny(text, keywords) {
    const normalized = normalizeText(text)
    return keywords.some(keyword => normalized.includes(normalizeText(keyword)))
}

function aplicarReglasDeNegocio(respuesta, subject, body) {
    const fullText = `${subject || ''} ${body || ''}`

    const technicalKeywords = [
        'login', 'acceso', 'permiso', 'permisos', 'rol', 'roles',
        'error', 'caido', 'caída', 'caida', 'produccion', 'producción',
        'portal', 'sistema', 'autenticacion', 'autenticación'
    ]
    const payrollKeywords = ['nomina', 'nómina', 'salario', 'pago', 'cobrado', 'abono']
    const hrKeywords = ['vacaciones', 'ausencia', 'empleado', 'rrhh', 'recursos humanos', 'datos personales']

    const hasTechnical = containsAny(fullText, technicalKeywords)
    const hasPayroll = containsAny(fullText, payrollKeywords)
    const hasHR = containsAny(fullText, hrKeywords)
    const mixedFunctionalTechnical = (hasHR || hasPayroll) && hasTechnical

    if (hasTechnical) {
        respuesta.category = 'Technical'
        respuesta.department = 'IT Support'
        if (!respuesta.queue || respuesta.queue === 'Human Resources') respuesta.queue = 'Technical Support'
        if (respuesta.type !== 'Incident' && respuesta.type !== 'Problem') respuesta.type = 'Incident'
    }
    if (hasPayroll) {
        respuesta.category = 'Functional'
        respuesta.department = 'Payroll'
        if (!respuesta.queue || respuesta.queue === 'Technical Support') respuesta.queue = 'Human Resources'
        if (respuesta.type !== 'Request' && respuesta.type !== 'Incident') respuesta.type = 'Request'
    }
    if (hasHR && !hasPayroll && !hasTechnical) {
        respuesta.category = 'Functional'
        respuesta.department = 'Human Resources'
        if (!respuesta.queue) respuesta.queue = 'Human Resources'
    }

    const inconsistentTechnicalPayroll = respuesta.category === 'Technical' && respuesta.department === 'Payroll'
    const inconsistentFunctionalIT = respuesta.category === 'Functional' && respuesta.department === 'IT Support' && !hasTechnical

    if (inconsistentTechnicalPayroll || inconsistentFunctionalIT || mixedFunctionalTechnical) {
        respuesta.needs_review = true
    }
    if (hasTechnical && !hasHR && !hasPayroll && respuesta.department === 'IT Support' && respuesta.category === 'Technical') {
        respuesta.needs_review = false
    }
    if (hasPayroll && !hasTechnical && respuesta.department === 'Payroll' && respuesta.category === 'Functional') {
        respuesta.needs_review = false
    }
    if (hasHR && !hasTechnical && !hasPayroll && respuesta.department === 'Human Resources' && respuesta.category === 'Functional') {
        respuesta.needs_review = false
    }
    if (typeof respuesta.needs_review !== 'boolean') respuesta.needs_review = true

    return respuesta
}

async function sugerirConIA(req) {
    const { subject, body, language } = req.data

    const similarExamples = await findSimilarExamples(subject, body, 3)
    const examplesText = buildExamplesText(similarExamples)

    console.log('Nueva incidencia recibida:', subject)
    console.log('Ejemplos similares encontrados:', similarExamples.length)
    console.log('Llamando a Claude API...')

    const prompt = `Eres un asistente experto en gestión de incidencias empresariales.
Analiza el siguiente ticket y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.

Tu objetivo es:
1. Determinar la prioridad de la incidencia.
2. Determinar el tipo de incidencia.
3. Determinar la cola o área operativa inicial.
4. Determinar el departamento responsable.
5. Clasificar si la incidencia es funcional o técnica.
6. Explicar brevemente el motivo de la clasificación.
7. Proponer una recomendación inicial.
8. Indicar si necesita revisión humana.

${examplesText}

Valores permitidos:
- priority: high, medium, low
- type: Incident, Request, Change, Problem
- queue: Technical Support, Customer Service, IT Support, Product Support, Billing and Payments, Service Outages and Maintenance, General Inquiry, Returns and Exchanges, Sales and Pre-Sales, Human Resources
- department: Payroll, Human Resources, IT Support, Finance, Sales, Customer Care, General Administration
- category: Functional, Technical
- needs_review: true, false

Reglas:
- Usa "Functional" cuando el problema pertenezca al proceso de negocio.
- Usa "Technical" cuando se trate de accesos, roles, errores del sistema, caídas o permisos.
- Si el caso es ambiguo, marca "needs_review": true.
- Responde solo con JSON válido.

Ticket a clasificar:
{"subject": "${subject}", "body": "${body}"}

Respuesta:`

    const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
    })

    const texto = message.content[0].text.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

    let respuesta = JSON.parse(texto)
    respuesta = aplicarReglasDeNegocio(respuesta, subject, body)

    console.log('Sugerencia Claude tras reglas de negocio:', respuesta)

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