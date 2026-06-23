using IncidenciasService as service from '../../srv/service';

annotate service.Incidencias with @(
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Asunto',             Value: subject      },
        { $Type: 'UI.DataField', Label: 'Prioridad',          Value: priority     },
        { $Type: 'UI.DataField', Label: 'Categoría',          Value: category     },
        { $Type: 'UI.DataField', Label: 'Departamento',       Value: department   },
        { $Type: 'UI.DataField', Label: 'Estado',             Value: status       },
        { $Type: 'UI.DataField', Label: 'Revisión necesaria', Value: needs_review },
        { $Type: 'UI.DataField', Label: 'Tipo',               Value: type         }
    ],
    UI.Identification : [
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Responder con IA',
            Action : 'responderConIA'
        },
        {
            $Type  : 'UI.DataFieldForAction',
            Label  : 'Responder manualmente',
            Action : 'IncidenciasService.Incidencias/responderManualmente'
        }
    ],
    UI.FieldGroup #Principal : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            { $Type: 'UI.DataField', Label: 'Asunto',      Value: subject    },
            { $Type: 'UI.DataField', Label: 'Descripción', Value: body       },
            { $Type: 'UI.DataField', Label: 'Prioridad',   Value: priority   },
            { $Type: 'UI.DataField', Label: 'Tipo',        Value: type       }
        ]
    },
    UI.FieldGroup #ClasificacionIA : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            { $Type: 'UI.DataField', Label: 'Cola',               Value: queue             },
            { $Type: 'UI.DataField', Label: 'Departamento',       Value: department        },
            { $Type: 'UI.DataField', Label: 'Categoría',          Value: category          },
            { $Type: 'UI.DataField', Label: 'Revisión necesaria', Value: needs_review      },
            { $Type: 'UI.DataField', Label: 'Clasificado por IA', Value: ai_suggested      },
            { $Type: 'UI.DataField', Label: 'Justificación IA',        Value: ai_reason               },
            { $Type: 'UI.DataField', Label: 'Recomendación interna', Value: ai_recommendation      },
            { $Type: 'UI.DataField', Label: 'Respuesta sugerida al empleado', Value: ai_response_suggestion }
        ]
    },
    UI.FieldGroup #Seguimiento : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            { $Type: 'UI.DataField', Label: 'Estado',    Value: status    },
            { $Type: 'UI.DataField', Label: 'Creado el', Value: createdAt }
        ]
    },
    UI.FieldGroup #Resolucion : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            { $Type: 'UI.DataField', Label: 'Respuesta de RRHH', Value: hr_response },
            { $Type: 'UI.DataField', Label: 'Resuelto por',      Value: resolved_by },
            { $Type: 'UI.DataField', Label: 'Resuelto el',       Value: resolved_at }
        ]
    },
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'Principal',
            Label  : 'Información general',
            Target : '@UI.FieldGroup#Principal'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'ClasificacionIA',
            Label  : 'Clasificación y apoyo de IA',
            Target : '@UI.FieldGroup#ClasificacionIA'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'Seguimiento',
            Label  : 'Seguimiento',
            Target : '@UI.FieldGroup#Seguimiento'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'Resolucion',
            Label  : 'Resolución',
            Target : '@UI.FieldGroup#Resolucion'
        }
    ]
);

annotate service.Incidencias with actions {
    responderConIA @(
        Core.OperationAvailable : true,
        Common.SideEffects : {
            TargetProperties: ['hr_response', 'status', 'resolved_by', 'resolved_at']
        }
    );
    responderManualmente @(
        Core.OperationAvailable : true,
        Common.SideEffects : {
            TargetProperties: ['hr_response', 'status', 'resolved_by', 'resolved_at']
        }
    );
};