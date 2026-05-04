const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const DATASET_PATH = path.join(
    process.cwd(),
    'db',
    'data',
    'raw',
    'aa_dataset-tickets-multi-lang-5-2-50-version.csv'
);

let ticketsDataset = [];
let datasetLoaded = false;

function loadDataset() {
    return new Promise((resolve, reject) => {
        if (datasetLoaded) {
            return resolve(ticketsDataset);
        }

        const results = [];

        fs.createReadStream(DATASET_PATH)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                ticketsDataset = results;
                datasetLoaded = true;
                console.log(`Dataset cargado: ${ticketsDataset.length} tickets`);
                resolve(ticketsDataset);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function textToWords(text) {
    return new Set(
        normalizeText(text)
            .split(' ')
            .filter(word => word.length > 2)
    );
}

function similarityScore(inputText, rowText) {
    const inputWords = textToWords(inputText);
    const rowWords = textToWords(rowText);

    let score = 0;
    for (const word of inputWords) {
        if (rowWords.has(word)) {
            score++;
        }
    }
    return score;
}

function findSimilarExamples(subject, body, language, limit = 3) {
    const inputText = `${subject} ${body}`.trim();

    return ticketsDataset
        .filter(row => {
            if (!language) return true;
            return (row.language || '').toLowerCase() === language.toLowerCase();
        })
        .map(row => {
            const rowText = `${row.subject || ''} ${row.body || ''}`.trim();

            return {
                row,
                score: similarityScore(inputText, rowText)
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.row);
}

function buildExamplesText(examples) {
    if (!examples.length) {
        return `
Ejemplos:
Ticket: {"subject": "Servidor caído en producción", "body": "El servicio de AWS no responde desde las 14:00 y afecta a todos los usuarios."}
Respuesta: {
  "priority": "high",
  "type": "Incident",
  "queue": "Technical Support",
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
  "queue": "Human Resources",
  "department": "Payroll",
  "category": "Functional",
  "reason": "La incidencia está relacionada con un proceso de negocio de nóminas, no con un fallo técnico.",
  "recommendation": "Revisar el estado del pago de la nómina y validar si existe incidencia administrativa o de procesamiento.",
  "needs_review": false
}`;
    }

    return `
Ejemplos:
${examples.map(example => `Ticket: {"subject": "${(example.subject || '').replace(/"/g, '\\"')}", "body": "${(example.body || '').replace(/"/g, '\\"')}"}
Respuesta: {
  "priority": "${example.priority || ''}",
  "type": "${example.type || ''}",
  "queue": "${example.queue || ''}",
  "department": "",
  "category": "",
  "reason": "",
  "recommendation": "",
  "needs_review": false
}`).join('\n\n')}
`;
}

function containsAny(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.some(keyword => normalized.includes(normalizeText(keyword)));
}

function aplicarReglasDeNegocio(respuesta, subject, body) {
    const fullText = `${subject || ''} ${body || ''}`;

    const technicalKeywords = [
        'login', 'acceso', 'permiso', 'permisos', 'rol', 'roles',
        'error', 'caido', 'caída', 'caida', 'produccion', 'producción',
        'portal', 'sistema', 'autenticacion', 'autenticación'
    ];

    const payrollKeywords = [
        'nomina', 'nómina', 'salario', 'pago', 'cobrado', 'abono'
    ];

    const hrKeywords = [
        'vacaciones', 'ausencia', 'empleado', 'rrhh',
        'recursos humanos', 'datos personales'
    ];

    const hasTechnical = containsAny(fullText, technicalKeywords);
    const hasPayroll = containsAny(fullText, payrollKeywords);
    const hasHR = containsAny(fullText, hrKeywords);

    const mixedFunctionalTechnical = (hasHR || hasPayroll) && hasTechnical;

    // Casos técnicos claros
    if (hasTechnical) {
        respuesta.category = 'Technical';
        respuesta.department = 'IT Support';

        if (!respuesta.queue || respuesta.queue === 'Human Resources') {
            respuesta.queue = 'Technical Support';
        }

        if (respuesta.type !== 'Incident' && respuesta.type !== 'Problem') {
            respuesta.type = 'Incident';
        }
    }

    // Casos de nómina
    if (hasPayroll) {
        respuesta.category = 'Functional';
        respuesta.department = 'Payroll';

        if (!respuesta.queue || respuesta.queue === 'Technical Support') {
            respuesta.queue = 'Human Resources';
        }

        if (respuesta.type !== 'Request' && respuesta.type !== 'Incident') {
            respuesta.type = 'Request';
        }
    }

    // Casos funcionales de RRHH
    if (hasHR && !hasPayroll && !hasTechnical) {
        respuesta.category = 'Functional';
        respuesta.department = 'Human Resources';

        if (!respuesta.queue) {
            respuesta.queue = 'Human Resources';
        }
    }

    // Incoherencias
    const inconsistentTechnicalPayroll =
        respuesta.category === 'Technical' && respuesta.department === 'Payroll';

    const inconsistentFunctionalIT =
        respuesta.category === 'Functional' &&
        respuesta.department === 'IT Support' &&
        !hasTechnical;

    if (inconsistentTechnicalPayroll || inconsistentFunctionalIT) {
        respuesta.needs_review = true;
    }

    // Casos mixtos funcional + técnico => revisión humana
    if (mixedFunctionalTechnical) {
        respuesta.needs_review = true;
    }

    // Casos técnicos claros: solo si NO hay mezcla funcional
    if (
        hasTechnical &&
        !hasHR &&
        !hasPayroll &&
        respuesta.department === 'IT Support' &&
        respuesta.category === 'Technical'
    ) {
        respuesta.needs_review = false;
    }

    // Casos de nómina claros: solo si NO hay mezcla técnica
    if (
        hasPayroll &&
        !hasTechnical &&
        respuesta.department === 'Payroll' &&
        respuesta.category === 'Functional'
    ) {
        respuesta.needs_review = false;
    }

    // Casos RRHH claros: solo si NO hay mezcla técnica
    if (
        hasHR &&
        !hasTechnical &&
        !hasPayroll &&
        respuesta.department === 'Human Resources' &&
        respuesta.category === 'Functional'
    ) {
        respuesta.needs_review = false;
    }

    // Valor defensivo por defecto
    if (typeof respuesta.needs_review !== 'boolean') {
        respuesta.needs_review = true;
    }

    return respuesta;
}

async function sugerirConIA(req) {
    const { subject, body, language } = req.data;

    await loadDataset();

    const similarExamples = findSimilarExamples(subject, body, language, 3);
    const examplesText = buildExamplesText(similarExamples);

    console.log('Nueva incidencia recibida:', subject);
    console.log('Ejemplos similares encontrados:', similarExamples.length);
    console.log('Llamando a Claude API...');

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
- Usa los ejemplos anteriores como referencia, pero clasifica según el contenido del ticket actual.
- Usa "Functional" cuando el problema pertenezca al proceso de negocio y pueda interpretarse funcionalmente.
- Usa "Technical" cuando se trate de accesos, roles, errores del sistema, caídas, permisos o problemas de infraestructura.
- Si el caso es ambiguo o falta contexto, marca "needs_review": true.
- "reason" debe ser breve y clara.
- "recommendation" debe ser una recomendación inicial útil para un gestor humano.
- Responde solo con JSON válido.

Ticket a clasificar:
{"subject": "${subject}", "body": "${body}"}

Respuesta:`;

    const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
    });

    const texto = message.content[0].text.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    let respuesta = JSON.parse(texto);

    respuesta = aplicarReglasDeNegocio(respuesta, subject, body);

    console.log('Sugerencia Claude tras reglas de negocio:', respuesta);

    req.data.priority          = respuesta.priority;
    req.data.type              = respuesta.type;
    req.data.queue             = respuesta.queue;
    req.data.department        = respuesta.department;
    req.data.category          = respuesta.category;
    req.data.ai_reason         = respuesta.reason;
    req.data.ai_recommendation = respuesta.recommendation;
    req.data.needs_review      = respuesta.needs_review;
    req.data.ai_suggested      = true;
}

module.exports = { sugerirConIA };