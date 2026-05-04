using DashboardService as service from '../../srv/service';
annotate service.DashboardKPIs with @(
    UI.HeaderInfo : {
        TypeName       : 'KPI',
        TypeNamePlural : 'KPIs',
        Title          : { Value : ID }
    },
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Total',                Value: total },
        { $Type: 'UI.DataField', Label: 'Abiertas',             Value: abiertas },
        { $Type: 'UI.DataField', Label: 'Cerradas',             Value: cerradas },
        { $Type: 'UI.DataField', Label: 'Necesitan revisión',   Value: needsReview }
    ],
    UI.Identification : [
        { $Type: 'UI.DataField', Label: 'Total',              Value: total },
        { $Type: 'UI.DataField', Label: 'Abiertas',           Value: abiertas },
        { $Type: 'UI.DataField', Label: 'Cerradas',           Value: cerradas },
        { $Type: 'UI.DataField', Label: 'Necesitan revisión', Value: needsReview }
    ]
);

annotate service.DashboardPorDepartamento with @(
    UI.HeaderInfo : {
        TypeName       : 'Incidencia por departamento',
        TypeNamePlural : 'Incidencias por departamento',
        Title          : { Value : dimension }
    },
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Departamento', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',        Value: total }
    ],
    UI.Identification : [
        { $Type: 'UI.DataField', Label: 'Departamento', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',        Value: total }
    ]
);

annotate service.DashboardPorCategoria with @(
    UI.HeaderInfo : {
        TypeName       : 'Incidencia por categoría',
        TypeNamePlural : 'Incidencias por categoría',
        Title          : { Value : dimension }
    },
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Categoría', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',     Value: total }
    ],
    UI.Identification : [
        { $Type: 'UI.DataField', Label: 'Categoría', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',     Value: total }
    ]
);

annotate service.DashboardPorEstado with @(
    UI.HeaderInfo : {
        TypeName       : 'Incidencia por estado',
        TypeNamePlural : 'Incidencias por estado',
        Title          : { Value : dimension }
    },
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Estado', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',  Value: total }
    ],
    UI.Identification : [
        { $Type: 'UI.DataField', Label: 'Estado', Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total',  Value: total }
    ]
);

annotate service.DashboardPorMes with @(
    UI.HeaderInfo : {
        TypeName       : 'Incidencia por mes',
        TypeNamePlural : 'Incidencias por mes',
        Title          : { Value : dimension }
    },
    UI.LineItem : [
        { $Type: 'UI.DataField', Label: 'Mes',   Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total', Value: total }
    ],
    UI.Identification : [
        { $Type: 'UI.DataField', Label: 'Mes',   Value: dimension },
        { $Type: 'UI.DataField', Label: 'Total', Value: total }
    ]
);