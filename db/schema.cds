namespace tfg;
using { cuid, managed } from '@sap/cds/common';

type Priority : String enum {
    high;
    medium;
    low;
}

type TicketType : String enum {
    Incident;
    Request;
    Change;
    Problem;
}
type Queue : String enum {
    TechnicalSupport    = 'Technical Support';
    CustomerService     = 'Customer Service';
    ITSupport           = 'IT Support';
    ProductSupport      = 'Product Support';
    BillingAndPayments  = 'Billing and Payments';
    ServiceOutages      = 'Service Outages and Maintenance';
    GeneralInquiry      = 'General Inquiry';
    ReturnsAndExchanges = 'Returns and Exchanges';
    SalesAndPreSales    = 'Sales and Pre-Sales';
    HumanResources      = 'Human Resources';
}
type Department : String enum {
    Payroll              = 'Payroll';
    HumanResources       = 'Human Resources';
    ITSupport            = 'IT Support';
    Finance              = 'Finance';
    Sales                = 'Sales';
    CustomerCare         = 'Customer Care';
    GeneralAdministration = 'General Administration';
}

type IncidentCategory : String enum {
    Functional;
    Technical;
}

entity Incidencias : cuid, managed {
    subject            : String(500);
    body               : LargeString;

    priority           : Priority;
    type               : TicketType;
    queue              : Queue;
    department         : Department;
    category           : IncidentCategory;

    language           : String(5);
    status             : String enum {
        nuevo;
        respondido;
        asignado;
        en_progreso;
        cerrado;
    } default 'nuevo';

    ai_suggested       : Boolean default false;
    ai_reason          : String(1000);
    ai_recommendation  : String(1500);
    needs_review       : Boolean default false;
}