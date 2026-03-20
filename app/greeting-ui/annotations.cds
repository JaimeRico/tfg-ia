using IncidenciasService as service from '../../src/srv/service';

annotate service.Incidencias with @(
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Asunto',    Value: subject   },
        { $Type: 'UI.DataField', Label: 'Prioridad', Value: priority  },
        { $Type: 'UI.DataField', Label: 'Tipo',      Value: type      },
        { $Type: 'UI.DataField', Label: 'Cola',      Value: queue     },
        { $Type: 'UI.DataField', Label: 'Estado',    Value: status    },
        { $Type: 'UI.DataField', Label: 'Idioma',    Value: language  },
    ],
    UI.FieldGroup #Detalle : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            { $Type: 'UI.DataField', Label: 'Asunto',       Value: subject       },
            { $Type: 'UI.DataField', Label: 'Descripción',  Value: body          },
            { $Type: 'UI.DataField', Label: 'Prioridad',    Value: priority      },
            { $Type: 'UI.DataField', Label: 'Tipo',         Value: type          },
            { $Type: 'UI.DataField', Label: 'Cola',         Value: queue         },
            { $Type: 'UI.DataField', Label: 'Estado',       Value: status        },
            { $Type: 'UI.DataField', Label: 'Sugerido IA',  Value: ai_suggested  },
            { $Type: 'UI.DataField', Label: 'Confianza IA', Value: ai_confidence },
        ],
    },
    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'Detalle',
            Label  : 'Información de la incidencia',
            Target : '@UI.FieldGroup#Detalle',
        },
    ],
);
